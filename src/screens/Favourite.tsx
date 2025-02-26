import React, { useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategoryStore } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import EmptyListAnimation from '../components/EmptyListAnimation';

const Favourite = () => {
  const { data, userId } = useCategoryStore();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Lấy danh sách sản phẩm yêu thích
  const favoriteItems = data.favoriteItems || [];

  // Hàm xóa tất cả sản phẩm yêu thích
  const removeAllFavorites = async () => {
    if (!userId || favoriteItems.length === 0) return;

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) return;

      await axiosInstance.delete(`/fav/delete-allItem/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { userId, favId: 1 }, // favId cần thay đổi theo hệ thống backend
      });

      // Cập nhật store sau khi xóa tất cả
      useCategoryStore.setState((state) => ({
        data: { ...state.data, favoriteItems: [] },
      }));

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
                    marginBottom: 10,
                    backgroundColor: 'white', // Giữ nền rõ hơn với shadow
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5, // Dành cho Android
                }}
            />
      <Text style={styles.header}>{t('favourite.list')}</Text>

      {favoriteItems.length === 0 ? (
        <EmptyListAnimation title={'Danh sách trống'} />
      ) : (
        <>
          <TouchableOpacity style={styles.clearAllButton} onPress={removeAllFavorites}>
            <Icon name="delete" size={16} color="white" />
          </TouchableOpacity>

          <FlatList
            data={favoriteItems}
            keyExtractor={(item) => item.favItemId.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: `https://your-image-url.com/${item.proId}.jpg` }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.title}>Sản phẩm {item.proId}</Text>
                  <Text style={styles.size}>Size: {item.size}</Text>
                </View>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

export default Favourite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    width: 40,
    display: 'flex',
    alignSelf: 'flex-end', // Đẩy nút về bên phải trong container
    marginRight:8
},

  clearAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal:8
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  size: {
    fontSize: 14,
    color: 'gray',
  },
});
