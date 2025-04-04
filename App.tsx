import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import './src/i18n/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from 'react-native';


const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>

  );
};

export default App;
