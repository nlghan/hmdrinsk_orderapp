import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDERRADIUS, FONTFAMILY, FONTSIZE } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategoryStore } from '../store/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';


const OrderComplete = () => {
 const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
   const { language, setLanguage } = useCategoryStore();
  const languageFromStore = language;
  const spinValue = new Animated.Value(0);
  const particles = Array.from({ length: 30 }).map((_, index) => ({
    key: `particle-${index}`,
    opacity: new Animated.Value(1),
    scale: new Animated.Value(0),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(0),
    size: Math.random() * 10 + 5,
  }));


  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);


  useEffect(() => {
    particles.forEach(particle => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 170;
      const translateX = Math.cos(angle) * distance;
      const translateY = Math.sin(angle) * distance;

      Animated.loop(
        Animated.parallel([
          Animated.timing(particle.translateX, {
            toValue: translateX,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: translateY,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start(() => {
        particle.scale.setValue(0);
        particle.opacity.setValue(1);
      });
    });
  }, []);


  const colorValue = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primaryGreenHex, COLORS.whiteHex],
  });
   const { fetchCartItem,ensureActiveCart } = useCartStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Main' as never);
      ensureActiveCart();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Animated.View style={[styles.circle, { borderColor: colorValue }]}>
          <Icon name="check-circle" size={100} color="green" />
          {particles.map(particle => (
            <Animated.View
              key={particle.key}
              style={[
                styles.particle,
                {
                  opacity: particle.opacity,
                  transform: [
                    { scale: particle.scale },
                    { translateX: particle.translateX },
                    { translateY: particle.translateY },
                  ],
                  width: particle.size,
                  height: particle.size,
                },
              ]}
            />
          ))}
        </Animated.View>
        <Text style={styles.text}>
        {languageFromStore === 'VN' ? 'Cảm ơn bạn đã đặt hàng!'  : 'Thank you for your order!'}
        </Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop:'55%',
    
    alignItems: 'center',
  },
  circle: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    backgroundColor: COLORS.primaryGreenHex,
    borderRadius: 50,
  },
  text: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryGreenHex
  },
});

export default OrderComplete;
