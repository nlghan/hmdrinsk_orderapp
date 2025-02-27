import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import Info from '../screens/Info';
import ProductDetail, { Product } from '../screens/ProductDetail';
import AllReviewsScreen from '../screens/AllReviews';
import AddReviewScreen from '../screens/AddReview';
import TabNavigator from './TabNavigator';
import LanguageChange from '../screens/LanguagChange';

// ✅ Định nghĩa kiểu cho danh sách các màn hình
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Info: undefined;
  ProductDetail: { product: Product };
  LanguageChange: undefined;
  AllReviews: { productId: number };
  AddReview: { productId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const { t } = useTranslation(); // ✅ Đặt trong function component

  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="Info" component={Info} options={{ headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="LanguageChange" component={LanguageChange} options={{ title: t('common.selectLanguage'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="AllReviews" component={AllReviewsScreen} options={{ title: t('common.allReviews'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: t('common.addReview'), headerShown: false, animation: 'slide_from_right' as const }} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
