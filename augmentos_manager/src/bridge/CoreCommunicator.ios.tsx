import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { EventEmitter } from 'events';
import GlobalEventEmitter from '../logic/GlobalEventEmitter';
import { INTENSE_LOGGING } from '../consts';
import { isAugmentOsCoreInstalled, isLocationServicesEnabled as checkLocationServices, startExternalService } from './CoreServiceStarter';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BleManager from 'react-native-ble-manager';

const { CoreCommsService, AOSModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(CoreCommsService);

export class CoreCommunicator extends EventEmitter {
  private static instance: CoreCommunicator | null = null;
  private messageEventSubscription: any = null;
  private validationInProgress: Promise<boolean | void> | null = null;
  private reconnectionTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  
  // Utility methods for checking permissions and device capabilities
  async isBluetoothEnabled(): Promise<boolean> {
    try {
      console.log('Checking Bluetooth state...');
      await BleManager.start({ showAlert: false });
      const state = await BleManager.checkState();
      console.log('Bluetooth state:', state);
      return state === 'on';
    } catch (error) {
      console.error('Error checking Bluetooth state:', error);
      return false;
    }
  }

  async isLocationPermissionGranted(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return result === RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        // iOS doesn't require location permission for BLE scanning since iOS 13
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }
  
  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Use our native module to check if location services are enabled
        const locationServicesEnabled = await checkLocationServices();
        console.log('Location services enabled (native check):', locationServicesEnabled);
        return locationServicesEnabled;
      } else if (Platform.OS === 'ios') {
        // iOS doesn't require location for BLE scanning since iOS 13
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error checking if location services are enabled:', error);
      return false;
    }
  }

  async checkConnectivityRequirements(): Promise<{isReady: boolean, message?: string}> {
    console.log('Checking connectivity requirements');
    
    // On iOS, we'll assume Bluetooth is available initially to avoid premature permissions
    // The actual check will happen during the scanning process
    if (Platform.OS === 'ios') {
      return { isReady: true };
    }
    
    // For Android, still check Bluetooth
    const isBtEnabled = await this.isBluetoothEnabled();
    console.log('Is Bluetooth enabled:', isBtEnabled);
    if (!isBtEnabled) {
      console.log('Bluetooth is disabled, showing error');
      return { 
        isReady: false, 
        message: 'Bluetooth is required to connect to glasses. Please enable Bluetooth and try again.' 
      };
    }
    
    // Only check location on Android
    if (Platform.OS === 'android') {
      // First check if location permission is granted
      const isLocationPermissionGranted = await this.isLocationPermissionGranted();
      console.log('Is Location permission granted:', isLocationPermissionGranted);
      if (!isLocationPermissionGranted) {
        console.log('Location permission missing, showing error');
        return {
          isReady: false,
          message: 'Location permission is required to scan for glasses on Android. Please grant location permission and try again.'
        };
      }
      
      // Then check if location services are enabled
      const isLocationServicesEnabled = await this.isLocationServicesEnabled();
      console.log('Are Location services enabled:', isLocationServicesEnabled);
      if (!isLocationServicesEnabled) {
        console.log('Location services disabled, showing error');
        return {
          isReady: false,
          message: 'Location services are disabled. Please enable location services in your device settings and try again.'
        };
      }
    }
    
    console.log('All requirements met');
    return { isReady: true };
  }
  
  // Private constructor to enforce singleton pattern
  private constructor() {
    super();
  }

  /**
   * Gets the singleton instance of CoreCommunicator
   */
  public static getInstance(): CoreCommunicator {
    if (!CoreCommunicator.instance) {
      CoreCommunicator.instance = new CoreCommunicator();
    }
    return CoreCommunicator.instance;
  }

  /**
   * Initializes the communication channel with Core
   */
  async initialize() {
    // Initialize BleManager for permission checks
    try {
      await BleManager.start({ showAlert: false });
    } catch (error) {
      console.warn('Failed to initialize BleManager:', error);
    }

    // AOSModule.sendCommand(JSON.stringify({ "command": "request_status" }));
    setTimeout(() => {
      AOSModule.sendCommand(JSON.stringify({ "command": "connect_wearable" }));
    }, 2000);

    // setTimeout(() => {
    //   AOSModule.sendCommand(JSON.stringify({ "command": "connect_wearable" }));
    // }, 10000);

    
    // Start the Core service if it's not already running
    // TODO: ios (this isn't actually needed I don't think)
    // if (!(await CoreCommsService.isServiceRunning())) {
    //   CoreCommsService.startService();
    // }
    
    // Start the external service
    startExternalService();
    
    // Initialize message event listener
    this.initializeMessageEventListener();
    
    // Start periodic status checks
    this.startStatusPolling();
    
    // Request initial status
    this.sendRequestStatus();
  }

  /**
   * Initializes the event listener for Core messages
   */
  private initializeMessageEventListener() {
    // Remove any existing subscription to avoid duplicates
    if (this.messageEventSubscription) {
      this.messageEventSubscription.remove();
      this.messageEventSubscription = null;
    }

    // Create a fresh subscription
    this.messageEventSubscription = eventEmitter.addListener(
      'CoreMessageEvent',
      this.handleCoreMessage.bind(this)
    );
    
    console.log('Core message event listener initialized');
  }

  /**
   * Handles incoming messages from Core
   */
  private handleCoreMessage(jsonString: string) {
    if (INTENSE_LOGGING) {
      console.log('Received message from core:', jsonString);
    }
    
    try {
      const data = JSON.parse(jsonString);
      this.isConnected = true;
      this.emit('dataReceived', data);
      this.parseDataFromCore(data);
    } catch (e) {
      console.error('Failed to parse JSON from core message:', e);
      console.log(jsonString);
    }
  }

  /**
   * Parses various types of data received from Core
   */
  private parseDataFromCore(data: any) {
    if (!data) return;
    
    try {
      if ('status' in data) {
        this.emit('statusUpdateReceived', data);
      } else if ('glasses_display_event' in data) {
        GlobalEventEmitter.emit('GLASSES_DISPLAY_EVENT', data.glasses_display_event);
      } else if ('ping' in data) {
        // Heartbeat response - nothing to do
      } else if ('notify_manager' in data) {
        GlobalEventEmitter.emit('SHOW_BANNER', { 
          message: data.notify_manager.message, 
          type: data.notify_manager.type 
        });
      } else if ('compatible_glasses_search_result' in data) {
        GlobalEventEmitter.emit('COMPATIBLE_GLASSES_SEARCH_RESULT', { 
          modelName: data.compatible_glasses_search_result.model_name, 
          deviceName: data.compatible_glasses_search_result.device_name 
        });
      } else if ('compatible_glasses_search_stop' in data) {
        GlobalEventEmitter.emit('COMPATIBLE_GLASSES_SEARCH_STOP', { 
          modelName: data.compatible_glasses_search_stop.model_name 
        });
      } else if ('need_permissions' in data) {
        GlobalEventEmitter.emit('NEED_PERMISSIONS');
      }
    } catch (e) {
      console.error('Error parsing data from Core:', e);
      GlobalEventEmitter.emit('STATUS_PARSE_ERROR');
    }
  }

  /**
   * Starts periodic status polling to maintain connection
   */
  private startStatusPolling() {
    this.stopStatusPolling();
    
    const pollStatus = () => {
      this.sendRequestStatus();
      this.reconnectionTimer = setTimeout(
        pollStatus,
        this.isConnected ? 999000 : 2000 // Poll more frequently when not connected
      );
    };
    
    pollStatus();
  }

  /**
   * Stops the status polling timer
   */
  private stopStatusPolling() {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
  }

  /**
   * Validates that Core is responding to commands
   */
  private async validateResponseFromCore(): Promise<boolean> {
    if (this.validationInProgress || await isAugmentOsCoreInstalled()) {
      return this.validationInProgress ?? true;
    }

    this.validationInProgress = new Promise<boolean>((resolve, reject) => {
      const dataReceivedListener = () => {
        resolve(true);
      };

      this.once('dataReceived', dataReceivedListener);

      setTimeout(() => {
        this.removeListener('dataReceived', dataReceivedListener);
        resolve(false);
      }, 4500);
    }).then((result) => {
      this.validationInProgress = null;
      return result;
    });

    return this.validationInProgress;
  }

  /**
   * Sends data to Core
   */
  private async sendData(dataObj: any) {
    try {
      if (INTENSE_LOGGING) {
        console.log('Sending data to Core:', JSON.stringify(dataObj));
      }
      
      // Ensure the service is running
      // if (!(await CoreCommsService.isServiceRunning())) {
      //   CoreCommsService.startService();
      // }
      
      // Send the command
      AOSModule.sendCommand(JSON.stringify(dataObj));
      
    } catch (error) {
      console.error('Failed to send data to Core:', error);
      GlobalEventEmitter.emit('SHOW_BANNER', { 
        message: `Error sending command to Core: ${error}`, 
        type: 'error' 
      });
    }
  }

  /**
   * Cleans up resources and resets the state
   */
  public cleanup() {
    // Stop the status polling
    this.stopStatusPolling();
    
    // Remove message event listener
    if (this.messageEventSubscription) {
      this.messageEventSubscription.remove();
      this.messageEventSubscription = null;
    }
    
    // Reset connection state
    this.isConnected = false;
    
    // Reset the singleton instance
    CoreCommunicator.instance = null;
    
    console.log('CoreCommunicator cleaned up');
  }

  /* Command methods to interact with Core */

  async sendRequestStatus() {
    await this.sendData({ command: 'request_status' });
    return this.validateResponseFromCore();
  }

  async sendHeartbeat() {
    await this.sendData({ command: 'ping' });
    return this.validateResponseFromCore();
  }

  async sendSearchForCompatibleDeviceNames(modelName: string) {
    return await this.sendData({
      command: 'search_for_compatible_device_names',
      params: {
        model_name: modelName
      }
    });
  }

  async sendConnectWearable(modelName: string, deviceName: string = "") {
    return await this.sendData({
      command: 'connect_wearable',
      params: {
        model_name: modelName,
        device_name: deviceName
      }
    });
  }

  async sendPhoneNotification(appName: string = "", title: string = "", text: string = "", timestamp: number = -1, uuid: string = "") {
    return await this.sendData({
      command: 'phone_notification',
      params: {
        appName: appName,
        title: title,
        text: text,
        timestamp: timestamp,
        uuid: uuid
      }
    });
  }

  async sendDisconnectWearable() {
    return await this.sendData({ command: 'disconnect_wearable' });
  }

  async sendForgetSmartGlasses() {
    return await this.sendData({ command: 'forget_smart_glasses' });
  }

  async sendToggleVirtualWearable(enabled: boolean) {
    return await this.sendData({
      command: 'enable_virtual_wearable',
      params: {
        enabled: enabled,
      },
    });
  }

  async sendToggleSensing(enabled: boolean) {
    return await this.sendData({
      command: 'enable_sensing',
      params: {
        enabled: enabled,
      },
    });
  }

  async sendToggleForceCoreOnboardMic(enabled: boolean) {
    return await this.sendData({
      command: 'force_core_onboard_mic',
      params: {
        enabled: enabled,
      },
    });
  }

  async sendToggleContextualDashboard(enabled: boolean) {
    return await this.sendData({
      command: 'enable_contextual_dashboard',
      params: {
        enabled: enabled,
      },
    });
  }

  async sendToggleBypassVadForDebugging(enabled: boolean) {
    return await this.sendData({
      command: 'bypass_vad_for_debugging',
      params: {
        enabled: enabled,
      },
    });
  }

  async sendToggleBypassAudioEncodingForDebugging(enabled: boolean) {
    return await this.sendData({
      command: 'bypass_audio_encoding_for_debugging',
      params: {
        enabled: enabled,
      },
    });
  }

  async sendToggleAlwaysOnStatusBar(enabled: boolean) {
    console.log('sendToggleAlwaysOnStatusBar');
    return await this.sendData({
      command: 'enable_always_on_status_bar',
      params: {
        enabled: enabled,
      },
    });
  }


  async setGlassesBrightnessMode(brightness: number, autoBrightness: boolean) {
    return await this.sendData({
      command: 'update_glasses_brightness',
      params: {
        brightness: brightness,
        autoLight: autoBrightness,
      },
    });
  }

  async setGlassesHeadUpAngle(headUpAngle: number) {
    return await this.sendData({
      command: 'update_glasses_headUp_angle',
      params: {
        headUpAngle: headUpAngle,
      },
    });
  }

  async setGlassesDashboardHeight(dashboardHeight: number) {
    return await this.sendData({
      command: 'update_glasses_dashboard_height',
      params: { height: dashboardHeight },
    });
  }

  async startAppByPackageName(packageName: string) {
    await this.sendData({
      command: 'start_app',
      params: {
        target: packageName,
        repository: packageName,
      },
    });
    return this.validateResponseFromCore();
  }

  async stopAppByPackageName(packageName: string) {
    await this.sendData({
      command: 'stop_app',
      params: {
        target: packageName,
      },
    });
    return this.validateResponseFromCore();
  }

  async installAppByPackageName(packageName: string) {
    await this.sendData({
      command: 'install_app_from_repository',
      params: {
        target: packageName,
      },
    });
    return this.validateResponseFromCore();
  }

  async sendRequestAppDetails(packageName: string) {
    return await this.sendData({
      command: 'request_app_info',
      params: {
        'target': packageName
      }
    });
  }

  async sendUpdateAppSetting(packageName: string, settingsDeltaObj: any) {
    return await this.sendData({
      command: 'update_app_settings',
      params: {
        target: packageName,
        settings: settingsDeltaObj
      }
    });
  }

  async sendUninstallApp(packageName: string) {
    return await this.sendData({
      command: 'uninstall_app',
      params: {
        target: packageName
      }
    });
  }

  async setAuthenticationSecretKey(userId: string, authSecretKey: string) {
    return await this.sendData({
      command: 'set_auth_secret_key',
      params: {
        userId: userId,
        authSecretKey: authSecretKey,
      },
    });
  }

  async verifyAuthenticationSecretKey() {
    return await this.sendData({
      command: 'verify_auth_secret_key',
    });
  }

  async deleteAuthenticationSecretKey() {
    return await this.sendData({
      command: 'delete_auth_secret_key',
    });
  }

  async startService() {
    // TODO: ios
    // CoreCommsService.startService();
  }

  async stopService() {
    // TODO: ios
    // CoreCommsService.stopService();
  }
}

// Create and export the singleton instance
const coreCommunicator = CoreCommunicator.getInstance();
export default coreCommunicator;