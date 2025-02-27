import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import Info from '../screens/Info';
import ProductDetail from '../screens/ProductDetail';

import News from '../screens/News';
import NewDetails from '../screens/NewDetails';

import TabNavigator from './TabNavigator'; // Import TabNavigator
import { Product } from '../screens/ProductDetail';


export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Info: undefined;
  ProductDetail: { product: Product };

  News: undefined;
  NewDetails: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false, animation: 'slide_from_right' }} />

      <Stack.Screen name="Register" component={Register} options={{ headerShown: false , animation: 'slide_from_right'}} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{
          headerShown: false,
          animation: 'slide_from_right'  // Thử đổi thành 'slide_from_right' hoặc 'fade'
        }}
      />

      <Stack.Screen name="Info" component={Info} options={{ headerShown: false, animation: 'slide_from_right'}} 
      />

      <Stack.Screen name="ProductDetail" component={ProductDetail}  options={{
          headerShown: false,
          animation: 'slide_from_right'  // Thử đổi thành 'slide_from_right' hoặc 'fade'
        }} />
      <Stack.Screen name="News" component={News} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="NewDetails" component={NewDetails} options={{ headerShown: false, animation: 'slide_from_right' }} />

    </Stack.Navigator>
  );
};

export default StackNavigator;
