import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import Info from '../screens/Info';
import ProductDetail from '../screens/ProductDetail';
import News from '../screens/News';
import NewDetails from '../screens/NewDetails';
import Orther from '../screens/Orther';
import AllReviewsScreen from '../screens/AllReviews';
import AddReviewScreen from '../screens/AddReview';
import LanguageChange from '../screens/LanguagChange';
import HistoryOrders from '../screens/HistoryOrders';
import DeliveringOrders from '../screens/DeliveringOrders';
import CancelledOrders from '../screens/CancelledOrders';
import WaitingOrders from '../screens/PendingOrders';
import RefundOrders from '../screens/RefundOrder';
import PendingOrders from '../screens/WaitingOrders';
import MyOrderDetails from '../screens/MyOrderDetails';
import TabNavigator from './TabNavigator'; // Import TabNavigator
import { Product } from '../screens/ProductDetail';

// ✅ Định nghĩa kiểu cho danh sách các màn hình
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Info: undefined;
  ProductDetail: { product: Product };
  News: undefined;
  NewDetails: undefined;
  LanguageChange: undefined;
  AllReviews: { productId: number };
  AddReview: { productId: number };
  HistoryOrders: undefined;
  DeliveringOrders: undefined;
  PendingOrders: undefined;
  Orther: undefined;
  CancelledOrders: undefined;
  WaitingOrders: undefined;
  MyOrderDetails: { shipmentId: number };
  RefundOrders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const { t } = useTranslation(); // ✅ Đặt trong function component

  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />

      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{
          headerShown: false,
          animation: 'slide_from_right'  // Thử đổi thành 'slide_from_right' hoặc 'fade'
        }}
      />

      <Stack.Screen name="Info" component={Info} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetail}  options={{
          headerShown: false,
          animation: 'slide_from_right'  // Thử đổi thành 'slide_from_right' hoặc 'fade'
        }} />
        <Stack.Screen name="News" component={News} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="NewDetails" component={NewDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="LanguageChange" component={LanguageChange} options={{ title: t('common.selectLanguage'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="AllReviews" component={AllReviewsScreen} options={{ title: t('common.allReviews'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: t('common.addReview'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="DeliveringOrders" component={DeliveringOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PendingOrders" component={PendingOrders} options={{ headerShown: false, animation: 'slide_from_right' }}/>
      <Stack.Screen name="HistoryOrders" component={HistoryOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="CancelledOrders" component={CancelledOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="WaitingOrders" component={WaitingOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="RefundOrders" component={RefundOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Orther" component={Orther} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MyOrderDetails" component={MyOrderDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
