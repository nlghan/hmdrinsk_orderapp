import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useCategoryStore } from "../store/store";
import homeStyles from "../styles/searchStyle";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

const Search = () => {
    const { data } = useCategoryStore();
    const { t } = useTranslation();
    const { products = [] } = data || {}; 
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [loading, setLoading] = useState(false);
    const { language } = useCategoryStore();

    useEffect(() => {
        if (!searchTerm) {
            // Gọi API 'recommend' khi không có từ khóa tìm kiếm
            fetchRecommendedProducts();
        } else {
            // Gọi API tìm kiếm với từ khóa
            searchProducts(searchTerm);
        }
    }, [searchTerm]);

    // Gọi API tìm kiếm sản phẩm
    const searchProducts = async (keyword: string) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const response = await axiosInstance.get(`/product/search?keyword=${keyword}&page=1&limit=10&language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📥 Phản hồi từ API tìm kiếm:", response.data);
            setFilteredProducts(response.data.productResponseList || []);
        } catch (error) {
            console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API sản phẩm gợi ý
    const fetchRecommendedProducts = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("access_token");
            const response = await axiosInstance.get(`/product/recommend?language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("📥 Phản hồi từ API gợi ý:", response.data);
            setFilteredProducts(response.data.productResponses || []);
        } catch (error) {
            console.error("❌ Lỗi khi lấy sản phẩm gợi ý:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm(""); // Xóa nội dung tìm kiếm
    };

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
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {/* Hiển thị biểu tượng "Close" khi có nội dung trong input */}
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch}>
                        <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                )}
            </View>
            
            {/* Hiển thị khi không có sản phẩm tìm thấy */}
            {filteredProducts.length === 0 && !loading && searchTerm && (
                <Text style={homeStyles.noResult}>{t('menuCustomer.notFound')}</Text>
            )}

            {/* Hiển thị kết quả tìm kiếm hoặc gợi ý sản phẩm */}
            {loading ? (
                <ActivityIndicator size="large" color="#ff8c00" />
            ) : (
                <>
                    {/* Hiển thị phần gợi ý chỉ khi có kết quả tìm kiếm */}
                    {filteredProducts.length > 0 && (
                        <View>
                            <Text style={homeStyles.suggestHeader}>{t('android.suggest')}</Text>
                        </View>
                    )}
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.proId.toString()}
                        numColumns={2}
                        renderItem={({ item, index }) => {
                            const containerStyle = index % 2 === 0 ? homeStyles.leftColumn : homeStyles.rightColumn;

                            return (
                                <TouchableOpacity
                                    style={[homeStyles.postWrapper, containerStyle]}
                                    onPress={() => navigation.navigate("ProductDetail", { product: item })}
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
