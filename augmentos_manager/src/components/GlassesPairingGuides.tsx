// GlassesPairingGuides.tsx

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

// 1) Create an interface for the props
interface GlassesPairingGuideProps {
  isDarkTheme: boolean;
}

// 2) Declare each guide component with the correct prop type
export const EvenRealitiesG1PairingGuide: React.FC<GlassesPairingGuideProps> = ({
  isDarkTheme,
}) => {
  const textColor = isDarkTheme ? 'white' : 'black';
  const { t } = useTranslation(['home']);

  return (
    <View style={styles.guideContainer}>
      <Text style={[styles.guideTitle, { color: textColor }]}>
        Even Realities G1
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Disconnect your G1 from within the Even Realities app, or uninstall the Even Realities app')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Place your G1 in the charging case with the lid open')}
      </Text>

      <Image source={require('../assets/guide/image_g1_pair.png')} style={styles.guideImage} />
    </View>
  );
};

export const VuzixZ100PairingGuide: React.FC<GlassesPairingGuideProps> = ({
  isDarkTheme,
}) => {
  const textColor = isDarkTheme ? 'white' : 'black';
  const { t } = useTranslation(['home']);

  return (
    <View style={styles.guideContainer}>
      <Text style={[styles.guideTitle, { color: textColor }]}>
        Vuzix Z100
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Make sure your Z100 is fully charged and turned on')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Pair your Z100 with your device using the Vuzix Connect app')}
      </Text>
    </View>
  );
};

export const MentraMach1PairingGuide: React.FC<GlassesPairingGuideProps> = ({
  isDarkTheme,
}) => {
  const textColor = isDarkTheme ? 'white' : 'black';
  const { t } = useTranslation(['home']);

  return (
    <View style={styles.guideContainer}>
      <Text style={[styles.guideTitle, { color: textColor }]}>
        Mentra Mach1
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Make sure your Mach1 is fully charged and turned on')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Pair your Mach1 with your device using the Vuzix Connect app')}
      </Text>
    </View>
  );
};

export const MentraLivePairingGuide: React.FC<GlassesPairingGuideProps> = ({
  isDarkTheme,
}) => {
  const textColor = isDarkTheme ? 'white' : 'black';
  const { t } = useTranslation(['home']);

  return (
    <View style={styles.guideContainer}>
      <Text style={[styles.guideTitle, { color: textColor }]}>
        Mentra Live
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Make sure your Mentra Live is fully charged and turned on')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        2. TBD
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        3. TBD
      </Text>
    </View>
  );
};

export const AudioWearablePairingGuide: React.FC<GlassesPairingGuideProps> = ({
  isDarkTheme,
}) => {
  const textColor = isDarkTheme ? 'white' : 'black';
  const { t } = useTranslation(['home']);

  return (
    <View style={styles.guideContainer}>
      <Text style={[styles.guideTitle, { color: textColor }]}>
        Audio Wearable
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Make sure your Audio Wearable is fully charged and turned on')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Enable Bluetooth pairing mode on your Audio Wearable')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.Audio Wearables dont have displays')}
      </Text>
      <Text style={[styles.guideDescription, { color: textColor }]}>
        {t('GlassesPairingGuides.Audio Wearables are smart glasses without displays')}
      </Text>
    </View>
  );
};

export const VirtualWearablePairingGuide: React.FC<GlassesPairingGuideProps> = ({
  isDarkTheme,
}) => {
  const textColor = isDarkTheme ? 'white' : 'black';
  const { t } = useTranslation(['home']);

  return (
    <View style={styles.guideContainer}>
      <Text style={[styles.guideTitle, { color: textColor }]}>
        {t('GlassesPairingGuides.Simulated Glasses')}
      </Text>
      <Text style={[styles.guideStep, { color: textColor }]}>
        {t('GlassesPairingGuides.The Simulated Glasses allows you to run AugmentOS without physical smart glasses')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  guideContainer: {
    marginTop: 20,
    width: '90%',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  guideStep: {
    fontSize: 16,
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  guideImage: {
    width: '100%',
    height: 200, // Adjust height as needed
    resizeMode: 'contain',
    marginVertical: 10,
  },
});
