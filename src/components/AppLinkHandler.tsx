import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import queryString from 'query-string';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/store';

export default function AppLinkHandler() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setIdOrderPause, setIdCartPause, ensureActiveCart, fetchCartItem } = useCartStore();
  const {fetchUserCoin} = useCategoryStore();

  const handleDeepLink = (url: string) => {
    try {
      console.log('Deep link URL received:', url);
  
      // Lấy phần query string thủ công
      const queryString = url.split('?')[1];
      if (!queryString) {
        console.warn('No query string found in URL');
        navigation.navigate('OrderFailed');
        return;
      }
  
      const params = Object.fromEntries(
        queryString.split('&').map(param => {
          const [key, value] = param.split('=');
          return [key, decodeURIComponent(value)];
        })
      );
  
      const status = params.status;
      console.log('Parsed status:', status);
  
      if (status === '1') {
        setIdCartPause(null);
        setIdOrderPause(null);
        fetchUserCoin();
        navigation.navigate('OrderComplete');
      } else if (status === '-49') {
        fetchUserCoin();
        navigation.navigate('OrderFailed');
      } else {
        console.log('Unknown status value:', status);
        navigation.navigate('OrderFailed');
      }
    } catch (error) {
      console.error('Failed to handle deep link:', error);
      navigation.navigate('OrderFailed');
    }
  };  
  

  useEffect(() => {
    // Khi app đã chạy rồi
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('App opened from deep link with URL:', url);  // Log khi app mở lại từ deep link
      handleDeepLink(url);
    });

    // Khi app đang bị tắt và được mở lên từ link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('App opened from initial deep link URL:', url);  // Log khi app mở lần đầu từ deep link
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove(); // Cleanup
    };
  }, [navigation]);

  return null;
}
