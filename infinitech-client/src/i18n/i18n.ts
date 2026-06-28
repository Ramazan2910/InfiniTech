import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.json';
import az from './locales/az.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('lang');
const browserLang = navigator.language.slice(0, 2);
const defaultLang = savedLang ?? (browserLang === 'az' ? 'az' : browserLang === 'ru' ? 'ru' : 'ru');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      az: { translation: az },
      en: { translation: en },
    },
    lng: defaultLang,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });

export default i18n;
