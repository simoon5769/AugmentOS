// SensingDisabledWarning.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from './types';
import { useTranslation } from 'react-i18next';

interface SensingDisabledWarningProps {
    isSensingEnabled: boolean;
}

const SensingDisabledWarning: React.FC<SensingDisabledWarningProps> = ({ isSensingEnabled }) => {
    const navigation = useNavigation<NavigationProps>();
    const { t } = useTranslation(['home']);

    if (isSensingEnabled) {
        return null;
    }

    return (
        <View style={[
            styles.sensingWarningContainer, 
            { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' }
        ]}>
            <View style={styles.warningContent}>
                <Icon name="microphone-off" size={22} color="#FF9800" />
                <Text style={styles.warningText}>
                    {t('SensingDisabledWarning.Sensing is disabled')}
                </Text>
            </View>
            <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => {
                    // Navigate to the Settings page
                    navigation.navigate('PrivacySettingsScreen');
                }}
            >
                <Text style={styles.settingsButtonTextBlue}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    sensingWarningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12, // Match ConnectedDeviceInfo
        borderWidth: 1, // Restore border for the warning
        marginBottom: 0,
        marginHorizontal: 0,
        marginTop: 16, // Added spacing above the warning
        width: '100%',
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
    settingsButton: {
        padding: 5,
    },
    settingsButtonTextBlue: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default SensingDisabledWarning;