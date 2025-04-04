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
import failedAnimation from '../lottie/payment_fail.json'; // Thay bằng file Lottie animation thất bại

const OrderFailed = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { language } = useCategoryStore();
  const { ensureActiveCart } = useCartStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Cart' as never); // Điều hướng về giỏ hàng
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
          source={failedAnimation}
          autoPlay
          loop={false} // Chạy một lần
        />
        <Text style={styles.text}>
          {language === 'VN' ? 'Thanh toán thất bại!' : 'Payment failed!'}
        </Text>
        <Text style={styles.subText}>
          {language === 'VN' ? 'Vui lòng thử lại.' : 'Please try again.'}
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
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 20,
    fontSize: 25,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: 'red', // Đổi thành màu đỏ để phù hợp với trạng thái thất bại
    textAlign: 'center',
  },
  subText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONTFAMILY.poppins_medium,
    color: 'gray', // Màu phụ cho lời nhắc thử lại
    textAlign: 'center',
  },
});

export default OrderFailed;
