import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useCategoryStore } from "../store/store";
import homeStyles from "../styles/searchStyle";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';  // Thêm lodash debounce
import Loading from "../components/DotLoading";

const Search = () => {
    const { data } = useCategoryStore();
    const { t } = useTranslation();
    const { products = [] } = data || {}; 
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [loading, setLoading] = useState(false);
    const { language } = useCategoryStore();
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    // Gọi API 'recommend' khi component được focus hoặc khi searchTerm thay đổi
    useFocusEffect(
        React.useCallback(() => {
            if (!debouncedSearchTerm) {
                fetchRecommendedProducts(); // Lấy sản phẩm gợi ý khi searchTerm rỗng
            } 
        }, [debouncedSearchTerm]) // Mỗi khi searchTerm thay đổi
    );
    
    useEffect(() => {
        if (!debouncedSearchTerm) {
            fetchRecommendedProducts(); // Gọi API gợi ý nếu không có từ khóa tìm kiếm
        } else {
            searchProducts(debouncedSearchTerm); // Tìm kiếm sản phẩm khi có từ khóa
        }
    }, [debouncedSearchTerm]);

    // Hàm tìm kiếm sản phẩm
    const searchProducts = async (keyword: string) => {
        if (!keyword) return;

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const response = await axiosInstance.get(`/product/search?keyword=${keyword}&page=1&limit=10&language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📥 Phản hồi từ API tìm kiếm:", response.data);
            const productsFromApi = response.data.productResponseList || [];
            const updatedProducts = await markFavoriteStatus(productsFromApi);
            setFilteredProducts(updatedProducts);
        } catch (error) {
            console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    // Đặt debounce cho hàm tìm kiếm
    const debouncedSearch = useCallback(debounce((keyword) => {
        setDebouncedSearchTerm(keyword); // Set debounced search term to trigger API calls
    }, 500), []);  // Reduce debounce time to 500ms

    // Chạy debounce khi searchTerm thay đổi
    useEffect(() => {
        debouncedSearch(searchTerm); // Gọi hàm tìm kiếm đã debounce mỗi khi searchTerm thay đổi
    }, [searchTerm, debouncedSearch]);

    // Gọi API sản phẩm gợi ý
    const fetchRecommendedProducts = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Đánh dấu các sản phẩm yêu thích
    const markFavoriteStatus = async (products: any[]) => {
        const token = await AsyncStorage.getItem("access_token");
        const userId = useCategoryStore.getState().userId;
        
        if (!userId) {
            return products;
        }

        const favResponse = await axiosInstance.get(`/fav/list-fav/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const favId = favResponse.data?.favId || null;
        let favoriteItems = [];

        if (favId) {
            try {
                const favItemsResponse = await axiosInstance.get(`/fav/list-favItem/${favId}?language=${language}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                favoriteItems = favItemsResponse.data.favouriteItemResponseList || [];
            } catch (error) {
                console.error("❌ [markFavoriteStatus] Lỗi khi lấy danh sách yêu thích:", error);
            }
        }

        return products.map((product) => ({
            ...product,
            isFavourited: favoriteItems.some((favItem: { proId: any; }) => favItem.proId === product.proId),
        }));
    };

    // Hàm lọc sản phẩm dựa trên từ khóa tìm kiếm (debounced)
    const filterProducts = (products: any[]) => {
        return debouncedSearchTerm
            ? products.filter(product => {
                const searchWords = debouncedSearchTerm.toLowerCase().split(" ");
                const productName = product.proName.toLowerCase();
                return searchWords.every(word => productName.includes(word)); // Kiểm tra từng từ có xuất hiện không
            })
            : products;
    };

    const handleClearSearch = () => {
        setSearchTerm(""); // Xóa nội dung tìm kiếm
    };

    // Memoize the filtered products
    const memoizedFilteredProducts = useMemo(() => filterProducts(filteredProducts), [debouncedSearchTerm, filteredProducts]);

    return (
        <View style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
            {/* Header */}
            <View style={homeStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={homeStyles.headerTitle}>{t('productContent.search')}</Text>
            </View>

            {/* Thanh tìm kiếm */}
            <View style={homeStyles.searchBar}>
                <Icon name="search" size={24} color="#333" />
                <TextInput
                    style={homeStyles.searchInput}
                    placeholder={t('menuCustomer.want')}
                    placeholderTextColor="gray"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch}>
                        <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                )}
            </View>
            
            {memoizedFilteredProducts.length === 0 && !loading && searchTerm && (
                <Text style={homeStyles.noResult}>{t('menuCustomer.notFound')}</Text>
            )}

            {loading ? (
                <View style={{
                    position: 'absolute',
                    top: '-60%',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    zIndex: 999,  // Đảm bảo overlay nằm trên tất cả
                }}>
                    <Loading title={''} />
                </View>
            ) : (
                <>
                    {memoizedFilteredProducts.length > 0 && (
                        <View>
                            <Text style={homeStyles.suggestHeader}>{t('android.suggest')}</Text>
                        </View>
                    )}
                    <FlatList
                        data={memoizedFilteredProducts}
                        keyExtractor={(item) => item.proId.toString()}
                        numColumns={2}
                        renderItem={({ item, index }) => {
                            const containerStyle = index % 2 === 0 ? homeStyles.leftColumn : homeStyles.rightColumn;
                            
                            return (
                                <TouchableOpacity
                                    style={[homeStyles.postWrapper, containerStyle]}
                                    onPress={() => navigation.navigate("ProductDetail", { product: { ...item, isFavourited: !!item.isFavourited } })}
                                    activeOpacity={0.9}
                                >
                                    <View style={homeStyles.item}>
                                        {item.productImageResponseList.length > 0 && (
                                            <Image
                                                source={{ uri: item.productImageResponseList[0].linkImage }}
                                                style={homeStyles.productImage}
                                            />
                                        )}
                                        <Text style={homeStyles.cardTitle}>{item.proName}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </>
            )}
        </View>
    );
};

export default Search;
