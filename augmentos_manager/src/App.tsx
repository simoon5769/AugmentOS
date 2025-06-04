import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusProvider } from './providers/AugmentOSStatusProvider';
import { AppStatusProvider } from './providers/AppStatusProvider';
import Homepage from './screens/Homepage';
import SettingsPage from './screens/SettingsPage';
// import IntroScreen from './screens/IntroScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileSettingsPage from './screens/ProfileSettingsPage';
import GlassesMirror from './screens/GlassesMirror';
import GlassesMirrorFullscreen from './screens/GlassesMirrorFullscreen';
import NotificationListener from './components/NotificationListener';
import AppStore from './screens/AppStore';
import AppStoreNative from './screens/AppStoreNative';
import AppStoreWeb from './screens/AppStoreWebview';
import AppWebView from './screens/AppWebView';
import AppDetails from './screens/AppDetails';
import Reviews from './screens/ReviewSection';
import { StyleSheet, Text, View } from 'react-native';
import { AppStoreItem, RootStackParamList } from './components/types'; // Update path as needed
import MessageBanner from './components/MessageBanner';
import { ModalProvider } from './utils/AlertUtils';
import SelectGlassesModelScreen from './screens/SelectGlassesModelScreen';
import GlassesPairingGuideScreen from './screens/GlassesPairingGuideScreen';
import SelectGlassesBluetoothScreen from './screens/SelectGlassesBluetoothScreen';
import PhoneNotificationSettings from './screens/PhoneNotificationSettings';
import { SearchResultsProvider } from './providers/SearchResultsContext';
import AppSettings from './screens/AppSettings';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import 'react-native-url-polyfill/auto';
import { AuthProvider } from './AuthContext';
import VerifyEmailScreen from './screens/VerifyEmail';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';
import GrantPermissionsScreen from './screens/GrantPermissionsScreen';
import ConnectingToPuckComponent from './components/ConnectingToPuckComponent';
import VersionUpdateScreen from './screens/VersionUpdateScreen';
import { GlassesMirrorProvider } from './providers/GlassesMirrorContext';
import GlassesPairingGuidePreparationScreen from './screens/GlassesPairingGuidePreparationScreen';
import ErrorReportScreen from './screens/ErrorReportScreen';
import { saveSetting } from './logic/SettingsHelper';
import WelcomePageComponent from './components/WelcomePageComponent.tsx';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DeveloperSettingsScreen from './screens/DeveloperSettingsScreen.tsx';
import DashboardSettingsScreen from './screens/DashboardSettingsScreen.tsx';
import ScreenSettingsScreen from './screens/ScreenSettingsScreen.tsx';
import NavigationBar from './components/NavigationBar';
import { useTranslation } from 'react-i18next';

const linking = {
  prefixes: [
    'https://augmentos.org', 
    // Temporarily commented out until token exchange flow is fixed
    // 'https://appstore.augmentos.org', 
    'com.augmentos://',
    // 'augmentosappstore://'
  ],
  config: {
    screens: {
      VerifyEmailScreen: 'verify_email',
      AppStoreWeb: {
        path: 'package/:packageName',
        parse: {
          packageName: (packageName: string) => packageName,
        }
      },
    },
  },
};

// Assign the RootStackParamList to the navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [currentRouteName, setCurrentRouteName] = useState<string>('');
  const navigationRef = useNavigationContainerRef();
  const { t } = useTranslation(['home']);

  // Reset ignoreVersionCheck setting on app start
  useEffect(() => {
    saveSetting('ignoreVersionCheck', false);
    console.log('Reset version check ignore flag on app start');
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  // Screens where the navbar should be hidden
  const hideNavbarScreens = [
    'Login', 
    'SplashScreen', 
    'VerifyEmailScreen', 
    'VersionUpdateScreen',
    'WelcomePage',
    'ConnectingToPuck'
  ];

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NotificationListener>
          <AuthProvider>
            <StatusProvider>
              <AppStatusProvider>
                <SearchResultsProvider>
                  <GlassesMirrorProvider>
                    <MessageBanner />
                    <ModalProvider isDarkTheme={isDarkTheme} />
                    <NavigationContainer 
                      linking={linking}
                      ref={navigationRef}
                      onStateChange={() => {
                        const currentRoute = navigationRef.getCurrentRoute();
                        setCurrentRouteName(currentRoute?.name || '');
                      }}
                    >
                      <View style={[styles.mainContainer, {flexDirection: 'column', justifyContent: 'space-between'}]}>
                        <View style={[styles.contentContainer, {flex: 1, marginBottom: -1}]}>
                          <Stack.Navigator initialRouteName="SplashScreen">
                            <Stack.Screen
                              name="SplashScreen"
                              component={SplashScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="Login"
                              component={LoginScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen
                              name="VerifyEmailScreen"
                              component={VerifyEmailScreen}
                              options={{ headerShown: false }}
                            />

                            <Stack.Screen
                              name="VersionUpdateScreen"
                              options={{
                                headerShown: false,
                                // Optional: prevent going back with hardware back button on Android
                                gestureEnabled: false,
                              }}
                            >
                              {({ route }) => (
                                <VersionUpdateScreen
                                  route={{ params: { ...route?.params, isDarkTheme } }}
                                />
                              )}
                            </Stack.Screen>

                            <Stack.Screen name="Home" options={{ headerShown: false }}>
                              {() => (
                                <Homepage
                                  isDarkTheme={isDarkTheme}
                                  toggleTheme={toggleTheme}
                                />
                              )}
                            </Stack.Screen>

                            <Stack.Screen name="WelcomePage" options={{ headerShown: false }}>
                              {({ route }) => (
                                <WelcomePageComponent
                                  route={{ params: { isDarkTheme } }}
                                />
                              )}
                            </Stack.Screen>

                            <Stack.Screen name="ConnectingToPuck" options={{ headerShown: false }}>
                              {() => (
                                <ConnectingToPuckComponent
                                  isDarkTheme={isDarkTheme}
                                  toggleTheme={toggleTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen
                              name="Register"
                              component={RegisterScreen}
                              options={{ headerShown: false }}
                            />
                            <Stack.Screen name="SettingsPage" options={{ headerShown: false }}>
                              {props => (
                                <SettingsPage
                                  {...props}
                                  isDarkTheme={isDarkTheme}
                                  toggleTheme={toggleTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen name="PrivacySettingsScreen"
                              options={{ title: t('SettingsPage.Privacy Settings') }}
                            >
                              {props => (
                                <PrivacySettingsScreen
                                  {...props}
                                  toggleTheme={toggleTheme}
                                  isDarkTheme={isDarkTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen name="DeveloperSettingsScreen"
                              options={{ title: t('SettingsPage.Developer Settings') }}
                            >
                              {props => (
                                <DeveloperSettingsScreen
                                  {...props}
                                  toggleTheme={toggleTheme}
                                  isDarkTheme={isDarkTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen name="DashboardSettingsScreen"
                              options={{ title: t('SettingsPage.Dashboard Settings') }}
                            >
                              {props => (
                                <DashboardSettingsScreen
                                  {...props}
                                  toggleTheme={toggleTheme}
                                  isDarkTheme={isDarkTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen name="ScreenSettingsScreen"
                              options={{ title: t('SettingsPage.Screen Settings') }}
                            >
                              {props => (
                                <ScreenSettingsScreen
                                  {...props}
                                  toggleTheme={toggleTheme}
                                  isDarkTheme={isDarkTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen name="GrantPermissionsScreen"
                              options={{ title: 'Grant Permissions' }}
                            >
                              {props => (
                                <GrantPermissionsScreen
                                  {...props}
                                  toggleTheme={toggleTheme}
                                  isDarkTheme={isDarkTheme}
                                />
                              )}
                            </Stack.Screen>
                            <Stack.Screen
                              name="AppStore"
                              options={{ title: 'App Store', headerShown: false }}>
                              {props => <AppStore {...props} isDarkTheme={isDarkTheme} />}
                            </Stack.Screen>
                            <Stack.Screen
                              name="AppStoreNative"
                              options={{ title: 'App Store (Native)', headerShown: false }}>
                              {props => <AppStoreNative {...props} isDarkTheme={isDarkTheme} />}
                            </Stack.Screen>
                            <Stack.Screen
                              name="AppStoreWeb"
                              options={{ title: 'App Store', headerShown: false }}>
                              {props => <AppStoreWeb {...props} isDarkTheme={isDarkTheme} />}
                            </Stack.Screen>
                            <Stack.Screen
                              name="Reviews"
                              options={({ route }) => ({
                                headerShown: false,

                                      title: route.params.appName
                                        ? `Reviews for ${route.params.appName}`
                                        : 'Reviews',
                                      headerStyle: {
                                        backgroundColor: isDarkTheme ? '#333333' : '#FFFFFF',
                                      },
                                      headerTintColor: isDarkTheme ? '#FFFFFF' : '#000000',
                                    })}>
                                    {props => <Reviews {...props} isDarkTheme={isDarkTheme} />}
                                  </Stack.Screen>

                                    <Stack.Screen
                                      name="AppDetails"
                                      options={({ route }) => ({
                                        headerShown: false,
                                        title: route.params.app.name || 'App Details',
                                        headerStyle: {
                                          backgroundColor: isDarkTheme ? '#333333' : '#FFFFFF',
                                        },
                                        headerTintColor: isDarkTheme ? '#FFFFFF' : '#000000',
                                        headerTitleStyle: {
                                          color: isDarkTheme ? '#FFFFFF' : '#000000',
                                        },
                                      })}>
                                      {props => <AppDetails toggleTheme={function (): void {
                                        throw new Error('Function not implemented.');
                                      }} {...props} isDarkTheme={isDarkTheme} />}
                                    </Stack.Screen>
                                    <Stack.Screen
                                      name="ProfileSettings"
                                      options={{
                                        headerShown: false,
                                        title: 'Profile Settings',
                                        headerStyle: {
                                          backgroundColor: isDarkTheme ? '#000000' : '#ffffff',
                                        },
                                        headerTintColor: isDarkTheme ? '#ffffff' : '#000000',
                                      }}>
                                      {props => (
                                        <ProfileSettingsPage {...props} isDarkTheme={isDarkTheme} />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen
                                      name="GlassesMirror"
                                      options={{
                                        headerShown: false,
                                        title: t('GlassesMirror.Glasses Mirror'),
                                        headerStyle: {
                                          backgroundColor: isDarkTheme ? '#000000' : '#ffffff',
                                        },
                                        headerTintColor: isDarkTheme ? '#ffffff' : '#000000',
                                      }}>
                                      {() => <GlassesMirror isDarkTheme={isDarkTheme} />}
                                    </Stack.Screen>
                                    <Stack.Screen
                                      name="GlassesMirrorFullscreen"
                                      options={{
                                        headerShown: false,
                                        title: t('GlassesMirror.Glasses Mirror Fullscreen'),
                                        gestureEnabled: false,
                                      }}>
                                      {() => <GlassesMirrorFullscreen isDarkTheme={isDarkTheme} />}
                                    </Stack.Screen>
                                    <Stack.Screen name="AppSettings"
                                      options={({ route }) => ({
                                        title: route.params?.appName,
                                        headerStyle: {
                                          backgroundColor: isDarkTheme ? '#000000' : '#ffffff',
                                        },
                                        headerTintColor: isDarkTheme ? '#ffffff' : '#000000',
                                      })}>
                                      {props => (
                                        <AppSettings
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen name="AppWebView"
                                      options={({ route }) => ({
                                        title: route.params?.appName || 'App',
                                        headerStyle: {
                                          backgroundColor: isDarkTheme ? '#000000' : '#ffffff',
                                        },
                                        headerTintColor: isDarkTheme ? '#ffffff' : '#000000',
                                        headerBackTitle: 'Back',
                                      })}>
                                      {props => (
                                        <AppWebView
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen name="PhoneNotificationSettings"
                                      options={{
                                        title: t('App.Notifications'),
                                        headerStyle: {
                                          backgroundColor: isDarkTheme ? '#000000' : '#ffffff',
                                        },
                                        headerTintColor: isDarkTheme ? '#ffffff' : '#000000',
                                      }}>
                                      {props => (
                                        <PhoneNotificationSettings
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen
                                      name="ErrorReportScreen"
                                      component={ErrorReportScreen}
                                      options={{ title: t('App.Report an Error') }}
                                    />
                                    <Stack.Screen name="SelectGlassesModelScreen"
                                      options={{ title: t('App.Select Glasses') }}
                                    >
                                      {props => (
                                        <SelectGlassesModelScreen
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen name="GlassesPairingGuideScreen"
                                      options={{ title: t('App.Pairing Guide') }}
                                    >
                                      {props => (
                                        <GlassesPairingGuideScreen
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen name="GlassesPairingGuidePreparationScreen"
                                      options={{ title: t('App.Pairing Guide') }}
                                    >
                                      {props => (
                                        <GlassesPairingGuidePreparationScreen
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>
                                    <Stack.Screen name="SelectGlassesBluetoothScreen"
                                      options={{ title: t('App.Finding Glasses') }}
                                    >
                                      {props => (
                                        <SelectGlassesBluetoothScreen
                                          {...props}
                                          toggleTheme={toggleTheme}
                                          isDarkTheme={isDarkTheme}
                                        />
                                      )}
                                    </Stack.Screen>

                                  </Stack.Navigator>
                                </View>
                                {!hideNavbarScreens.includes(currentRouteName) && (
                                  <View style={{
                                    marginTop: -30, // Adjusted to close gap
                                    backgroundColor: isDarkTheme ? '#000000' : '#F2F2F7', // Match navbar color
                                  }}>
                                    <NavigationBar isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
                                  </View>
                                )}
                              </View>
                            </NavigationContainer>
                          </GlassesMirrorProvider>
                        </SearchResultsProvider>
                      </AppStatusProvider>
                    </StatusProvider>
                  </AuthProvider>
                </NotificationListener>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          );
        };

        const styles = StyleSheet.create({
          container: {
            flex: 1,
          },
          mainContainer: {
            flex: 1,
            flexDirection: 'column',
            overflow: 'hidden',
          },
          contentContainer: {
            flex: 1,
          },
        });

        export default App;