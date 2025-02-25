import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Favourite from '../screens/Favourite';
import Order from '../screens/Order';
import Orther from '../screens/Orther';
import { COLORS } from '../theme/theme';
import { BlurView } from '@react-native-community/blur';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
  screenOptions={{
    tabBarHideOnKeyboard: true,
    headerShown: false,
    tabBarShowLabel: true,
    tabBarStyle: styles.tabBarStyle,
    tabBarActiveTintColor: COLORS.primaryGreenHex, // Màu chữ khi focus
    tabBarInactiveTintColor: COLORS.primaryGray, // Màu chữ khi không focus
    tabBarLabelStyle: styles.labelStyle, // Style cho label
    tabBarBackground: () => (
      <BlurView overlayColor="" blurAmount={15} style={styles.blurStyle} />
    ),
  }}
>
  <Tab.Screen
    name="Home"
    component={Home}
    options={{
      tabBarLabel: 'Trang chủ', // Chỉ truyền string
      tabBarIcon: ({ focused }) => (
        <Icon
          name="home"
          size={26}
          color={focused ? COLORS.primaryGreenHex : COLORS.primaryGray}
        />
      ),
    }}
  />
  <Tab.Screen
    name="Order"
    component={Order}
    options={{
      tabBarLabel: 'Đặt hàng',
      tabBarIcon: ({ focused }) => (
        <Icon
          name="shopping-bag"
          size={26}
          color={focused ? COLORS.primaryGreenHex : COLORS.primaryGray}
        />
      ),
    }}
  />
  <Tab.Screen
    name="Favorite"
    component={Favourite}
    options={{
      tabBarLabel: 'Yêu thích',
      tabBarIcon: ({ focused }) => (
        <Icon
          name="favorite"
          size={26}
          color={focused ? COLORS.primaryGreenHex : COLORS.primaryGray}
        />
      ),
    }}
  />
  <Tab.Screen
    name="Orther"
    component={Orther}
    options={{
      tabBarLabel: 'Khác',
      tabBarIcon: ({ focused }) => (
        <Icon
          name="menu"
          size={26}
          color={focused ? COLORS.primaryGreenHex : COLORS.primaryGray}
        />
      ),
    }}
  />
</Tab.Navigator>

  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 60,
    position: 'absolute',
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 0,
    borderTopColor: 'transparent',
  },
  blurStyle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  labelStyle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default TabNavigator;
