import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategoryStore } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import EmptyListAnimation from '../components/EmptyListAnimation';
import LinearGradient from 'react-native-linear-gradient';


const Favourite = () => {
  const { data, userId, deleteAllFavItem } = useCategoryStore();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Lấy danh sách sản phẩm yêu thích và danh sách sản phẩm từ store
  const favoriteItems = data.favoriteItems || [];
  const products = data.products || [];

  // Hàm tìm chi tiết sản phẩm theo proId và size
  const getProductDetails = (proId: number, size: string) => {
    const product = products.find((p) => p.proId === proId);

    // Tìm giá theo size
    const priceDetail = product?.listProductVariants?.find((s) => s.size === size);
    const price = priceDetail ? priceDetail.price : 'N/A';

    return {
      image: product?.productImageResponseList[0]?.linkImage || 'https://your-default-image-url.com/default.jpg',
      name: product?.proName || '',
      price: price,
    };
  };

  // Hàm xóa tất cả sản phẩm yêu thích
  const removeAllFavorites = async () => {
    if (!userId || favoriteItems.length === 0) return;
  
    try {
      await deleteAllFavItem(userId);
      console.log("✅ Deleted all favorite items");
    } catch (error) {
      console.error("❌ Error deleting all favorite items:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Header
        style={{
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 10,
    
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5, // Dành cho Android
        }}
      />

      {favoriteItems.length === 0 ? (
        <EmptyListAnimation title={'Danh sách trống'} />
      ) : (
        <>
        <LinearGradient
          colors={['#f7eee9de', '#f3ebe0']}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.flatlistContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>{t('favourite.list')}</Text>
              <TouchableOpacity style={styles.clearAllButton} onPress={removeAllFavorites}>
                <Icon name="delete" size={16} color="white" />
              </TouchableOpacity>

            </View>

            <FlatList
              data={favoriteItems}
              keyExtractor={(item) => item.favItemId.toString()}
              renderItem={({ item }) => {
                const { image, name, price } = getProductDetails(item.proId, item.size);
                return (
                  <View style={styles.card}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <View style={styles.info}>
                      <Text style={styles.title}>{name}</Text>
                      <Text style={styles.size}>{t('size')}: {item.size}</Text>
                      <Text style={styles.price}>{t('price')}: {price} VND</Text>
                    </View>
                  </View>
                );
              }}
            />

          </View>
        </LinearGradient>
          



        </>
      )}
    </View>
  );
};

export default Favourite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Màu nền nhẹ nhàng hơn
    borderRadius: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4, // Android shadow
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12, // Khoảng cách giữa ảnh và text
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  size: {
    fontSize: 14,
    color: 'gray',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#27ae60', // Xanh lá cây
    marginTop: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Để title nằm giữa
    paddingVertical: 10,
    position: 'relative', // Giữ vị trí tương đối cho nút
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1, // Giúp căn giữa tiêu đề
  },
  clearAllButton: {
    position: 'absolute',
    right: 2, // Đẩy nút sát bên phải
    backgroundColor: '#FF5A5F',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  flatlistContainer: {
    backgroundColor: "#FFFFFF",
    padding: 5,
    marginHorizontal: 8,
    borderRadius: 10,
    marginTop:10
  }
});
