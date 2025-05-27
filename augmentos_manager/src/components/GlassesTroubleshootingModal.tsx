import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import i18n from '../i18n/config';

interface TroubleshootingModalProps {
  isVisible: boolean;
  onClose: () => void;
  glassesModelName: string;
  isDarkTheme: boolean;
}

export const getModelSpecificTips = (model: string) => {
  switch (model) {
    case 'Even Realities G1':
      return [
        i18n.t("GlassesTroubleshootingModal.Make sure you closed the G1's left arm FIRST before putting it in the case", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Plug your G1 case into a charger during the pairing process", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Try closing the charging case and opening it again", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Ensure no other app is currently connected to your G1", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Restart your phone's Bluetooth", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Make sure your phone is within 3 feet of your glasses & case", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.If your glasses were previously paired to a different phone, you must unpair/forget the glasses in your phone's Bluetooth settings before retrying the pairing process", {ns: 'home'})
      ];
    case 'Mentra Mach1':
    case 'Vuzix Z100':
      return [
        i18n.t("GlassesTroubleshootingModal.Make sure your glasses are turned on", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Check that your glasses are paired in the Vuzix Connect app", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Try resetting your Bluetooth connection", {ns: 'home'})
      ];
    case 'Mentra Live':
      return [
        i18n.t("GlassesTroubleshootingModal.Make sure your Mentra Live is fully charged", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Check that your Mentra Live is in pairing mode", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Ensure no other app is currently connected to your glasses", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Try restarting your glasses", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Check that your phone's Bluetooth is enabled", {ns: 'home'})
      ];
    default:
      return [
        i18n.t("GlassesTroubleshootingModal.Make sure your glasses are charged and turned on", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Ensure no other device is connected to your glasses", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Try restarting both your glasses and phone", {ns: 'home'}),
        i18n.t("GlassesTroubleshootingModal.Make sure your phone is within range of your glasses", {ns: 'home'})
      ];
  }
};

const GlassesTroubleshootingModal: React.FC<TroubleshootingModalProps> = ({ 
  isVisible, 
  onClose, 
  glassesModelName, 
  isDarkTheme 
}) => {

  const themeColors = {
    background: isDarkTheme ? '#2d2d2d' : '#ffffff',
    text: isDarkTheme ? '#ffffff' : '#000000',
    border: isDarkTheme ? '#555555' : '#cccccc',
    buttonBackground: isDarkTheme ? '#3b82f6' : '#007BFF',
    tipBackground: isDarkTheme ? '#404040' : '#f0f0f0',
    overlay: 'rgba(0,0,0,0.7)',
  };

  const tips = getModelSpecificTips(glassesModelName);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: themeColors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalHeaderText, { color: themeColors.text }]}>
              {i18n.t("home:GlassesTroubleshootingModal.Troubleshooting glassesModelName", {glassesModelName: glassesModelName})}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.modalSubText, { color: themeColors.text }]}>
            {i18n.t("GlassesTroubleshootingModal.Having trouble pairing your glasses", {ns: 'home'})}
          </Text>
          
          <ScrollView style={styles.tipsContainer}>
            {tips.map((tip, index) => (
              <View 
                key={index} 
                style={[styles.tipItem, { backgroundColor: themeColors.tipBackground }]}
              >
                <Text style={[styles.tipNumber, { color: themeColors.buttonBackground }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tipText, { color: themeColors.text }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.closeModalButton, { backgroundColor: themeColors.buttonBackground }]} 
            onPress={onClose}
          >
            <Text style={styles.closeModalButtonText}>{i18n.t("GlassesTroubleshootingModal.Got it thanks", {ns: 'home'})}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalSubText: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  tipsContainer: {
    maxHeight: 350,
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: 'Montserrat-Bold',
    minWidth: 20,
  },
  tipText: {
    fontSize: 15,
    flex: 1,
    fontFamily: 'Montserrat-Regular',
  },
  closeModalButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});

export default GlassesTroubleshootingModal;