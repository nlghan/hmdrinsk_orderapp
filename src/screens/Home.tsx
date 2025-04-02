import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, FlatList,
  SafeAreaView, ActivityIndicator, TouchableWithoutFeedback, RefreshControl,
  ListRenderItem, Keyboard, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from '../store/store';
import { COLORS } from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import homeStyles from '../styles/home';
import Header from '../components/Header';
import MemberCard from '../components/MemberCard';
import RewardCard from '../components/RewardCard';
import ProductCard from '../components/ProductCard';
import Slider from '../components/Slider';
import { Product } from './ProductDetail';
import { Category } from '../store/store';
import { useCartStore } from '../store/useCartStore';
import useWebSocket from '../utils/Socket';
import NotificationPopup from '../components/NotificationPopup';
import axiosInstance from '../utils/axiosInstance';


const Home = () => {
  const { data, insertFavoriteItem } = useCategoryStore();
  const { categories, userInfo, userCoin } = data;
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const token = AsyncStorage.getItem('access_token');
  const { language, userId } = useCategoryStore();
  const { fetchCartItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await axiosInstance.get(`/product/recommend?language=${language}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📥 Phản hồi từ API:", response.data); // In ra toàn bộ dữ liệu nhận được

      setProducts(response.data.productResponses || []);
    } catch (error) {
      console.error('❌ Lỗi khi lấy sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  // ✅ Khi chuyển trang, hủy chọn sản phẩm
  useFocusEffect(
    useCallback(() => {
      return () => setSelectedProduct(null);
    }, [])
  );

  useEffect(() => {
    if (categories || products || userInfo !== undefined || userCoin !== undefined) {
      setLoading(false);
    }
  }, [categories, products, userInfo, userCoin]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await useCategoryStore.getState().setLanguage(useCategoryStore.getState().language);
        await useCartStore.getState().fetchVoucher(); // ✅ Gọi fetchVoucher ở đây
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Cập nhật ngôn ngữ nếu cần (nếu setLanguage là sync thì không cần await)
      useCategoryStore.getState().setLanguage(useCategoryStore.getState().language);

      // Chờ lấy dữ liệu sản phẩm
      await fetchProducts();
      await fetchCartItem();
    } catch (error) {
      console.error("❌ Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setRefreshing(false);
    }
  };



  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      image={item.productImageResponseList?.[0]?.linkImage || 'https://via.placeholder.com/150'}
      name={item.proName || 'No name'}
      price={item.listProductVariants?.[0]?.price || 0}
      size={item.listProductVariants?.[0]?.size || 'N/A'}
      onLongPress={() => setSelectedProduct(prev => (prev === item.proId ? null : item.proId))}
      onPress={() => {
        setSelectedProduct(null);
        navigation.navigate('ProductDetail', { product: item });
      }}
      isSelected={selectedProduct === item.proId}
      isFavourited={item.isFavourited ?? false}
      insertFavoriteItem={insertFavoriteItem}
    />
  ), [selectedProduct, navigation]);

  const renderListHeader = useCallback(() => (
    <>
      <MemberCard userInfo={userInfo} />
      <View style={homeStyles.rewardsContainer}>
          <RewardCard
            icon="confirmation-number"
            title={t('cart.voucher')}
            points={useCartStore.getState().voucherTotal}
            onPress={() => navigation.navigate('ListVoucher')}
          />
        <RewardCard icon="savings" title={t('cart.coinname')} points={userCoin ?? 0} />
      </View>
      <Text style={homeStyles.categoryTitle}>{t('category')}</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.cateId.toString()}
        renderItem={renderCategoryItem}
        contentContainerStyle={homeStyles.services}
        showsHorizontalScrollIndicator={false}
      />
      <Slider />
      <View style={homeStyles.productHeader}>
        <Text style={homeStyles.productTitle}>{t('products.maybe')}</Text>
        <TouchableOpacity onPress={() => {
          navigation.navigate('Order', {
            state: { cateId: 0 } // Truyền cateId qua state
          }
          )
        }}>
          <Text style={homeStyles.productTitle2}>{t('viewMore')}</Text>
        </TouchableOpacity>

      </View>
    </>
  ), [userInfo, userCoin, categories, t]);

  const renderCategoryItem: ListRenderItem<Category> = useCallback(({ item }) => (
    <ServiceItem
      image={item.cateImg}
      text={item.cateName}
      onPress={() => {
        navigation.navigate('Order', {
          state: { cateId: item.cateId } // Truyền cateId qua state
        });
      }}
    />
  ), []);



  return (
    <View style={{ flex: 1 }}>
      <NotificationPopup userId={userId ?? 0} />
      <View>
        <LinearGradient
          colors={['#fff', '#fdfcf0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Header style={{ paddingHorizontal: 14, paddingTop: 10 }} />
        </LinearGradient>
      </View>

      {/* 🟢 Bấm ra ngoài sẽ bỏ chọn sản phẩm */}
      <TouchableWithoutFeedback onPress={() => {
        setSelectedProduct(null);
        Keyboard.dismiss(); // Ẩn bàn phím nếu đang mở
      }}>
        <LinearGradient
          colors={['#fff', '#fdfcf0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {loading ? (
            <View style={homeStyles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primaryGreenHex} />
              <Text style={homeStyles.loadingText}>{t('loading')}</Text>
            </View>
          ) : (
            <FlatList
              data={products} // ✅ Chỉ lấy 8 sản phẩm đầu
              numColumns={2}
              keyExtractor={(item) => item.proId.toString()}
              renderItem={renderProductItem}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
              getItemLayout={(_, index) => ({
                length: 250,
                offset: 250 * index,
                index,
              })}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff8c00']} />
              }
              contentContainerStyle={{
                paddingHorizontal: 14,
                paddingTop: 10,
                paddingBottom: 110,
                justifyContent: 'space-between',
              }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderListHeader}
            />
          )}
        </LinearGradient>
      </TouchableWithoutFeedback>
    </View>
  );
};

// 🔹 Component hiển thị danh mục
const ServiceItem: React.FC<{ image: string; text: string; onPress: () => void }> = ({ image, text, onPress }) => (
  <TouchableOpacity style={homeStyles.serviceItem} onPress={onPress}>
    <Image source={{ uri: image }} style={homeStyles.serviceImage} />
    <Text style={homeStyles.serviceText}>{text}</Text>
  </TouchableOpacity>
);


export default Home;
