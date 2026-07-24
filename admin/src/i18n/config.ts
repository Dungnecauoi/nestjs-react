import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from '../locales/vi';
import en from '../locales/en';

const SAVED_LANGUAGE_KEY = 'ecomcx_admin_language';
const initialLang = localStorage.getItem(SAVED_LANGUAGE_KEY) || 'vi';

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false, // react already escapes values
  },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(SAVED_LANGUAGE_KEY, lng);
});

export default i18n;
