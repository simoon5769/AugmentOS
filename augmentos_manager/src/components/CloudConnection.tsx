import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useStatus } from '../providers/AugmentOSStatusProvider';
import { useTranslation } from 'react-i18next';

interface CloudConnectionProps {
  isDarkTheme: boolean;
}

const CloudConnection: React.FC<CloudConnectionProps> = ({ isDarkTheme }) => {
  const { status } = useStatus();

  const { t } = useTranslation(['home']);

  useEffect(() => {
    console.log('AugmentOS Status Updated:', JSON.stringify(status, null, 2));
  }, [status]);

  /**
   * Return gradient colors based on the cloud connection status
   */
  const getGradientColors = (connectionStatus: string | undefined): string[] => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return ['#4CAF50', '#81C784']; // Green gradient
      case 'CONNECTING':
        return ['#FFA726', '#FB8C00']; // Orange gradient
      case 'RECONNECTING':
        return ['#FFC107', '#FFD54F']; // Yellow-ish gradient
      case 'DISCONNECTED':
      default:
        return ['#FF8A80', '#FF5252']; // Red gradient
    }
  };

  /**
   * Return icon name and color based on connection status
   */
  const getIcon = (connectionStatus: string | undefined): { name: string; color: string; label: string } => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return { name: 'check-circle', color: '#4CAF50', label: 'Connected' };
      case 'CONNECTING':
        return { name: 'spinner', color: '#FB8C00', label: t('CloudConnection.Connecting to cloud') };
      case 'RECONNECTING':
        return { name: 'refresh', color: '#FFD54F', label: t('CloudConnection.Reconnecting to cloud') };
      case 'DISCONNECTED':
      default:
        return { name: 'exclamation-circle', color: '#FF5252', label: t('CloudConnection.Disconnected from cloud') };
    }
  };

  const currentStyles = isDarkTheme ? darkThemeStyles : lightThemeStyles;
  const { name: iconName, color: iconColor, label: statusLabel } = getIcon(status.core_info.cloud_connection_status);

  return (
    <LinearGradient
      colors={getGradientColors(status.core_info.cloud_connection_status)}
      style={currentStyles.outerContainer}
    >
      <View style={currentStyles.innerContainer}>
        <View style={currentStyles.row}>
          <Icon
            name={iconName}
            size={16}
            color={iconColor}
            style={currentStyles.icon}
          />
          <Text style={currentStyles.text}>{statusLabel}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const lightThemeStyles = StyleSheet.create({
  outerContainer: {
    borderRadius: 6,
    padding: 2,
    margin: 4,
  },
  innerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat-Regular',
    color: '#000',
  },
});

const darkThemeStyles = StyleSheet.create({
  ...lightThemeStyles,
  innerContainer: {
    ...lightThemeStyles.innerContainer,
    backgroundColor: '#121212',
    shadowColor: '#fff',
  },
  text: {
    ...lightThemeStyles.text,
    color: '#fff',
  },
});

export default CloudConnection;
