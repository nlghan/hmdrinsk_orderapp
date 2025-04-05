import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translationEN from '../locales/eng/homeEng.json';
import translationVI from '../locales/vi/homeVi.json';

const resources = {
  EN: { translation: translationEN },
  VN: { translation: translationVI },
};

// 🚀 **Hàm khởi tạo i18n**
const initI18n = async () => {
  const savedLang = (await AsyncStorage.getItem('language')) || 'VN'; 
  console.log('🌍 Đang khởi tạo i18n với ngôn ngữ:', savedLang);

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: savedLang, 
    fallbackLng: 'VN',
    interpolation: { escapeValue: false },
  });

  console.log('✅ i18n đã khởi tạo với ngôn ngữ:', savedLang);
};

initI18n(); // 🚀 Chỉ chạy một lần khi app khởi động

export default i18n;
