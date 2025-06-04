import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useStatus } from '../providers/AugmentOSStatusProvider.tsx';
import coreCommunicator from '../bridge/CoreCommunicator';
import { Slider } from 'react-native-elements';
import showAlert from '../utils/AlertUtils.tsx';
import { useTranslation } from 'react-i18next';

interface ScreenSettingsScreenProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  navigation: any;
}

const parseBrightness = (brightnessStr: string | null | undefined): number => {
  if (typeof brightnessStr === 'number') {
    return brightnessStr;
  }
  if (!brightnessStr || brightnessStr.includes('-')) {
    return 50;
  }
  const parsed = parseInt(brightnessStr.replace('%', ''), 10);
  return isNaN(parsed) ? 50 : parsed;
};

const ScreenSettingsScreen: React.FC<ScreenSettingsScreenProps> = ({
  isDarkTheme,
  toggleTheme,
  navigation,
}) => {
  const { status } = useStatus();

  const { t } = useTranslation(['home']);

  // -- States --
  const [brightness, setBrightness] = useState<number | null>(null);
  const [isAutoBrightnessEnabled, setIsAutoBrightnessEnabled] = useState(
    status.glasses_info?.auto_brightness
  );

  // -- Effects --
  useEffect(() => {
    if (status.glasses_info) {
      if (status.glasses_info?.brightness != null) {
        setBrightness(parseBrightness(status.glasses_info.brightness));
      }
    }
  }, [status.glasses_info?.brightness, status.glasses_info]);

  useEffect(() => {
    if (status.glasses_info) {
      if (status.glasses_info?.auto_brightness != null) {
        setIsAutoBrightnessEnabled(status.glasses_info.auto_brightness);
      }
    }
  }, [status.glasses_info?.auto_brightness, status.glasses_info]);

  // -- Handlers --
  const changeBrightness = async (newBrightness: number) => {
    if (!status.glasses_info) {
      showAlert(t('ScreenSettingsScreen.Glasses not connected'), t('ScreenSettingsScreen.Please connect your smart glasses first'));
      return;
    }

    if (newBrightness == null) {
        return;
    }

    if (status.glasses_info.brightness === '-') {return;} // or handle accordingly
    await coreCommunicator.setGlassesBrightnessMode(newBrightness, false);
    setBrightness(newBrightness);
  };

  const toggleAutoBrightness = async () => {
    const newVal = !isAutoBrightnessEnabled;
    await coreCommunicator.setGlassesBrightnessMode(brightness ?? 50, newVal);
    setIsAutoBrightnessEnabled(newVal);
  };

  // Switch track colors
  const switchColors = {
    trackColor: {
      false: isDarkTheme ? '#666666' : '#D1D1D6',
      true: '#2196F3',
    },
    thumbColor:
      Platform.OS === 'ios' ? undefined : isDarkTheme ? '#FFFFFF' : '#FFFFFF',
    ios_backgroundColor: isDarkTheme ? '#666666' : '#D1D1D6',
  };

  // Check if brightness control is available for the connected glasses
  const isBrightnessControlAvailable = 
    status.glasses_info?.model_name && 
    status.glasses_info.model_name.toLowerCase().includes('even') &&
    status.glasses_info.brightness !== '-';

  // Fixed slider props to avoid warning
  const sliderProps = {
    disabled: !isBrightnessControlAvailable,
    style: [
      styles.slider,
      !isBrightnessControlAvailable && styles.disabledItem
    ],
    minimumValue: 0,
    maximumValue: 100,
    step: 1,
    onSlidingComplete: (value: number) => changeBrightness(value),
    value: brightness ?? 50,
    minimumTrackTintColor: isBrightnessControlAvailable ? styles.minimumTrackTintColor.color : '#999999',
    maximumTrackTintColor: isDarkTheme
      ? styles.maximumTrackTintColorDark.color
      : styles.maximumTrackTintColorLight.color,
    thumbTintColor: isBrightnessControlAvailable ? styles.thumbTintColor.color : '#999999',
    // Using inline objects instead of defaultProps
    thumbTouchSize: { width: 40, height: 40 },
    trackStyle: { height: 5 },
    thumbStyle: { height: 20, width: 20 }
  };

  return (
    <View
      style={[
        styles.container,
        isDarkTheme ? styles.darkBackground : styles.lightBackground,
      ]}
    >
      <ScrollView style={styles.scrollView}>
        {/* Auto Brightness */}
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text
              style={[
                styles.label,
                isDarkTheme ? styles.lightText : styles.darkText,
              ]}
            >
              {t('ScreenSettingsScreen.Auto Brightness')}
            </Text>
            {status.glasses_info?.model_name && (
              <Text
                style={[
                  styles.value,
                  isDarkTheme ? styles.lightSubtext : styles.darkSubtext,
                ]}
              >
                {t('ScreenSettingsScreen.Automatically adjust the brightness')}
              </Text>
            )}
          </View>
          <Switch
            value={isAutoBrightnessEnabled}
            onValueChange={toggleAutoBrightness}
            trackColor={switchColors.trackColor}
            thumbColor={switchColors.thumbColor}
            ios_backgroundColor={switchColors.ios_backgroundColor}
          />
        </View>

        {/* Brightness Slider */}
        {!isAutoBrightnessEnabled && (
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text
                style={[
                  styles.label,
                  isDarkTheme ? styles.lightText : styles.darkText,
                  (!isBrightnessControlAvailable) && styles.disabledItem,
                ]}>
                {t('ScreenSettingsScreen.Brightness')}
              </Text>
              <Text
                style={[
                  styles.value,
                  isDarkTheme ? styles.lightSubtext : styles.darkSubtext,
                  (!isBrightnessControlAvailable) && styles.disabledItem,
                ]}>
                {isBrightnessControlAvailable 
                  ? t('ScreenSettingsScreen.Adjust the brightness level of your smart glasses')
                  : !status.glasses_info?.model_name 
                    ? t('ScreenSettingsScreen.Please connect your smart glasses first')
                    : t('ScreenSettingsScreen.Brightness control not supported for this device')}
              </Text>
              <Slider {...sliderProps} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ScreenSettingsScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 10,
  },
  titleContainerDark: {
    backgroundColor: '#333333',
  },
  titleContainerLight: {
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'left',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  darkBackground: {
    backgroundColor: '#1c1c1c',
  },
  lightBackground: {
    backgroundColor: '#f0f0f0',
  },
  darkText: {
    color: 'black',
  },
  lightText: {
    color: 'white',
  },
  darkSubtext: {
    color: '#666666',
  },
  lightSubtext: {
    color: '#999999',
  },
  darkIcon: {
    color: '#333333',
  },
  lightIcon: {
    color: '#666666',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 16,
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 12,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  disabledItem: {
    opacity: 0.4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumbTouchSize: {
    width: 40,
    height: 40,
  },
  trackStyle: {
    height: 5,
  },
  thumbStyle: {
    height: 20,
    width: 20,
  },
  minimumTrackTintColor: {
    color: '#2196F3',
  },
  maximumTrackTintColorDark: {
    color: '#666666',
  },
  maximumTrackTintColorLight: {
    color: '#D1D1D6',
  },
  thumbTintColor: {
    color: '#FFFFFF',
  },
});