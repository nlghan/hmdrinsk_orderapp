import { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axiosInstance';
import 'react-native-url-polyfill/auto';

export default function AppLinkHandler() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setIdOrderPause, setIdCartPause, setGroupCartId, ensureActiveCart } = useCartStore();
  const { fetchUserCoin } = useCategoryStore();

  const handleDeepLink = async (url: string) => {
    try {
      console.log('📥 Deep link URL received:', url);

      const urlObj = new URL(url);
      const path = urlObj.host + urlObj.pathname;
      const queryString = urlObj.search;

      console.log('🧩 Full URL:', url);
      console.log('📌 Host:', urlObj.host);
      console.log('📌 Pathname:', urlObj.pathname);
      console.log('🔍 Full Path:', path);
      console.log('🔍 Query String:', queryString);

      if (!queryString) {
        console.warn('⚠️ No query string found in URL');
        navigation.navigate('OrderFailed');
        return;
      }

      const params = Object.fromEntries(
        queryString
          .slice(1)
          .split('&')
          .map(param => {
            const [key, value] = param.split('=');
            return [key, decodeURIComponent(value)];
          })
      );

      const { status, code } = params;
      const token = await AsyncStorage.getItem('access_token');
      const { userId } = useCategoryStore.getState();

      console.log('📦 Parsed Params:', params);
      console.log('📘 Status:', status);
      console.log('📗 Code:', code);
      console.log('🔐 Auth info:', { token, userId });

      if (!token || !userId) {
        console.warn('❌ Thiếu token hoặc userId');
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại.');
        navigation.navigate('OrderFailed');
        return;
      }

      if (path === 'open/group-order') {
        if (status === '-1') {
          Alert.alert('Thông báo', 'Không thể tham gia nhóm.');
          return;
        }

        if (status === '1' && code) {
          try {
            console.log('📤 Sending join-group request:', {
              userId,
              code,
              typePayment: 'CASH',
            });

            const response = await axiosInstance.post(
              '/group-order/join-group',
              {
                userId,
                code,
                typePayment: 'CASH',
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('✅ Tham gia nhóm thành công:', response.data);

            Alert.alert('Thành công', 'Bạn đã tham gia nhóm!');

            navigation.navigate('GroupOrderList');
          } catch (err) {
            if (axios.isAxiosError(err)) {
              console.error('❌ Lỗi từ server:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers,
              });
            } else {
              console.error('❌ Lỗi không xác định khi gọi API:', err);
            }

            Alert.alert('Lỗi', 'Không thể tham gia nhóm.');

          }
        } else {
          Alert.alert('Lỗi', 'Thiếu mã nhóm hoặc trạng thái không hợp lệ.');

        }
      } if (path === 'open/order-group-complete') { 
         console.log('ℹ️ xử lý đơn hàng nhóm');

        if (status === '1') {
          setGroupCartId(null);
          ensureActiveCart();
          fetchUserCoin();
          navigation.navigate('OrderComplete');
        } else if (status === '-49') {
          fetchUserCoin();
          navigation.navigate('OrderFailed');
        } else {
          console.log('⚠️ Unknown status value:', status);
          navigation.navigate('OrderFailed');
        }

      }
      else {
        console.log('ℹ️ Không phải đường dẫn open/group-order, xử lý status theo giá trị khác.');

        if (status === '1') {
          setIdCartPause(null);
          setIdOrderPause(null);
          fetchUserCoin();
          navigation.navigate('OrderComplete');
        } else if (status === '-49') {
          fetchUserCoin();
          navigation.navigate('OrderFailed');
        } else {
          console.log('⚠️ Unknown status value:', status);
          navigation.navigate('OrderFailed');
        }
      }
    } catch (error) {
      console.error('❌ Xử lý deep link thất bại:', error);
      navigation.navigate('OrderFailed');
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('📲 App được mở lại từ deep link:', url);
      handleDeepLink(url);
    });

    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('🚀 App được mở lần đầu từ deep link:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  return null;
}
