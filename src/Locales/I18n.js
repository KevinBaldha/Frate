import I18n from 'i18n-js';
import * as RNLocalize from 'react-native-localize';
// import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import fr from './fr.json';

const locales = RNLocalize.getLocales();

// AsyncStorage.getItem('@languageCode').then((res) => {
//   if (res === null) {
//     if (Array.isArray(locales)) {
I18n.locale = locales[0].languageCode;
//     }
//   } else {
//     I18n.locale = res;
//   }
// });

export const setLocale = (locale) => {
  I18n.locale = locale;
};

I18n.fallbacks = true;
// if no match languguage set any default language
// Define supported language
I18n.translations = {
  en,
  fr,
};
export function getLocalText(name) {
  return I18n.t(name);
}
export default I18n;
