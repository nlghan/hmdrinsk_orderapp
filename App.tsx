import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { NotificationProvider } from './src/components/NotificationContext';
import StackNavigator from './src/navigation/StackNavigator';
import './src/i18n/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform, View } from 'react-native';

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NotificationProvider>
          <NavigationContainer>
            {/* Ẩn status bar */}
            <StatusBar hidden={true} />
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffe7c9',
              }}>
              <StackNavigator />
            </View>
          </NavigationContainer>
        </NotificationProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
