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
import { useCategoryStore } from "../store/store";
import homeStyles from "../styles/order";
import LinearGradient from "react-native-linear-gradient";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";

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

const OrderScreen = () => {
  const { data, fetchProducts } = useCategoryStore();
  const { categories = [], products = [] } = data;
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [visibleProducts, setVisibleProducts] = useState(6); // Hiển thị 6 sản phẩm ban đầu
  const [refreshing, setRefreshing] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchProducts(); // Fetch danh sách sản phẩm một lần duy nhất
  }, []);

  // ✅ Lọc sản phẩm theo danh mục
  const filteredProducts = useMemo(() => {
    return selectedCategory
      ? products.filter((product) => product.cateId === selectedCategory)
      : products;
  }, [selectedCategory, products]);

  // ✅ Chia danh mục thành từng nhóm 2 cái
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

  // ✅ Tải thêm sản phẩm khi cuộn xuống
  const loadMoreProducts = () => {
    if (visibleProducts < filteredProducts.length) {
      setVisibleProducts((prev) => prev + 6);
    }
  };

  // ✅ Làm mới danh sách sản phẩm
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setVisibleProducts(6); // Reset về 6 sản phẩm
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#fff", "#fff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Header style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, backgroundColor: "white" }} />
      </LinearGradient>

      <FlatList
        data={filteredProducts.slice(0, visibleProducts)} // Chỉ hiển thị sản phẩm cần thiết
        keyExtractor={(item) => item.proId.toString()}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
        ListHeaderComponent={
          <View style={homeStyles.categoryOrderContainer}>
            <Text style={homeStyles.categoryTitle}>{t("category")}</Text>
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
              <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
                {groupedCategories.map((group, index) => (
                  <View key={index} style={homeStyles.serviceOrderItem}>
                    {group.map((item) => (
                      <ServiceItem
                        key={item.cateId}
                        image={item.cateImg}
                        text={item.cateName}
                        isSelected={selectedCategory === item.cateId}
                        onPress={() =>
                          setSelectedCategory(selectedCategory === item.cateId ? null : item.cateId)
                        }
                      />
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* 🔹 Thanh cuộn (Scroll Bar) */}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={homeStyles.productItem}
            onPress={() =>
              navigation.navigate("ProductDetail", {
                product: { ...item, isFavourited: item.isFavourited ?? false },
              })
            }
          >
            <Image source={{ uri: item.productImageResponseList[0]?.linkImage }} style={homeStyles.productImage} />
            <View style={homeStyles.productInfo}>
              <Text style={homeStyles.productName}>{item.proName}</Text>
              <Text style={homeStyles.productPrice}>{item.listProductVariants[0]?.price} đ</Text>
              <TouchableOpacity
                style={homeStyles.addToCartButton}
                onPress={() =>
                  navigation.navigate("ProductDetail", {
                    product: { ...item, isFavourited: item.isFavourited ?? false },
                  })
                }
              >
                <Text style={homeStyles.addToCartText}>{t("detail")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          visibleProducts < filteredProducts.length ? <ActivityIndicator size="large" color="blue" /> : null
        }
       
        onEndReached={loadMoreProducts} // Cuộn xuống để tải thêm 6 sản phẩm
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;
