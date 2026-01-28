import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly (bundled)
import en from './locales/en/common.json';
import hi from './locales/hi/common.json';
import mr from './locales/mr/common.json';
import gu from './locales/gu/common.json';
import bn from './locales/bn/common.json';
import ta from './locales/ta/common.json';
import te from './locales/te/common.json';
import kn from './locales/kn/common.json';
import ml from './locales/ml/common.json';
import pa from './locales/pa/common.json';

// Supported languages with metadata
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
    gu: { translation: gu },
    bn: { translation: bn },
    ta: { translation: ta },
    te: { translation: te },
    kn: { translation: kn },
    ml: { translation: ml },
    pa: { translation: pa }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,

        interpolation: {
            escapeValue: false // React already escapes
        },

        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage']
        }
    });

export default i18n;
