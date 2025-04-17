import React, { useReducer, useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import Home from '../screens/Home';
import Favourite from '../screens/Favourite';
import Order from '../screens/Order';
import News from '../screens/News';
import Orther from '../screens/Orther';
import { COLORS, FONTFAMILY } from '../theme/theme';

const Tab = createBottomTabNavigator();
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const TabNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator tabBar={(props) => <AnimatedTabBar {...props} />}>
      <Tab.Screen name="Home" component={Home} options={{
        tabBarLabel: t('home1'),
        tabBarIcon: ({ color }) => <Icon name="home" size={28} color={color} />,
        headerShown: false
      }} />
      <Tab.Screen name="Order" component={Order} options={{
        tabBarLabel: t('buy1'),
        tabBarIcon: ({ color }) => <Icon name="shopping-bag" size={28} color={color} />,
        headerShown: false
      }} />
      <Tab.Screen name="Favorite" component={Favourite} options={{
        tabBarLabel: t('favourite.title'),
        tabBarIcon: ({ color }) => <Icon name="favorite" size={28} color={color} />,
        headerShown: false
      }} />
      <Tab.Screen name="News" component={News} options={{
        tabBarLabel: t('posts1'),
        tabBarIcon: ({ color }) => <Icon name="library-books" size={28} color={color} />,
        headerShown: false
      }} />
      <Tab.Screen name="Orther" component={Orther} options={{
        tabBarLabel: t('information.other'),
        tabBarIcon: ({ color }) => <Icon name="menu" size={28} color={color} />,
        headerShown: false
      }} />
    </Tab.Navigator>
  );
};

const AnimatedTabBar = ({ state: { index: activeIndex, routes }, descriptors, navigation }: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();

  const reducer = (state: any[], action: { x: number; index: number }) => {
    const newState = [...state];
    const existingIndex = newState.findIndex((item) => item.index === action.index);
    if (existingIndex !== -1) newState[existingIndex] = action;
    else newState.push(action);
    return newState;
  };

  const [layout, dispatch] = useReducer(reducer, []);
  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    dispatch({ x: event.nativeEvent.layout.x, index });
  };

  const xOffset = useDerivedValue(() => {
    if (layout.length !== routes.length) return 0;
    const item = layout.find(({ index }) => index === activeIndex);
    return item ? item.x - 25 : 0;
  }, [activeIndex, layout]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(xOffset.value, { duration: 200, easing: Easing.ease }) }],
  }));

  return (
    <View style={[styles.tabBar, { paddingBottom: bottom }]}>
      <AnimatedSvg width={120} height={60} viewBox="0 0 120 60" style={[styles.activeBackground, animatedStyles]}>
        <Path
          fill={"#f8f8f8"}
          d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
        />
      </AnimatedSvg>

      <View style={styles.tabBarContainer}>
        {routes.map((route, index) => {
          const active = index === activeIndex;
          const { options } = descriptors[route.key];
          return (
            <TabBarComponent
              key={route.key}
              active={active}
              options={options}
              onLayout={(e) => handleLayout(e, index)}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};

type TabBarComponentProps = {
  active: boolean;
  options: BottomTabNavigationOptions;
  onLayout: (e: LayoutChangeEvent) => void;
  onPress: () => void;
};

const TabBarComponent = ({ active, options, onLayout, onPress }: TabBarComponentProps) => {
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(active ? 1 : 0, { duration: 200, easing: Easing.out(Easing.ease) }) }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: withTiming(active ? 1 : 0.5, { duration: 300, easing: Easing.out(Easing.ease) }),
    transform: [
      { scale: withTiming(active ? 1.2 : 1, { duration: 200, easing: Easing.out(Easing.ease) }) },
      { translateY: withTiming(active ? 0 : 15, { duration: 300, easing: Easing.out(Easing.ease) }) },
    ],
  }));

  return (
    <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
      <Animated.View style={[styles.componentCircle, animatedCircleStyle]} />
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {options.tabBarIcon ? options.tabBarIcon({ focused: active, color: active ? COLORS.primaryGreenHex : COLORS.primaryGray, size: 24 }) : <Text>?</Text>}
      </Animated.View>
      <Animated.View style={[styles.labelContainer, animatedCircleStyle]}>
        <Text style={[styles.label, { color: active ? COLORS.primaryGreenHex : COLORS.primaryGray }]}>
          {options.tabBarLabel}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 80,
  },
  component: {
    height: 60,
    width: 60,
    marginTop: -5,
  },
  componentCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#ffece0',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: FONTFAMILY.lobster_regular,
  },
});

export default TabNavigator;
