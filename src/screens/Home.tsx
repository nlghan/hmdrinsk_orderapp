import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, FlatList,
  SafeAreaView, ActivityIndicator, TouchableWithoutFeedback, RefreshControl,
  ListRenderItem, Keyboard,
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
import Notification from '../components/Notification';
import Alert from '../components/Alert';
import GlobalAlert from './GlobalAlert';


const Home = () => {
  const { data, insertFavoriteItem } = useCategoryStore();
  const { categories, userInfo, userCoin } = data;
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [notification, setNotification] = useState({ message: '', visible: false });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const token = AsyncStorage.getItem('access_token');
  const { language, userId, checkShipment } = useCategoryStore();
  const { fetchCartItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart, ensureActiveCart } = useCartStore();
  const [filteredProducts, setFilteredProducts] = useState(products);

  const fetchProducts = async () => {
        try {
            const token = await AsyncStorage.getItem("access_token");
            const userId = useCategoryStore.getState().userId; // Lấy userId từ store
    
            if (!userId) {
                console.warn("⚠️ [fetchRecommendedProducts] User ID is missing!");
                setLoading(false);
                return;
            }
    
            // Gọi song song API gợi ý và yêu thích
            const [apiResponse, favResponse] = await Promise.all([
                axiosInstance.get(`/product/recommend?language=${language}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axiosInstance.get(`/fav/list-fav/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);
    
            console.log("📥 Phản hồi từ API gợi ý:", apiResponse.data);
            console.log("📥 API gợi ý trả về:", apiResponse.data.productResponses.length, "sản phẩm");
            const apiProducts = apiResponse.data.productResponses || [];
    
            const favId = favResponse.data?.favId || null;
    
            let favoriteItems = [];
            if (favId) {
                try {
                    const favItemsResponse = await axiosInstance.get(`/fav/list-favItem/${favId}?language=${language}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    favoriteItems = favItemsResponse.data.favouriteItemResponseList || [];
                } catch (error) {
                    console.error("❌ [fetchRecommendedProducts] Lỗi khi lấy danh sách yêu thích:", error);
                }
            }
    
            const updatedProducts = apiProducts.map((product: { proId: any; }) => ({
                ...product,
                isFavourited: favoriteItems.some((favItem: { proId: any; }) => favItem.proId === product.proId),
            }));
    
            setFilteredProducts(updatedProducts);
        } catch (error) {
            console.log("❌ Lỗi khi lấy sản phẩm gợi ý:", error);
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
      await Promise.all([
        checkShipment(),
        fetchProducts(),
        ensureActiveCart()
      ]);
  
      // Sau khi đã có cartId, mới fetchCartItem
      await fetchCartItem();
    } catch (error) {
      console.error("❌ Lỗi khi làm mới dữ liệu:", error);
    } finally {
      setRefreshing(false);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();

    }, []) // Mỗi khi searchTerm thay đổi
  );

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    // Ẩn thông báo sau 3 giây
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
  };

  const handleAddToCart = (proId: number, size: string ) => {
   
    const quantity = 1; // Mặc định thêm 1 sản phẩm

    if (!proId || !size) {
      showNotification("⚠️ Thông tin sản phẩm không hợp lệ!");
      return;
    }

    const payload = { proId, size, quantity, language };

    console.log("📦 Payload gửi đi:", payload);

    addToCart(proId, size, quantity, language)
      .then(() => {
        showNotification("✅ Sản phẩm đã được thêm vào giỏ hàng!");
      })
      .catch((error: { message: string; }) => {
        console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
        const message = error.message || "";
        if (message.includes("Vượt quá số lượng tồn kho")) {
          showNotification("⚠️ Số lượng sản phẩm vượt quá số lượng tồn kho!");
        } else {
          showNotification("❌ Lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!");
        }
      });
  };

  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      proId ={item.proId}
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
      onAddToCart={async (proId: number, size: string) => handleAddToCart(proId, size)}
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
      <GlobalAlert children={undefined} />
      <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
      <NotificationPopup userId={userId ?? 0} />
      <View>
        <LinearGradient
          colors={['#fff', '#fdfcf0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Header style={{ paddingHorizontal: 14, paddingVertical:10 }} />
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
              data={filteredProducts} // ✅ Chỉ lấy 8 sản phẩm đầu
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
                paddingBottom: 125,
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
