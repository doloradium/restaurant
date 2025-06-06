import { I18nProvider } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import russianMessages from './ru';

// Создаем провайдер i18n с русским языком по умолчанию
const i18nProvider: I18nProvider = polyglotI18nProvider(
    () => russianMessages,
    'ru'
);

export default i18nProvider;
