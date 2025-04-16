import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

export default function AppLinkHandler() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleDeepLink = (url: string) => {
    if (url.includes('order-complete')) {
      navigation.navigate('OrderComplete');
    } else if (url.includes('order-failed')) {
      navigation.navigate('OrderFailed');
    }
  };


  useEffect(() => {
    // Khi app đã chạy rồi
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Khi app đang bị tắt và được mở lên từ link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove(); // cleanup
    };
  }, [navigation]);

  return null;
}
