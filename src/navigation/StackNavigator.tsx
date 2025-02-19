import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login'; 
import TabNavigator from './TabNavigator'; // Import TabNavigator

export type RootStackParamList = {
  Login: undefined;
  Main: undefined; // Thay vì Home, ta dùng Main để chứa TabNavigator
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
