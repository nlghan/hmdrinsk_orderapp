import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Animated,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {FONTFAMILY, FONTSIZE} from '../theme/theme';
import { useCategoryStore } from "../store/store";
import homeStyles from "../styles/order";
import LinearGradient from "react-native-linear-gradient";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../theme/theme";
import FastImage from "react-native-fast-image";
import { useRoute, RouteProp } from '@react-navigation/native';

// 🔹 Component hiển thị danh mục dịch vụ
const ServiceItem: React.FC<{ image: string; text?: string; onPress: () => void; isSelected: boolean }> = ({
  image,
  text = "",
  onPress,
  isSelected,
}) => (
  <TouchableOpacity style={homeStyles.serviceOrderItem} onPress={onPress}>
    <View style={homeStyles.imageWrapper}>
      <Image source={{ uri: image }} style={homeStyles.serviceOrderImage} />
      {isSelected && <View style={homeStyles.overlay} />}
    </View>
    <Text style={[homeStyles.serviceOrderText, isSelected && homeStyles.serviceOrderTextSelected]}>
      {text || "No Name"}
    </Text>
  </TouchableOpacity>
);

// 🔹 Component hiển thị từng sản phẩm
const ProductItem = ({ item, navigation }: { item: any; navigation: any }) => {
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const onImageLoad = () => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const price0 = item.listProductVariants[0]?.stock !== 0 ? item.listProductVariants[0]?.price : 0;
  const price1 = item.listProductVariants[1]?.stock !== 0 ? item.listProductVariants[1]?.price : 0;
  const price2 = item.listProductVariants[2]?.stock !== 0 ? item.listProductVariants[2]?.price : 0;

  const isOutOfStock =
    (item.listProductVariants[0]?.stock || 0) === 0 &&
    (item.listProductVariants[1]?.stock || 0) === 0 &&
    (item.listProductVariants[2]?.stock || 0) === 0;

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

  return (
    <TouchableOpacity
      style={[
        homeStyles.productItem,
        isOutOfStock && { backgroundColor: "#D3D3D3", opacity: 0.5 },
      ]}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          product: {
            ...item,
            isFavourited: item.isFavourited ?? false,
            images: item.productImageResponseList.map((img: any) => img.linkImage), // Truyền danh sách ảnh
          },
        })
      }
      disabled={isOutOfStock}
    >
      <AnimatedFastImage
        source={{
          uri: item.productImageResponseList[0]?.linkImage,
          priority: FastImage.priority.high,
        }}
        style={[homeStyles.productImage, { opacity: imageOpacity }]}
        resizeMode={FastImage.resizeMode.cover}
        onLoad={onImageLoad}
      />

      <View style={homeStyles.productInfo}>
        <Text style={homeStyles.productName}>{item.proName}</Text>

        {isOutOfStock ? (
          <Text style={[homeStyles.productPrice, { color: "red", fontSize: 24, fontFamily: FONTFAMILY.dongle_bold}]}>
            {t('products.outStock')}
          </Text>
        ) : (
          <Text style={homeStyles.productPrice}>
            {`${formatPrice(price0 || price1 || price2)}đ`}
          </Text>
        )}

        <TouchableOpacity
          style={[
            homeStyles.addToCartButton,
            isOutOfStock && { backgroundColor: "#A9A9A9" },
          ]}
          onPress={() =>
            navigation.navigate("ProductDetail", {
              product: {
                ...item,
                isFavourited: item.isFavourited ?? false,
                images: item.productImageResponseList.map((img: any) => img.linkImage), // Truyền danh sách ảnh
              },
            })
          }
          disabled={isOutOfStock}
        >
          <Text style={homeStyles.addToCartText}>
            <Icon name="arrow-forward" size={20} color={COLORS.primaryGreenHex} />
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};


const OrderScreen = () => {
  const { data, fetchProducts, checkShipment } = useCategoryStore();
  const { categories = [], products = [] } = data;
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [visibleProducts, setVisibleProducts] = useState(6);
  const [refreshing, setRefreshing] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const route = useRoute<RouteProp<RootStackParamList, 'Order'>>();

  const cateIdFromHome = route.params?.state?.cateId || null;

  useEffect(() => {
    if (cateIdFromHome !== null) {
      console.log("CateId from Home:", cateIdFromHome);
      setSelectedCategory(cateIdFromHome); // Cập nhật selectedCategory với cateIdFromHome
    }
  }, [cateIdFromHome]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('blur', () => {
  //     setSelectedCategory(null); // Reset selectedCategory khi rời khỏi trang
  //   });

  //   return unsubscribe;
  // }, [navigation]);
  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategory
      ? products.filter((product) => product.cateId === selectedCategory)
      : products;
  }, [selectedCategory, products]);

  const groupedCategories = useMemo(() => {
    return categories.reduce((acc: any[][], curr, index) => {
      if (index % 2 === 0) {
        acc.push([curr]);
      } else {
        acc[acc.length - 1].push(curr);
      }
      return acc;
    }, []);
  }, [categories]);

  const loadMoreProducts = () => {
    if (visibleProducts < filteredProducts.length) {
      setVisibleProducts((prev) => prev + 6);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    await checkShipment();
    setVisibleProducts(6);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#fff", "#fff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Header
          style={{
            paddingHorizontal: 14,
            paddingVertical:10,
            paddingBottom: 10,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        />
      </LinearGradient>

      <FlatList
        data={filteredProducts.slice(0, visibleProducts)}
        keyExtractor={(item) => item.proId.toString()}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={homeStyles.categoryOrderContainer}>
            <View style={homeStyles.categoryOrderHeader}>
              <Text style={homeStyles.categoryTitle}>{t("category")}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Search")}>
                <Icon name="search" size={25} color={COLORS.primaryGreenHex} />
              </TouchableOpacity>

            </View>

            <ScrollView
  ref={scrollViewRef}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={homeStyles.servicesOrder}
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )}
  scrollEventThrottle={16}
>
  <View style={{ flexDirection: "row" }}>
    {groupedCategories.map((group, index) => (
      <View
        key={index}
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          marginHorizontal: 5,
        }}
      >
        {group.map((item) => (
          <ServiceItem
            key={item.cateId}
            image={item.cateImg}
            text={item.cateName}
            isSelected={selectedCategory === item.cateId}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === item.cateId ? null : item.cateId
              )
            }
          />
        ))}
      </View>
    ))}
  </View>
</ScrollView>


            <View style={homeStyles.scrollBarContainer}>
              <Animated.View
                style={[
                  homeStyles.scrollBarIndicator,
                  {
                    transform: [
                      {
                        translateX: scrollX.interpolate({
                          inputRange: [0, categories.length * 80],
                          outputRange: [0, 50],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => <ProductItem item={item} navigation={navigation} />}
        ListFooterComponent={
          visibleProducts < filteredProducts.length ? <ActivityIndicator size="large" color="blue" /> : null
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;
