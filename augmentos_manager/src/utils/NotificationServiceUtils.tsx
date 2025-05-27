import { Alert, NativeModules, Platform } from 'react-native';
import showAlert from './AlertUtils';
import i18n from '../i18n/config';

const { NotificationAccess } = NativeModules;

export async function checkNotificationAccessSpecialPermission() {
  if (Platform.OS !== 'android') {
    return false;
  }

  return await NotificationAccess.hasNotificationAccess();
}

export async function checkAndRequestNotificationAccessSpecialPermission() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const hasAccess = await NotificationAccess.hasNotificationAccess();
    if (!hasAccess) {
      showAlert(
        i18n.t('NotificationServiceUtils.Enable Notification Access', {ns: 'home'}),
        i18n.t('NotificationServiceUtils.AugmentOS needs permission to read your phone notifications', {ns: 'home'}),
        [
          {
            text: i18n.t('NotificationServiceUtils.Later', {ns: 'home'}),
            style: 'cancel',
          },
          {
            text: i18n.t('NotificationServiceUtils.Go to Settings', {ns: 'home'}),
            onPress: () => {
              NotificationAccess.requestNotificationAccess()
                .then(() => {
                  console.log("Notification access settings opened successfully");
                })
                .catch((err: any) => {
                  console.error('Error opening notification settings:', err);
                  showAlert(
                    i18n.t('Error', {ns: 'home'}),
                    i18n.t('NotificationServiceUtils.Could not open notification settings', {ns: 'home'}),
                    [{ text: i18n.t('OK', {ns: 'home'}) }]
                  );
                });
            },
          }
        ],
        { cancelable: true },
      );
    } else {
      console.log("Notification access already granted");
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to check notification listener permission:', error);
    showAlert(
      i18n.t('Error', {ns: 'home'}),
      i18n.t('NotificationServiceUtils.There was a problem checking notification permissions', {ns: 'home'}),
      [{ text: i18n.t('OK', {ns: 'home'}) }]
    );
    return false;
  }
}
