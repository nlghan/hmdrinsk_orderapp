import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import Info from '../screens/Info';
import ProductDetail from '../screens/ProductDetail';
import AllReviewsScreen from '../screens/AllReviews'
import AddReviewScreen from '../screens/AddReview'


import TabNavigator from './TabNavigator'; // Import TabNavigator
import { Product } from '../screens/ProductDetail';
import LanguageChange from '../screens/LanguagChange';


export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Info: undefined;
  ProductDetail: { product: Product };
  LanguageChange: undefined;
  AllReviews: { productId: number };  // 👈 Thêm dòng này
  AddReview: { productId: number };

};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
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

      <Stack.Screen name="LanguageChange" component={LanguageChange} options={{
        title: "Chọn Ngôn Ngữ", headerShown: false,
        animation: 'slide_from_right'
      }} />

      <Stack.Screen name="AllReviews" component={AllReviewsScreen} options={{
        title: "Chọn Ngôn Ngữ", headerShown: false,
        animation: 'slide_from_right'
      }} />

      <Stack.Screen name="AddReview" component={AddReviewScreen}  options={{
        title: "Chọn Ngôn Ngữ", headerShown: false,
        animation: 'slide_from_right'
      }}/>



    </Stack.Navigator>
  );
};

export default StackNavigator;
