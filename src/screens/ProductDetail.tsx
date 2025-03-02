import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/RootStackParamList';
import productDetail from '../styles/productDetail';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '../store/store';
import { StackNavigationProp } from '@react-navigation/stack';

export interface Product {
    description: string;
    proId: number;
    proName: string;
    isFavourited: boolean;
    productImageResponseList: { linkImage: string }[];
    listProductVariants: { price: number; size: string }[];
}

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<ProductDetailRouteProp>();
    const { product } = route.params;
    const { t } = useTranslation();

    // ✅ Lấy các hàm từ store
    const { fetchProductReviews, data, insertFavoriteItem, userId } = useCategoryStore();

    const [expanded, setExpanded] = useState(false);

    // ⭐ State cho size và giá
    const [selectedSize, setSelectedSize] = useState(product.listProductVariants[0]?.size);
    const [selectedPrice, setSelectedPrice] = useState(product.listProductVariants[0]?.price);

    // 🆕 Fetch đánh giá sản phẩm khi vào trang
    useEffect(() => {
        fetchProductReviews(product.proId, 1, 5);
    }, []);

    // ✅ Lấy rating từ store thay vì gọi API
    const productFromStore = data.products?.find((p) => p.proId === product.proId);
    const avgRating = productFromStore?.avgRating || 0;
    const totalReviews = productFromStore?.totalReviews || 0;
    const [isFavorite, setIsFavorite] = useState(product.isFavourited);


    console.log("🔍 Product from store:", productFromStore);
    console.log("⭐ avgRating:", productFromStore?.avgRating);


    const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const MAX_LENGTH = 300;
    const shortDescription = product.description.length > MAX_LENGTH
        ? product.description.substring(0, MAX_LENGTH) + '...'
        : product.description;

    // 🆕 Xử lý chọn size
    const handleSizeSelection = (size: string) => {
        setSelectedSize(size);
        const variant = product.listProductVariants.find(v => v.size === size);
        if (variant) {
            setSelectedPrice(variant.price);
        }
    };

    // ✅ Xử lý khi nhấn vào trái tim ❤️
    const handleFavoritePress = async () => {
        if (!userId) {
            console.error("❌ User not logged in");
            return;
        }

        // Lật trạng thái yêu thích ngay lập tức để cập nhật UI
        setIsFavorite((prev) => !prev);

        try {
            if (!isFavorite) {
                await insertFavoriteItem(1, product.proId, selectedSize);
                console.log("✅ Added to favorites");
            } else {
                // await removeFavoriteItem(product.proId, selectedSize);
                // console.log("🗑 Removed from favorites");
            }
        } catch (error) {
            console.error("❌ Error updating favorite state:", error);
            // Nếu API thất bại, hoàn tác trạng thái
            setIsFavorite((prev) => !prev);
        }
    };



    return (
        <View style={productDetail.container}>
            <Header
                style={{
                    paddingHorizontal: 14,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginBottom: 10,
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                }}
            />

            <ScrollView contentContainerStyle={productDetail.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={productDetail.topButtons}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={productDetail.backButton}>
                        <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleFavoritePress} style={productDetail.favoriteButton}>
                        <Icon
                            name="favorite"
                            size={24}
                            color={isFavorite ? "red" : "gray"}
                        />
                    </TouchableOpacity>


                </View>

                <Image source={{ uri: product.productImageResponseList[0]?.linkImage }} style={productDetail.image} />
                <Text style={productDetail.title}>{product.proName}</Text>

                {/* Mô tả sản phẩm */}
                <View style={productDetail.descriptionContainer}>
                    <Text style={productDetail.sizeLabel}>{t('products.description')}</Text>
                    <Text style={productDetail.description}>
                        {expanded ? product.description : shortDescription}
                        {product.description.length > MAX_LENGTH && (
                            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                                <Text style={productDetail.readMore}>
                                    {expanded ? t('common.hide') : t('viewMore')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Text>
                </View>

                {/* Chọn size */}
                <View style={productDetail.sizeContainer}>
                    <Text style={productDetail.sizeLabel}>{t('size')}</Text>
                    <View style={productDetail.sizeOptions}>
                        {[...product.listProductVariants].reverse().map((variant) => (
                            <TouchableOpacity
                                key={variant.size}
                                style={[
                                    productDetail.sizeButton,
                                    selectedSize === variant.size && productDetail.selectedSize
                                ]}
                                onPress={() => handleSizeSelection(variant.size)}
                            >
                                <Text>{variant.size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Phần đánh giá */}
                <View style={productDetail.reviewHeader}>
                    <Text style={productDetail.reviewTitle}>{t('products.rating')}</Text>
                    <TouchableOpacity
                        style={productDetail.viewAllReviewsButton}
                        onPress={() => navigation.navigate('AllReviews', { productId: product.proId })}
                    >
                        <View style={productDetail.ratingContainer}>
                            <Text style={productDetail.ratingText}>{avgRating} ★</Text>
                            <Text style={productDetail.reviewCount}>({totalReviews} {t('reviews')})</Text>
                        </View>
                        <Icon name="chevron-right" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Hiển thị giá theo size */}
            <View style={productDetail.priceContainer}>
                <Text style={productDetail.price}>{formatPrice(selectedPrice)} VND</Text>
                <TouchableOpacity style={productDetail.cartButton}>
                    <Text style={productDetail.cartText}>{t('products.addToCart')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProductDetail;
