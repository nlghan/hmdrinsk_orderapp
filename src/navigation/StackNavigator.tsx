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
import OrderScreen from '../screens/Order';
import Cart from '../screens/Cart'
import ListVoucher from '../screens/ListVoucher';
import RefundOrder from '../screens/RefundOrder';
import Payment from '../screens/Payment';
import OrderComplete from '../screens/OrderComplete';
import Notification from '../screens/Notification';
import NotificationScreen from '../screens/Notification';
import OrderFailed from '../screens/OrderFailed';
import ChatWithShipper from '../screens/ChatWithShipper';
import Search from '../screens/Search';
import Contact from '../screens/Contact';


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
  Order: { state: { cateId: number } };
  LanguageChange: undefined;
  AllReviews: { productId: number };
  AddReview: { productId: number };
  Cart: undefined;
  ListVoucher: undefined
  HistoryOrders: undefined;
  DeliveringOrders: undefined;
  PendingOrders: undefined;
  OrderFailed:undefined;
  CancelledOrders: undefined;
  WaitingOrders: undefined;
  RefundOrders: undefined;
  MyOrderDetails: { shipmentId: number };
  Orther: undefined;
  Payment: { orderId: number };
  OrderComplete:undefined;
  Notification: undefined;
  ChatWithShipper: { shipmentId: number};
  Search: undefined;
  Contact: undefined;
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
      <Stack.Screen name="ProductDetail" component={ProductDetail} options={{
        headerShown: false,
        animation: 'slide_from_right'  // Thử đổi thành 'slide_from_right' hoặc 'fade'
      }} />
      <Stack.Screen name="Cart" component={Cart} options={{
        headerShown: false,
        animation: 'slide_from_right'  // Thử đổi thành 'slide_from_right' hoặc 'fade'
      }} />
      <Stack.Screen name="News" component={News} options={{ headerShown: false, animation: 'slide_from_right' }} />

      <Stack.Screen name="Order" component={OrderScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="NewDetails" component={NewDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="LanguageChange" component={LanguageChange} options={{ title: t('common.selectLanguage'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="AllReviews" component={AllReviewsScreen} options={{ title: t('common.allReviews'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="AddReview" component={AddReviewScreen} options={{ title: t('common.addReview'), headerShown: false, animation: 'slide_from_right' as const }} />

      <Stack.Screen name="ListVoucher" component={ListVoucher} options={{ title: t('common.addReview'), headerShown: false, animation: 'slide_from_right' as const }} />
      <Stack.Screen name="DeliveringOrders" component={DeliveringOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="PendingOrders" component={PendingOrders} options={{ headerShown: false, animation: 'slide_from_right' }}/>
      <Stack.Screen name="HistoryOrders" component={HistoryOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="CancelledOrders" component={CancelledOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="WaitingOrders" component={WaitingOrders} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="RefundOrders" component={RefundOrder} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Orther" component={Orther} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="MyOrderDetails" component={MyOrderDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="ChatWithShipper" component={ChatWithShipper} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Payment" component={Payment} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="OrderComplete" component={OrderComplete} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="OrderFailed" component={OrderFailed} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false, animation: 'slide_from_right' }}/>
      <Stack.Screen name="Search" component={Search} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Contact" component={Contact} options={{ headerShown: false, animation: 'slide_from_right' }} />
    
      
    </Stack.Navigator>
  );
};

export default StackNavigator;
