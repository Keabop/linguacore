import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es.json';
import en from './en.json';

// No localStorage outside the browser (server-side tests): Spanish by default
const savedLang = (typeof localStorage !== 'undefined' && localStorage.getItem('voxie-display-language')) || 'es';
const activeLang = savedLang === 'bilingual' ? 'en' : savedLang;

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es },
        en: { translation: en },
    },
    lng: activeLang,
    fallbackLng: 'es',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
