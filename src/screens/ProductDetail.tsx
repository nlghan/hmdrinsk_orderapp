import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/RootStackParamList';
import productDetail from '../styles/productDetail';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '../store/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCartStore } from '../store/useCartStore';
import Notification from '../components/Notification';


export interface Product {
    description: string;
    proId: number;
    proName: string;
    isFavourited: boolean;
    productImageResponseList: { linkImage: string }[];
    listProductVariants: { price: number; size: string; stock: number }[];
}

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail = () => {
    const [notification, setNotification] = useState({ message: '', visible: false });
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { language } = useCategoryStore();
    const route = useRoute<ProductDetailRouteProp>();
    const { product } = route.params;
    const price0 = product.listProductVariants[0]?.stock !== 0 ? product.listProductVariants[0]?.price : 0
    const price1 = product.listProductVariants[1]?.stock !== 0 ? product.listProductVariants[1]?.price : 0
    const price2 = product.listProductVariants[2]?.stock !== 0 ? product.listProductVariants[2]?.price : 0
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    const formatPrice = (price: number, qty: number) => (price * qty).toLocaleString() + " VND";


    const { fetchProductReviews, data, insertFavoriteItem, userId } = useCategoryStore();

    const [expanded, setExpanded] = useState(false);
    const [selectedSize, setSelectedSize] = useState(
        price0 !== 0 ? product.listProductVariants[0].size : price1 !== 0 ? product.listProductVariants[1].size : product.listProductVariants[2].size
    );
    const [selectedPrice, setSelectedPrice] = useState(
        price0 !== 0 ? product.listProductVariants[0].price : price1 !== 0 ? product.listProductVariants[1].price : product.listProductVariants[2].price
    );

    const [isFavorite, setIsFavorite] = useState(product.isFavourited);

    const { addToCart } = useCartStore();
    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
    };

    useEffect(() => {
        fetchProductReviews(product.proId, 1, 5);
    }, []);

    const productFromStore = data.products?.find((p) => p.proId === product.proId);
    const avgRating = productFromStore?.avgRating || 0;
    const totalReviews = productFromStore?.totalReviews || 0;

    // const formatPrice = (price: number) => price.toLocaleString() + " VND";

    const handleSizeSelection = (size: string) => {
        const variant = product.listProductVariants.find(v => v.size === size);
        if (!variant) {
            showNotification("⚠️ Kích thước sản phẩm không hợp lệ!");
            return;
        }
        if (variant.stock === 0) {
            showNotification("⚠️ Sản phẩm đã hết hàng!");
            return;
        }
        setSelectedSize(size);
        setSelectedPrice(variant.price);
    };

    const handleFavoritePress = async () => {
        if (!userId) {
            showNotification("⚠️ Vui lòng đăng nhập để thêm vào yêu thích!");
            return;
        }

        setIsFavorite((prev) => !prev);

        try {
            if (!isFavorite) {
                await insertFavoriteItem(1, product.proId, selectedSize);
                showNotification("Đã thêm vào yêu thích!");
            } else {
                showNotification("Đã xóa khỏi yêu thích!");
            }
        } catch (error) {
            console.error("❌ Lỗi cập nhật yêu thích:", error);
            setIsFavorite((prev) => !prev);
            showNotification("⚠️ Có lỗi xảy ra, thử lại sau!");
        }
    };


    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleAddToCart = () => {

        if (!selectedSize || !selectedPrice) {
            showNotification("⚠️ Vui lòng chọn kích thước sản phẩm trước khi thêm vào giỏ hàng!");
            return;
        }
        if (quantity <= 0) {
            showNotification("⚠️ Số lượng sản phẩm phải lớn hơn 0!");
            return;
        }

        addToCart(product.proId, selectedSize, quantity, language).then (() => {
            showNotification("✅ Sản phẩm đã được thêm vào giỏ hàng!");
        }
        ).catch((error) => {
            const message = error.message
            if (message.includes("❌ Vượt quá số lượng tồn kho")) {
                showNotification("⚠️ Số lượng sản phẩm vượt quá số lượng tồn kho!");
            } else {
                showNotification("❌ Lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!");
            }
        });
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % product.productImageResponseList.length
            );
        }, 2000);

        return () => clearInterval(interval); // Dọn dẹp interval khi unmount
    }, [product.productImageResponseList]);

    return (
        <View style={{ flex: 1 }}>
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
            <Header
                style={{
                    paddingHorizontal: 14,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginBottom: 3,
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                }}
            />

            <ScrollView
                contentContainerStyle={productDetail.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                
                <View style={productDetail.topButtons}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={productDetail.backButton}>
                        <Icon name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>



                </View>
                <View style={productDetail.imageContainer}>
                    {/* Ảnh chính */}
                    <Image
                        source={{ uri: product.productImageResponseList[currentImageIndex]?.linkImage }}
                        style={productDetail.image}
                    />

                    {/* Danh sách ảnh nhỏ */}
                    <View style={productDetail.thumbnailContainer}>
                        {product.productImageResponseList.slice(0, 4).map((img, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setCurrentImageIndex(index)}
                                style={[
                                    productDetail.thumbnailWrapper,
                                    currentImageIndex === index && productDetail.selectedThumbnail
                                ]}
                            >
                                <Image source={{ uri: img.linkImage }} style={productDetail.thumbnail} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={productDetail.infoContainer}>
                    <Text style={productDetail.title}>{product.proName}</Text>

                    <View style={productDetail.ratingContainer}>
                        <TouchableOpacity
                            style={productDetail.ratingContainer}
                            onPress={() => navigation.navigate('AllReviews', { productId: product.proId })}
                        >
                            <View style={productDetail.ratingContainer}>
                                <Icon name="star" size={18} color="gold" />
                                <Text style={productDetail.ratingText}>{avgRating}</Text>
                                <Text style={productDetail.reviewCount}>({totalReviews} {t('reviews')})</Text>

                            </View>

                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleFavoritePress} style={productDetail.favoriteButton}>
                            <Icon name="favorite" size={24} color={isFavorite ? "red" : "gray"} />
                        </TouchableOpacity>

                    </View>



                    <Text style={productDetail.description}>
                        {expanded ? product.description : `${product.description.substring(0, 100)}...`}
                        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                            <Text style={productDetail.readMore}>
                                {expanded ? t('common.hide') : t('viewMore')}
                            </Text>
                        </TouchableOpacity>
                    </Text>

                    <View style={productDetail.sizeContainer}>
                        <Text style={productDetail.sizeLabel}>{t('size')}</Text>
                        <View style={productDetail.sizeOptions}>
                            {[...product.listProductVariants].reverse().map((variant) => {
                                return (<TouchableOpacity
                                    key={variant.size}
                                    style={[
                                        productDetail.sizeButton,
                                        selectedSize === variant.size && productDetail.selectedSize
                                    ]}
                                    onPress={() => {handleSizeSelection(variant.size)
                                    }}
                                >
                                    <Text>{variant.size}</Text>
                                </TouchableOpacity>)
                            })}
                        </View>
                    </View>
                </View>

            </ScrollView>
            <View style={productDetail.fixedPriceContainer}>
                <View style={productDetail.quantityContainer}>
                    <TouchableOpacity onPress={decreaseQuantity} style={productDetail.quantityButton}>
                        <Text style={productDetail.quantityText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                        style={[productDetail.quantityValue, { color: "black" }]}
                        keyboardType="numeric"
                        value={quantity === null ? "" : quantity.toString()}
                        onChangeText={(text) => {
                            if (text === "") {
                                setQuantity(0);
                            } else {
                                const num = parseInt(text, 10);
                                if (!isNaN(num) && num >= 1) {
                                    setQuantity(num);
                                }
                            }
                        }}
                        onBlur={() => {
                            if (quantity === 0) {
                                setQuantity(1);
                            }
                        }}
                    />


                    <TouchableOpacity onPress={increaseQuantity} style={productDetail.quantityButton}>
                        <Text style={productDetail.quantityText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={productDetail.cartButton}
                    onPress={handleAddToCart}
                >
                    <Text style={productDetail.cartText}>{formatPrice(selectedPrice, quantity)}</Text>
                </TouchableOpacity>


            </View>

        </View>
    );

};

export default ProductDetail;
