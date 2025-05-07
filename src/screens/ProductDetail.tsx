import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, Alert } from 'react-native';
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
import { COLORS, FONTFAMILY } from '../theme/theme';
import FastImage from 'react-native-fast-image';
import Loading from '../components/DotLoading';
import GroupOrderButton from '../components/GroupOrderButton';



export interface Product {
    description: string;
    proId: number;
    proName: string;
    isFavourited?: boolean;
    productImageResponseList: { linkImage: string }[];
    listProductVariants: { price: number; size: string; stock: number }[];
}

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail = () => {
    const [notification, setNotification] = useState({ message: '', visible: false });
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { language, fetchProducts, deleteFavItem } = useCategoryStore();
    const route = useRoute<ProductDetailRouteProp>();
    const { product } = route.params;
    const price0 = product.listProductVariants[0]?.stock !== 0 ? product.listProductVariants[0]?.price : 0
    const price1 = product.listProductVariants[1]?.stock !== 0 ? product.listProductVariants[1]?.price : 0
    const price2 = product.listProductVariants[2]?.stock !== 0 ? product.listProductVariants[2]?.price : 0
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    const [isLoadingImages, setIsLoadingImages] = useState(true);
    const [loading, setLoading] = useState(false);
    const { hasGroupCart, createGroupOrder } = useCartStore.getState();


    // useEffect(() => {
    //     const preloadImages = () => {
    //       const sources = product.productImageResponseList.map(img => ({
    //         uri: img.linkImage,
    //         cache: FastImage.cacheControl.immutable,
    //       }));
    //       FastImage.preload(sources);
    //       setIsLoadingImages(false);
    //     };
    //     preloadImages();
    //   }, [product.productImageResponseList]);



    const formatPrice = (price: number, qty: number) => {
        return (price * qty).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
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
    const [selectedStock, setSelectedStock] = useState(
        price0 !== 0 ? product.listProductVariants[0].stock : price1 !== 0 ? product.listProductVariants[1].stock : product.listProductVariants[2].stock
    );

    // const formatPrice = (price: number) => price.toLocaleString() + "đ";

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
        setSelectedStock(variant.stock);
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
                // Thêm sản phẩm vào danh sách yêu thích
                await insertFavoriteItem(1, product.proId, selectedSize);
                showNotification("Đã thêm vào yêu thích!");
            } else {
                // Kiểm tra nếu sản phẩm đã có trong danh sách yêu thích
                const existingFavItem = data.favoriteItems?.find(item => item.proId === product.proId);

                if (existingFavItem) {
                    // Lấy favItemId từ dữ liệu yêu thích
                    const favItemId = existingFavItem.favItemId;
                    if (favItemId) {
                        // Gọi API để xóa mục yêu thích
                        await deleteFavItem(favItemId);
                        showNotification("Đã xóa khỏi yêu thích!");
                    }
                } else {
                    showNotification("⚠️ Sản phẩm không có trong danh sách yêu thích.");
                }
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

        const payload = {
            proId: product.proId,
            selectedSize,
            quantity,
            language
        };

        console.log("📦 Payload gửi đi:", payload);

        setLoading(true); // 🔄 Bắt đầu loading
        addToCart(payload.proId, payload.selectedSize, payload.quantity, payload.language)
            .then(() => {
                showNotification("✅ Sản phẩm đã được thêm vào giỏ hàng!");
            })
            .catch((error) => {
                console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
                const message = error.message;
                if (message.includes("❌ Vượt quá số lượng tồn kho")) {
                    showNotification("⚠️ Số lượng sản phẩm vượt quá số lượng tồn kho!");
                } else {
                    showNotification("❌ Lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!");
                }
            })
            .finally(() => {
                setLoading(false); // ✅ Kết thúc loading
            });
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                (prevIndex + 1) % product.productImageResponseList.length
            );
        }, 400000);

        return () => clearInterval(interval); // Dọn dẹp interval khi unmount
    }, [product.productImageResponseList]);

    // useEffect(() => {
    //     const preloadMainImage = async () => {
    //         try {
    //             await Image.prefetch(product.productImageResponseList[0]?.linkImage);
    //         } catch (e) {
    //             console.warn("Không tải được ảnh chính");
    //         }
    //         setIsLoadingImages(false);
    //     };

    //     preloadMainImage();
    // }, []);

    useEffect(() => {
        if (!product?.productImageResponseList?.length) return;

        const sources = product.productImageResponseList.map(img => ({
            uri: img.linkImage,
            cache: FastImage.cacheControl.immutable,
        }));
        FastImage.preload(sources);

        setIsLoadingImages(false);
    }, [product.productImageResponseList]);





    if (isLoadingImages) {
        return (
            <View style={{ flex: 1 }}>
                <Loading title={''} />

            </View>
        );
    }

    const handleGroupOrder = async () => {
        const { userId } = useCategoryStore.getState();
    
        if (!userId) return;
    
        // ✅ Nếu đã có group cart → cảnh báo và return
        if (hasGroupCart) {
            Alert.alert('Thông báo', 'Bạn đã là trưởng nhóm trong một đơn nhóm. Hãy hoàn thành đơn trước khi tạo đơn nhóm mới.');
            return;
        }
    
        // ✅ Nếu chưa có, tiếp tục tạo group order
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
        const title = `Nhóm của ${userId} - ${now.toLocaleTimeString()}`;
    
        const success = await createGroupOrder(
            userId,
            title,
            true,
            formattedDate,
            "PAY_FOR_ALL"
        );
    
        if (success) {
            navigation.navigate('GroupOrder');
        } else {
            Alert.alert('Lỗi', 'Không thể tạo đơn nhóm. Vui lòng thử lại sau.');
        }
    };
    

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0} // tuỳ chỉnh nếu header cao
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    {loading && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Overlay tối mờ
                            justifyContent: 'center',
                            zIndex: 999,  // Đảm bảo overlay nằm trên tất cả
                        }}>
                            <Loading title={''} />
                        </View>
                    )}
                    <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
                    <Header
                        style={{
                            paddingHorizontal: 14,
                            paddingVertical: 10,
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
                                <Icon name="arrow-back" size={24} color={COLORS.primaryGreenHex} />
                            </TouchableOpacity>

                            <GroupOrderButton onPress={handleGroupOrder} />

                        </View>
                        <View style={productDetail.imageContainer}>
                            {/* Ảnh chính */}
                            <FastImage
                                source={{ uri: product.productImageResponseList[currentImageIndex]?.linkImage }}
                                style={productDetail.image}
                                resizeMode={FastImage.resizeMode.contain}
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
                                        <FastImage
                                            source={{
                                                uri: img.linkImage,
                                                priority: FastImage.priority.normal,
                                                cache: FastImage.cacheControl.immutable, // Luôn cache nếu không thay đổi
                                            }}
                                            style={productDetail.thumbnail}
                                        />


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
                                <Text style={productDetail.sizeLabel}>
                                    {t('size')}:
                                    {selectedStock !== null && (
                                        <Text style={{ fontSize: 24, fontFamily: FONTFAMILY.dongle_regular, color: '#333' }}>
                                            ({selectedStock} sản phẩm)
                                        </Text>
                                    )}
                                </Text>
                                <View style={productDetail.sizeOptions}>
                                    {['S', 'M', 'L'].map((size) => {
                                        const variant = product.listProductVariants.find((v) => v.size === size);
                                        const isDisabled = !variant || (variant.stock !== undefined && variant.stock <= 0); // Kiểm tra stock chính xác

                                        return (
                                            <TouchableOpacity
                                                key={size}
                                                style={[
                                                    productDetail.sizeButton,
                                                    selectedSize === size && productDetail.selectedSize,
                                                    isDisabled && { backgroundColor: '#ddd', borderColor: '#ccc' }
                                                ]}
                                                onPress={() => {
                                                    if (!isDisabled) handleSizeSelection(size);
                                                }}
                                                disabled={isDisabled} // Đảm bảo nút bị disable khi stock = 0
                                            >
                                                <Text style={{ color: isDisabled ? '#999' : '#000', fontFamily: FONTFAMILY.dongle_regular, fontSize: 24 }}>{size}</Text>
                                            </TouchableOpacity>
                                        );
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
                            disabled={loading}
                        >
                            <Text style={productDetail.cartText}>
                                {formatPrice(selectedPrice, quantity)}đ
                            </Text>

                        </TouchableOpacity>

                    </View>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );

};

export default ProductDetail;
