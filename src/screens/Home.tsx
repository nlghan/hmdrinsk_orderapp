import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Image, FlatList,
  SafeAreaView, ActivityIndicator, TouchableWithoutFeedback, RefreshControl,
  ListRenderItem
} from 'react-native';
import { useCategoryStore } from '../store/store';
import { COLORS } from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import MemberCard from '../components/MemberCard';
import RewardCard from '../components/RewardCard';
import ProductCard from '../components/ProductCard';
import Slider from '../components/Slider';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { StackNavigationProp } from '@react-navigation/stack';
import homeStyles from '../styles/home';
import Header from '../components/Header';
import { Product } from './ProductDetail';
import { Category } from '../store/store'; // Điều chỉnh đường dẫn phù hợp với dự án của bạn


const Home = () => {
  const { data, language } = useCategoryStore();
  const { categories, userInfo, products, userCoin } = data;
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  // 🟢 Fetch data khi component mount
  
  
  // 🟢 Lắng nghe sự thay đổi của `data` → Nếu có dữ liệu, tắt loading
  useEffect(() => {
    if (categories && products && userInfo !== undefined && userCoin !== undefined) {
      setLoading(false);
    }
  }, [categories, products, userInfo, userCoin]);
  
  // 🟢 Hàm xử lý Pull-to-Refresh
  const onRefresh = async () => {
    console.log("🔄 Refreshing...");
    setRefreshing(true);
    await Promise.all([
      useCategoryStore.getState().setLanguage(useCategoryStore.getState().language), // Gọi lại fetch dữ liệu
    ]);
    setTimeout(() => setRefreshing(false), 500);
  };

  // 🔹 Tạo `renderItem` với `useCallback` để tránh re-render không cần thiết
  const renderProductItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      image={item.productImageResponseList[0]?.linkImage}
      name={item.proName}
      price={item.listProductVariants[0]?.price}
      size={item.listProductVariants[0]?.size}
      onLongPress={() =>
        setSelectedProduct(prev => (prev === item.proId ? null : item.proId))
      }
      onPress={() => {
        console.log('Navigating to ProductDetail with:', item);
        navigation.navigate('ProductDetail', { product: item });
        setSelectedProduct(null);
      }}
      isSelected={selectedProduct === item.proId}
    />
  ), [selectedProduct, navigation]);

  // 🔹 Header của `FlatList` - Dùng useCallback để tránh render lại
  const renderListHeader = useCallback(() => (
    <>

      <MemberCard userInfo={userInfo} />
      <View style={homeStyles.rewardsContainer}>
        <RewardCard icon="confirmation-number" title={t('cart.voucher')} points={0} />
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
        <Text style={homeStyles.productTitle}>{t('common.proList')}</Text>
        <Text style={homeStyles.productTitle2}>{t('viewMore')}</Text>
      </View>
    </>
  ), [userInfo, userCoin, categories, t]);

  // 🔹 Render danh mục sản phẩm - Dùng `useCallback`
  const renderCategoryItem: ListRenderItem<Category> = useCallback(({ item }) => (
    <ServiceItem image={item.cateImg} text={item.cateName} />
  ), []);



  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* 🟢 Header với Background Gradient */}
      <View >
        <LinearGradient
          colors={[ '#f3ebe0', '#f7eee9de']} // 🎨 Gradient từ cam sang đỏ
          
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
         <Header style={{
                paddingHorizontal: 14,
                paddingTop: 10,
            }} />
        </LinearGradient>
      </View>

      <TouchableWithoutFeedback onPress={() => setSelectedProduct(null)}>
        <LinearGradient
          colors={['#f7eee9de', '#f3ebe0']}
          style={homeStyles.container}
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
              data={products}
              numColumns={2}
              keyExtractor={(item) => item.proId.toString()}
              renderItem={renderProductItem}
              initialNumToRender={6} // ✅ Chỉ render 6 sản phẩm đầu tiên
              maxToRenderPerBatch={8} // ✅ Render thêm tối đa 8 sản phẩm khi cần
              windowSize={5} // ✅ Giữ 5 màn hình trong bộ nhớ để cuộn mượt hơn
              getItemLayout={(_, index) => ({
                length: 250, // ✅ Cố định chiều cao mỗi item giúp tối ưu cuộn
                offset: 250 * index,
                index,
              })}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff8c00']} />
              }
              contentContainerStyle={{
                paddingHorizontal: 14,
                paddingTop: 10,
                paddingBottom: 80,
              }}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderListHeader}
            />
          )}
        </LinearGradient>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

// 🔹 Component hiển thị danh mục dịch vụ
const ServiceItem: React.FC<{ image: string; text: string }> = ({ image, text }) => (
  <TouchableOpacity style={homeStyles.serviceItem}>
    <Image source={{ uri: image }} style={homeStyles.serviceImage} />
    <Text style={homeStyles.serviceText}>{text}</Text>
  </TouchableOpacity>
);

export default Home;
