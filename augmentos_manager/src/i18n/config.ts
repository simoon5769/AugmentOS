import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // 浏览器语言检测（Web 用）
// import enTranslations from './locales/en/common.json'; // React Native 直接导入
import { getLocales } from 'react-native-localize';

const locales = getLocales();

// locales[0]?.languageCode -- zh
// locales[0].countryCode -- CN
// locales[0].languageTag -- zh-Hans-CN

i18n
  .use(LanguageDetector) // 自动检测浏览器语言（Web）
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // 默认语言
    lng: locales[0]?.languageCode || 'zh',
    interpolation: {
      escapeValue: false, // React 已处理 XSS
    },
    resources: {
      'en': {
        translation: {
         },
        'home': require('./locales/en/strings.json'),
      },
      'zh': {
        translation: {
         },
        'home': require('./locales/zh-CN/strings.json'),
      },
      'fr': {
        translation: {
         },
        'home': require('./locales/fr/strings.json'),
      },
    },
    // React Native 可加载异步资源：
    // backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' }, // Web 动态加载
  });

export default i18n;