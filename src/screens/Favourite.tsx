import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategoryStore } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler'; // Import Swipeable
import axiosInstance from '../utils/axiosInstance';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import EmptyListAnimation from '../components/EmptyListAnimation';
import LinearGradient from 'react-native-linear-gradient';
import { FONTFAMILY } from '../theme/theme';

const Favourite = () => {
  const { data, userId, deleteAllFavItem } = useCategoryStore();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const favoriteItems = data.favoriteItems || [];
  const products = data.products || [];

  const getProductDetails = (proId: number, size: string) => {
    const product = products.find((p) => p.proId === proId);
    const priceDetail = product?.listProductVariants?.find((s) => s.size === size);
    return {
      image: product?.productImageResponseList[0]?.linkImage || 'https://your-default-image-url.com/default.jpg',
      name: product?.proName || '',
      price: priceDetail ? priceDetail.price : 'N/A',
    };
  };

  const removeFavoriteItem = async (favItemId: number) => {

  };
  const removeAllFavorites = async () => {
    if (!userId || favoriteItems.length === 0) return;
    const favId: number = data.favoriteItems?.length ? data.favoriteItems[0].favId : 0;

    try {
      await deleteAllFavItem(favId);
      console.log("✅ Deleted all favorite items");
    } catch (error) {
      console.error("❌ Error deleting all favorite items:", error);
    }
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
          elevation: 5,
        }}
      />

      {favoriteItems.length === 0 ? (
        <EmptyListAnimation title={'Danh sách trống'} />
      ) : (
        <LinearGradient colors={['#f9f9f9', '#f9f9f9']} style={styles.container}>
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
                  <Swipeable
                    renderRightActions={() => (
                      <TouchableOpacity
                        style={styles.deleteButton1}
                        onPress={() => removeFavoriteItem(item.favItemId)}
                      >
                        <Icon name="delete" size={20} color="black" />
                      </TouchableOpacity>
                    )}
                  >
                    <View style={styles.card}>
                      <Image source={{ uri: image }} style={styles.image} />
                      <View style={styles.info}>
                        <Text style={styles.title}>{name}</Text>
                        <Text style={styles.size}>{t('size')}: {item.size}</Text>
                        <Text style={styles.price}>
                          {t('price')}: {formatPrice(Number(price))}đ
                        </Text>

                      </View>
                    </View>
                  </Swipeable>
                );

              }}
              showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
              showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang (nếu có)
              contentContainerStyle={{

                paddingTop: 10,
                paddingBottom: 20,
                justifyContent: 'space-between',
              }}

            />
          </View>
        </LinearGradient>
      )}
    </View>
  );
};

export default Favourite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily:FONTFAMILY.dongle_bold,
    color: '#333',
  },
  size: {
    fontSize: 24,
    fontFamily:FONTFAMILY.dongle_regular,
    color: 'gray',
  },
  price: {
    fontSize: 24,
    fontFamily:FONTFAMILY.dongle_bold,
    color: '#27ae60',
    
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  header: {
    fontSize: 24,
   fontFamily:FONTFAMILY.lobster_regular,
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  clearAllButton: {
    position: 'absolute',
    right: 10,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 5,
    marginHorizontal: 8,
    borderRadius: 10,
    marginTop: 10,
    height:'90%'
  },
  deleteButton: {
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 10,
    marginVertical: 5,
    marginRight: 5,
  },
  deleteButton1: {

    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 10,
    marginVertical: 5,
    marginRight: 5,
  },
});
