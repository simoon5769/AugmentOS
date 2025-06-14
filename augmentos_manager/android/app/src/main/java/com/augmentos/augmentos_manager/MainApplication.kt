package com.augmentos.augmentos_manager

import android.app.Application
import com.BV.LinearGradient.LinearGradientPackage
import com.augmentos.augmentos_manager.logcapture.LogcatCapturePackage
import com.facebook.flipper.android.AndroidFlipperClient
import com.facebook.flipper.android.utils.FlipperUtils
import com.facebook.flipper.plugins.inspector.DescriptorMapping
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.modules.network.CustomClientBuilder
import com.facebook.react.modules.network.NetworkingModule
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import com.horcrux.svg.SvgPackage
import com.lugg.RNCConfig.RNCConfigPackage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage
import com.reactnativecommunity.slider.ReactSliderPackage
import com.reactnativecommunity.webview.RNCWebViewPackage
import com.swmansion.gesturehandler.RNGestureHandlerPackage
import com.swmansion.reanimated.ReanimatedPackage
import com.swmansion.rnscreens.RNScreensPackage
import com.th3rdwave.safeareacontext.SafeAreaContextPackage
import com.zoontek.rnpermissions.RNPermissionsPackage
import it.innove.BleManagerPackage
import kjd.reactnative.bluetooth.RNBluetoothClassicPackage
import org.reactnative.camera.RNCameraPackage
import com.zoontek.rnlocalize.RNLocalizePackage

// import com.augmentos.augmentos_manager.NotificationServicePackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost = object : ReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean {
            return BuildConfig.DEBUG
        }

        override fun getPackages(): List<ReactPackage> {
            return listOf(
                MainReactPackage(),
                RNLocalizePackage(),
                RNBluetoothClassicPackage(),
                BleManagerPackage(),
                ReanimatedPackage(),
                RNScreensPackage(),
                SafeAreaContextPackage(),
                LinearGradientPackage(),
                RNGestureHandlerPackage(),
                RNPermissionsPackage(),
                CoreCommsServicePackage(), // New Core Communications Package
                CoreServiceStarterPackage(),
                AsyncStoragePackage(),
                SvgPackage(),
                NotificationServicePackage(),
                InstallApkPackage(),
                ReactSliderPackage(),
                NotificationAccessPackage(),
                TpaHelpersPackage(),
                FetchConfigHelperPackage(),
                RNCConfigPackage(),
                RNCameraPackage(),
                LogcatCapturePackage(),
                RNCWebViewPackage(),
            )
        }

        override fun getJSMainModuleName(): String {
            return "index"
        }
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, /* native exopackage */ false)

        if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(this)) {
            val client = AndroidFlipperClient.getInstance(this)
            client.addPlugin(InspectorFlipperPlugin(this, DescriptorMapping.withDefaults()))

            // 添加网络插件
            val networkFlipperPlugin: NetworkFlipperPlugin = NetworkFlipperPlugin()
            client.addPlugin(networkFlipperPlugin)

            // 注册网络拦截器
            NetworkingModule.setCustomClientBuilder { builder ->
                builder.addNetworkInterceptor(
                    FlipperOkhttpInterceptor(networkFlipperPlugin)
                )
            }

            client.start()
        }

        /*
                // Register a listener to set up notificationReceiver once React context is available
                reactNativeHost.reactInstanceManager.addReactInstanceEventListener(
                    object : ReactInstanceEventListener {
                        override fun onReactContextInitialized(reactContext: ReactContext) {
                            val notificationReceiver = NotificationReceiver(reactContext)
                            val filter = IntentFilter("NOTIFICATION_LISTENER")
                            LocalBroadcastManager.getInstance(this@MainApplication)
                                .registerReceiver(notificationReceiver, filter)
                        }
                    }
                )*/
    }
}
