// GlassesPairingGuideScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useStatus } from '../providers/AugmentOSStatusProvider';
import coreCommunicator from '../bridge/CoreCommunicator';
import { NavigationProps } from '../components/types';
import PairingDeviceInfo from '../components/PairingDeviceInfo';
import GlassesTroubleshootingModal from '../components/GlassesTroubleshootingModal';
import { getPairingGuide } from '../logic/getPairingGuide';
import { useTranslation } from 'react-i18next';

interface GlassesPairingGuideScreenProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const GlassesPairingGuideScreen: React.FC<GlassesPairingGuideScreenProps> = ({
  isDarkTheme,
  toggleTheme,
}) => {
    const { status } = useStatus();
    const route = useRoute();
    const { glassesModelName } = route.params as { glassesModelName: string };
    const navigation = useNavigation<NavigationProps>();
    const [showTroubleshootingModal, setShowTroubleshootingModal] = useState(false);
    const [showHelpAlert, setShowHelpAlert] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasAlertShownRef = useRef(false);
    const { t } = useTranslation(['home']);

    // Timer to show help message after 30 seconds
    useEffect(() => {
      // Reset state when entering screen
      hasAlertShownRef.current = false;
      setShowHelpAlert(false);
      
      // Set timer for showing help popup
      timerRef.current = setTimeout(() => {
        // Only show alert if not already paired and alert hasn't been shown before
        if (!status.glasses_info?.model_name && !hasAlertShownRef.current) {
          setShowHelpAlert(true);
          hasAlertShownRef.current = true;

          coreCommunicator.sendRequestStatus();
        }
      }, 30000); // 30 seconds

      return () => {
        // Clear timer on unmount
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [glassesModelName]);

    // Show help alert if showHelpAlert is true
    useEffect(() => {
      if (showHelpAlert) {
        Alert.alert(
          t("GlassesPairingGuideScreen.Need Some Help"),
          t("GlassesPairingGuideScreen.Having trouble pairing your glassesModelName", {glassesModelName: glassesModelName}),
          [
            {
              text: t("GlassesPairingGuideScreen.No thanks"),
              style: "cancel",
              onPress: () => setShowHelpAlert(false)
            },
            {
              text: t("GlassesPairingGuideScreen.Help Me"),
              onPress: () => {
                setShowTroubleshootingModal(true);
                setShowHelpAlert(false);
              }
            }
          ]
        );
      }
    }, [showHelpAlert, glassesModelName]);

    useEffect(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        const actionType = e.data?.action?.type;
        if (actionType === 'GO_BACK' || actionType === 'POP') {
          coreCommunicator.sendForgetSmartGlasses();
          coreCommunicator.sendDisconnectWearable();
          e.preventDefault();
          navigation.navigate('SelectGlassesModelScreen');
        } else {
          console.log('Navigation triggered by', actionType, 'so skipping disconnect logic.');
        }
      });
    
      return unsubscribe;
    }, [navigation]);

    useEffect(() => {
      // If pairing successful, return to home
      if (status.core_info.puck_connected && status.glasses_info?.model_name) {
        // console.log("RETURN HOME FROM PAIR SCREEN: GOT MODEL NAME: " + status.glasses_info?.model_name);
        // Clear any pending timers when pairing succeeds
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        navigation.navigate('Home');
      }

      console.log('GlassesPairingGuideScreen status= ', status);
    }, [status]);


    return (
      <View style={[styles.container, isDarkTheme ? styles.darkBackground : styles.lightBackground]}>
        <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.contentContainer}>
            <PairingDeviceInfo glassesModelName={glassesModelName} isDarkTheme={isDarkTheme} />
            {getPairingGuide(glassesModelName, isDarkTheme)}
            
            <TouchableOpacity 
              style={[styles.helpButton, { backgroundColor: isDarkTheme ? '#3b82f6' : '#007BFF' }]}
              onPress={() => setShowTroubleshootingModal(true)}
            >
              <Icon name="question-circle" size={16} color="#FFFFFF" style={styles.helpIcon} />
                <Text style={styles.helpButtonText}>{t("GlassesPairingGuideScreen.Need Help Pairing")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <GlassesTroubleshootingModal 
          isVisible={showTroubleshootingModal}
          onClose={() => setShowTroubleshootingModal(false)}
          glassesModelName={glassesModelName}
          isDarkTheme={isDarkTheme}
        />
      </View>
    );
};

export default GlassesPairingGuideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  glassesImage: {
    width: 100,
    height: 60,
    resizeMode: 'contain',
    marginTop: 20,
  },
  darkBackground: {
    backgroundColor: '#1c1c1c',
  },
  lightBackground: {
    //backgroundColor: '#f9f9f9',
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightText: {
    color: '#333333',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  helpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-Regular',
  },
  helpIcon: {
    marginRight: 8,
  },
});

