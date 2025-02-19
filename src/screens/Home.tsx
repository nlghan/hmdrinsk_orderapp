import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, SafeAreaView } from 'react-native';
import { useCategoryStore } from '../store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import MemberCard from '../components/MemberCard';
import RewardCard from '../components/RewardCard';
import ProductCard from '../components/ProductCard';
import Slider from '../components/Slider';

const Home = () => {
  const { categories, fetchCategories, userInfo, fetchUserInfo, products, fetchProducts } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
    fetchUserInfo();
    fetchProducts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#f7eee9de', '#f3ebe0']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <FlatList
          data={products}
          numColumns={2} // Hiển thị 2 sản phẩm mỗi hàng
          keyExtractor={(item) => item.proId.toString()}
          renderItem={({ item }) => (
            <ProductCard
              image={item.productImageResponseList[0]?.linkImage}
              name={item.proName}
              price={item.listProductVariants[0]?.price}
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 80, // 👈 Thêm padding để tránh bị BottomNavigator che
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Tiêu đề */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image source={require('../assets/app_images/logomini.png')} style={styles.logo} />
                  <Text style={styles.greeting}>Bạn ơi, Cà Phê nhé!</Text>
                </View>

                <View style={styles.headerIcons}>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon name="confirmation-number" size={20} color={COLORS.primaryGreenHex} />
                    <Text style={styles.iconText}>12</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon name="notifications" size={20} color={COLORS.blackAlpha} />
                    <View style={styles.notificationDot} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Thẻ thành viên */}
              <MemberCard userInfo={userInfo} />
              <View style={styles.rewardsContainer}>
                <RewardCard icon="confirmation-number" title="VOUCHER" points={0} />
                <RewardCard icon="savings" title="COINS" points={0} />
              </View>

              {/* Danh mục */}
              <Text style={styles.categoryTitle}>Danh mục</Text>
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item.cateId.toString()}
                renderItem={({ item }) => <ServiceItem image={item.cateImg} text={item.cateName} />}
                contentContainerStyle={styles.services}
                showsHorizontalScrollIndicator={false}
              />

              <Slider /> 

              {/* Tiêu đề sản phẩm */}
              <View style={styles.productHeader}>
                <Text style={styles.productTitle}>Danh sách sản phẩm</Text>
                <Text style={styles.productTitle2}>Xem thêm</Text>
              </View>

            </>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

// Component hiển thị từng danh mục
const ServiceItem: React.FC<{ image: string; text: string }> = ({ image, text }) => (
  <TouchableOpacity style={styles.serviceItem}>
    <Image source={{ uri: image }} style={styles.serviceImage} />
    <Text style={styles.serviceText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
    resizeMode: 'contain',
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.primaryGreenHex,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 5,
    gap: 10,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingHorizontal: 14,
    marginTop: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
    marginLeft: 8,
    letterSpacing: 1,
  },
  serviceItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  serviceImage: {
    width: 65,
    height: 65,
    borderRadius: 30,
  },
  serviceText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  productList: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  productHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    alignItems: 'center'
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
    marginLeft: 8,
    letterSpacing: 1,
    alignItems: 'center'
  },
  productTitle2: {
    fontSize: 13,
    color: 'black',
    marginTop: 10,
    marginRight: 8,
    letterSpacing: 1,
  },

});

export default Home;
