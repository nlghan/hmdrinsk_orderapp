import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
import { useTranslation } from 'react-i18next';
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";

// 🔹 Component hiển thị danh mục dịch vụ
const ServiceItem: React.FC<{ image: string; text?: string; onPress: () => void; isSelected: boolean }> = ({
  image,
  text = "",  // Đảm bảo text luôn có giá trị
  onPress,
  isSelected,
}) => (
  <TouchableOpacity style={homeStyles.serviceOrderItem} onPress={onPress}>
    <View style={homeStyles.imageWrapper}>
      <Image source={{ uri: image }} style={homeStyles.serviceOrderImage} />
      {isSelected && <View style={homeStyles.overlay} />}
    </View>
    <Text style={[homeStyles.serviceOrderText, isSelected && homeStyles.serviceOrderTextSelected]}>
      {String(text) || "No Name"}
    </Text>
  </TouchableOpacity>
);

const OrderScreen = () => {
  const { data, fetchProducts } = useCategoryStore();
  const { categories = [] } = data;
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const isFetched = useRef(false);

  useEffect(() => {
    if (!isFetched.current) {
      fetchProducts(page);
      isFetched.current = true;
    }
  }, [page]);

  const loadMoreProducts = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    await fetchProducts(page + 1);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [loading, page]);

  const onRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setPage(1);
    await fetchProducts(1);
    setRefreshing(false);
  };

  const groupedCategories = categories.reduce((acc: any[][], curr: { cateId: { toString: () => any } }, index: number) => {
    if (index % 2 === 0) {
      acc.push([{ ...curr, cateId: curr.cateId.toString() }]);
    } else {
      acc[acc.length - 1].push({ ...curr, cateId: curr.cateId.toString() });
    }
    return acc;
  }, [] as Array<Array<{ cateId: string; cateImg: string; cateName: string }>>);

  const filteredProducts = useMemo(() => {
    return selectedCategory
      ? data.products?.filter((product) => product.cateId === selectedCategory)
      : data.products;
  }, [selectedCategory, data.products]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#fff", "#fff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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
      </LinearGradient>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.proId.toString()}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
        ListHeaderComponent={
          <View style={homeStyles.categoryOrderContainer}>
            <Text style={homeStyles.categoryTitle}>{t('category')}</Text>
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
                  <View key={index} style={{ flexDirection: "column", marginRight: 16 }}>
                    {group.map((item) => (
                      <ServiceItem
                        key={item.cateId}
                        image={item.cateImg}
                        text={item.cateName}
                        isSelected={selectedCategory === parseInt(item.cateId)}
                        onPress={() =>
                          setSelectedCategory(selectedCategory === parseInt(item.cateId) ? null : parseInt(item.cateId))
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={homeStyles.productItem}
            onPress={() => navigation.navigate("ProductDetail", { product: { ...item, isFavourited: item.isFavourited ?? false } })}
          >
            <Image source={{ uri: item.productImageResponseList[0]?.linkImage }} style={homeStyles.productImage} />
            <View style={homeStyles.productInfo}>
              <Text style={homeStyles.productName}>{item.proName}</Text>
              <Text style={homeStyles.productPrice}>{item.listProductVariants[0]?.price} đ</Text>
              <TouchableOpacity
                style={homeStyles.addToCartButton}
                onPress={() => navigation.navigate("ProductDetail", { product: { ...item, isFavourited: item.isFavourited ?? false } })}
              >
                <Text style={homeStyles.addToCartText}>{t('detail')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" /> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;
