import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTFAMILY } from '../theme/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/store';
import successAnimation from '../lottie/payment_success.json'; // Thay bằng file Lottie của bạn

const OrderComplete = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { language } = useCategoryStore();
  const { ensureActiveCart } = useCartStore();

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
        <LottieView
          style={styles.lottieStyle}
          source={successAnimation}
          autoPlay
          loop={false} // Dừng sau khi chạy 1 lần
        />
        <Text style={styles.text}>
          {language === 'VN' ? 'Cảm ơn bạn đã đặt hàng!' : 'Thank you for your order!'}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieStyle: {
    width: 300,
    height: 300,
    marginTop:-30
  },
  text: {
    fontSize: 40,
    fontFamily: FONTFAMILY.dongle_bold,
    color: COLORS.primaryGreenHex,
    textAlign: 'center',
  },
});

export default OrderComplete;
