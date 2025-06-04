// YourAppsList.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import showAlert from '../utils/AlertUtils';
import MessageModal from './MessageModal';
import {useStatus} from '../providers/AugmentOSStatusProvider';
import BackendServerComms from '../backend_comms/BackendServerComms';
import {loadSetting, saveSetting} from '../logic/SettingsHelper';
import {SETTINGS_KEYS} from '../consts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AppIcon from './AppIcon';
import {NavigationProps} from './types';
import {useAppStatus} from '../providers/AppStatusProvider';
import { useTranslation } from 'react-i18next';

interface YourAppsListProps {
  isDarkTheme: boolean;
}

const YourAppsList: React.FC<YourAppsListProps> = ({isDarkTheme}) => {
  const {
    appStatus,
    refreshAppStatus,
    optimisticallyStartApp,
    optimisticallyStopApp,
    clearPendingOperation,
    isSensingEnabled,
  } = useAppStatus();
  const navigation = useNavigation<NavigationProps>();
  const [_isLoading, setIsLoading] = React.useState(false);
  const [onboardingModalVisible, setOnboardingModalVisible] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [inLiveCaptionsPhase, setInLiveCaptionsPhase] = useState(false);
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  const [showOnboardingTip, setShowOnboardingTip] = useState(false);
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  const [containerWidth, setContainerWidth] = React.useState(0);
  const arrowAnimation = React.useRef(new Animated.Value(0)).current;

  // Reference for the Live Captions list item
  const liveCaptionsRef = useRef<any>(null);
  // State to store Live Captions item position
  const [liveCaptionsPosition, setLiveCaptionsPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    index: 0,
  });

  // Constants for grid item sizing
  const GRID_MARGIN = 6; // Total horizontal margin per item (left + right)
  const numColumns = 4; // Desired number of columns

  // Calculate the item width based on container width and margins
  const itemWidth =
    containerWidth > 0
      ? (containerWidth - GRID_MARGIN * numColumns) / numColumns
      : 0;

  const textColor = isDarkTheme ? '#FFFFFF' : '#000000';

  const backendComms = BackendServerComms.getInstance();

  const { t } = useTranslation(['home']);

  // console.log('%%% appStatus', appStatus);

  // Check onboarding status whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkOnboardingStatus = async () => {
        const completed = await loadSetting(
          SETTINGS_KEYS.ONBOARDING_COMPLETED,
          true,
        );
        setOnboardingCompleted(completed);

        if (!completed) {
          setOnboardingModalVisible(true);
          setShowSettingsHint(false); // Hide settings hint during onboarding
          setShowOnboardingTip(true);
        } else {
          setShowOnboardingTip(false);

          // If onboarding is completed, check how many times settings have been accessed
          const settingsAccessCount = await loadSetting(
            SETTINGS_KEYS.SETTINGS_ACCESS_COUNT,
            0,
          );
          // Only show hint if they've accessed settings less than 1 times
          setShowSettingsHint(settingsAccessCount < 1);
        }
      };

      checkOnboardingStatus();
    }, []),
  );

  // Set arrow to static position (no animation)
  useEffect(() => {
    // Just set to a fixed value instead of animating
    if (showOnboardingTip) {
      arrowAnimation.setValue(0.5); // Middle value for static appearance
    } else {
      arrowAnimation.setValue(0);
    }
  }, [showOnboardingTip]);

  // Check if onboarding is completed on initial load
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await loadSetting(
        SETTINGS_KEYS.ONBOARDING_COMPLETED,
        true,
      );
      setOnboardingCompleted(completed);
      setShowOnboardingTip(!completed);
    };

    checkOnboardingStatus();
  }, []);

  // Add animation effect when onboarding tip is shown
  useEffect(() => {
    if (showOnboardingTip) {
      // Bounce animation with reduced movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      bounceAnim.setValue(0);
      pulseAnim.setValue(0);
    }
  }, [showOnboardingTip]);

  // Measure Live Captions position when onboarding tip should be shown
  useEffect(() => {
    if (showOnboardingTip && liveCaptionsRef.current) {
      // Allow layout to complete, then measure
      setTimeout(() => {
        liveCaptionsRef?.current?.measure(
          (
            x: number,
            y: number,
            width: number,
            height: number,
            pageX: number,
            pageY: number,
          ) => {
            setLiveCaptionsPosition({
              x: pageX,
              y: pageY,
              width,
              height,
              index: liveCaptionsPosition.index,
            });
          },
        );
      }, 100);
    }
  }, [showOnboardingTip, liveCaptionsRef.current, appStatus]);

  const completeOnboarding = () => {
    saveSetting(SETTINGS_KEYS.ONBOARDING_COMPLETED, true);
    setOnboardingCompleted(true);
    setShowOnboardingTip(false);
    setInLiveCaptionsPhase(false); // Reset any live captions phase state

    // Make sure to post an update to ensure all components re-render
    // This is important to immediately hide any UI elements that depend on these states
    setTimeout(() => {
      // Force a re-render by setting state again
      setShowOnboardingTip(false);
      setShowSettingsHint(true);
    }, 100);
  };

  const startApp = async (packageName: string) => {
    if (!onboardingCompleted) {
      if (
        packageName !== 'com.augmentos.livecaptions' &&
        packageName !== 'cloud.augmentos.live-captions'
      ) {
        showAlert(
          t('YourAppsList.Complete Onboarding'),
          t('YourAppsList.Please tap the Live Captions app to complete the onboarding process'),
          [{text: t('OK')}],
          {
            isDarkTheme,
            iconName: 'information-outline',
          },
        );
        return;
      } else {
        completeOnboarding();
      }
    }

    // Optimistically update UI
    optimisticallyStartApp(packageName);

    // Find the app we're trying to start
    const appToStart = appStatus.find(app => app.packageName === packageName);

    console.log('fdsds####3333');
    console.log('@@@ appStatus', appStatus);
    console.log('@@@ appToStart', appToStart);

    console.log('@@@ appToStart.name', appToStart?.name);
    console.log('@@@ appToStart.tpaType', appToStart?.tpaType);

    // Check if it's a standard app
    if (appToStart?.tpaType === 'standard') {
      console.log('% appToStart', appToStart);
      // Find any running standard apps
      const runningStandardApps = appStatus.filter(
        app =>
          app.is_running &&
          app.tpaType === 'standard' &&
          app.packageName !== packageName,
      );

      console.log('%%% runningStandardApps', runningStandardApps);

      // If there's any running standard app, stop it first
      for (const runningApp of runningStandardApps) {
        // Optimistically update UI
        optimisticallyStopApp(runningApp.packageName);

        try {
          console.log('%%% stopping app', runningApp.packageName);
          await backendComms.stopApp(runningApp.packageName);
          clearPendingOperation(runningApp.packageName);
        } catch (error) {
          console.error('stop app error:', error);
          refreshAppStatus();
        }
      }
    }

    // Start the operation in the background
    setIsLoading(true);
    try {
      console.log('%%% starting app', packageName);
      await backendComms.startApp(packageName);
      // Clear the pending operation since it completed successfully
      clearPendingOperation(packageName);

      if (
        !onboardingCompleted &&
        packageName === 'com.augmentos.livecaptions'
      ) {
        // If this is the Live Captions app, make sure we've hidden the tip
        setShowOnboardingTip(false);

        setTimeout(() => {
          showAlert(
            t('YourAppsList.Try Live Captions'),
            t('YourAppsList.Start talking now to see your speech transcribed on your glasses in real-time'),
            [{text: t('OK')}],
            {
              isDarkTheme,
              iconName: 'microphone',
            },
          );
        }, 500);
      }
    } catch (error) {
      // Revert the app state when there's an error starting the app
      console.error('start app error:', error);

      // Clear the pending operation for this app
      clearPendingOperation(packageName);
      // Refresh the app status to move the app back to inactive
      refreshAppStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const openAppSettings = (app: any) => {
    navigation.navigate('AppSettings', {
      packageName: app.packageName,
      appName: app.name,
    });
  };

  const renderOnboardingArrow = () => {
    if (!showOnboardingTip) {
      return null;
    }

    return (
      <View
        style={[
          styles.arrowContainer,
          {
            position: 'absolute',
            top:
              liveCaptionsPosition.index * (liveCaptionsPosition.height + 10) -
              40,
          },
        ]}>
        <View style={styles.arrowWrapper}>
          <Animated.View
            style={[
              styles.arrowBubble,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.03],
                    }),
                  },
                ],
                backgroundColor: '#00B0FF',
                borderColor: '#0288D1',
                shadowColor: '#0288D1',
                shadowOpacity: 0.4,
              },
            ]}>
            <Text
              style={[
                styles.arrowBubbleText,
                {
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                },
              ]}>
              {t('YourAppsList.Tap to start')}
            </Text>
            <Icon
              name="gesture-tap"
              size={20}
              color="#FFFFFF"
              style={[
                styles.bubbleIcon,
                {
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                },
              ]}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.arrowIconContainer,
              isDarkTheme
                ? styles.arrowIconContainerDark
                : styles.arrowIconContainerLight,
              {
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
                backgroundColor: '#00B0FF',
                borderColor: '#0288D1',
                marginTop: 5,
                shadowColor: '#0288D1',
                shadowOpacity: 0.4,
              },
            ]}>
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.5],
                  }),
                  backgroundColor: 'rgba(0, 176, 255, 0.3)',
                },
              ]}
            />
            <Icon
              name="arrow-down-bold"
              size={30}
              color="#FFFFFF"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: {width: 0, height: 1},
                textShadowRadius: 3,
              }}
            />
          </Animated.View>
        </View>
      </View>
    );
  };

  // Filter out duplicate apps and running apps
  let availableApps = appStatus.filter(app => {
    if (app.is_running) {
      return false;
    }
    // Check if this is the first occurrence of this package name
    const firstIndex = appStatus.findIndex(
      a => a.packageName === app.packageName,
    );
    return firstIndex === appStatus.indexOf(app);
  });

  // remove the notify app on iOS
  if (Platform.OS === 'ios') {
    availableApps = availableApps.filter(
      app => app.packageName !== 'cloud.augmentos.notify' && app.name !== 'Notify',
    );
  }
  // alphabetically sort the available apps
  availableApps.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <View style={styles.appsContainer}>
      <View style={styles.titleContainer}>
        <Text style={[styles.sectionTitle, {color: textColor}]}>
          {t('YourAppsList.Inactive Apps')}
        </Text>
      </View>

      {renderOnboardingArrow()}

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {availableApps.map((app, index) => {
          let isLiveCaptions = app.packageName === 'com.augmentos.livecaptions';
          let ref = isLiveCaptions ? liveCaptionsRef : null;
          if (isLiveCaptions && liveCaptionsPosition.index !== index) {
            setLiveCaptionsPosition({
              x: liveCaptionsPosition.x,
              y: liveCaptionsPosition.y,
              width: liveCaptionsPosition.width,
              height: liveCaptionsPosition.height,
              index: index,
            });
          }
          return (
            <TouchableOpacity
              key={app.packageName}
              onPress={() => startApp(app.packageName)}
              onLongPress={() => openAppSettings(app)}
              delayLongPress={500}
              style={styles.appItem}
              ref={ref}>
              <View style={styles.appContent}>
                <AppIcon
                  app={app}
                  isDarkTheme={isDarkTheme}
                  onClick={() => startApp(app.packageName)}
                  style={styles.appIconStyle}
                />
                <Text style={[styles.appName, {color: textColor}]}>
                  {app.name || 'Convoscope'}
                </Text>
                <TouchableOpacity
                  onPress={() => openAppSettings(app)}
                  style={styles.settingsButton}>
                  <Icon name="cog-outline" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  appsContainer: {
    marginTop: -8,
    marginBottom: 0,
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 0,
    paddingLeft: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
    lineHeight: 22,
    letterSpacing: 0.38,
    marginBottom: 10,
  },
  adjustableText: {
    minHeight: 0,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  listContainer: {
    gap: 4,
  },
  appItem: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 11, // Match RunningAppsList padding
    marginBottom: 9,
  },
  appContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40, // Match RunningAppsList minHeight
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tipText: {
    marginLeft: 5,
    fontSize: 14,
  },
  appTextContainer: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  appName: {
    flex: 1,
    fontSize: 17, // Match RunningAppsList fontSize
    fontWeight: '500',
    marginLeft: 8,
  },
  settingsButton: {
    padding: 50,
    margin: -46,
  },
  appIconStyle: {
    width: 50, // Match RunningAppsList icon size
    height: 50, // Match RunningAppsList icon size
  },
  arrowContainer: {
    position: 'absolute',
    top: -90,
    zIndex: 10,
    alignItems: 'center',
    marginLeft: 20,
  },
  arrowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBubble: {
    backgroundColor: '#00B0FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0288D1',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#0288D1',
  },
  arrowBubbleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  bubbleIcon: {
    marginLeft: 2,
  },
  arrowIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0288D1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#0288D1',
  },
  arrowIconContainerLight: {
    backgroundColor: '#00B0FF',
  },
  arrowIconContainerDark: {
    backgroundColor: '#00B0FF',
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 23,
    backgroundColor: 'rgba(0, 176, 255, 0.3)',
  },
  settingsHintContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  sensingWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#E65100',
    flex: 1,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  settingsButtonBlue: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 0,
  },
  settingsButtonTextBlue: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 38, // Account for nav bar height + iOS home indicator
  },
});

export default YourAppsList;
