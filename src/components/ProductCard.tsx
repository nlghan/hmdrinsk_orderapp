import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FONTFAMILY } from '../theme/theme';

interface ProductCardProps {
    proId:number;
    image: string;
    name: string;
    price: number;
    size: string;
    onLongPress: () => void;
    onPress: () => void;
    isSelected: boolean;
    isFavourited: boolean;
    insertFavoriteItem: (favId: number, proId: number, size: string) => Promise<void>; // ✅ Thêm dòng này
    onAddToCart: (proId: number, size: string) => Promise<void>;
  }
  

const ProductCard: React.FC<ProductCardProps> = ({ proId,image, name, price, size, onLongPress, onPress, isSelected, isFavourited, insertFavoriteItem, onAddToCart }) => {
    const [isFavorite, setIsFavorite] = useState(isFavourited); 

    // ✅ Cập nhật `isFavorite` mỗi khi `isFavourited` thay đổi từ props
    useEffect(() => {
        setIsFavorite(isFavourited);
    }, [isFavourited]);

    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (isSelected) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isSelected]);

    useEffect(() => {
        setIsFavorite(isFavourited);
    }, [isFavourited]);

    const handleFavoritePress = async () => {
        try {
            const favId = 1; // 🔹 Giả sử có `favId` (cần lấy giá trị thực tế)
            const proId = 123; // 🔹 Lấy từ dữ liệu thực tế của sản phẩm

            setIsFavorite((prev) => !prev); // Lật trạng thái UI trước để có phản hồi nhanh

            await insertFavoriteItem(favId, proId, size);

            console.log("✅ Cập nhật yêu thích thành công!");
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật yêu thích:", error);
            setIsFavorite((prev) => !prev); // Hoàn tác nếu có lỗi
        }
    };

    return (
        <TouchableOpacity style={styles.card} onLongPress={onLongPress} delayLongPress={150} activeOpacity={0.8} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.name}>{name}</Text>
            <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatPrice(price)}đ ({size})</Text>
            </View>

            {isSelected && <View style={styles.overlay} />}

            {/* Hiển thị nút yêu thích và giỏ hàng */}
            <Animated.View 
                style={[
                    styles.actionButtons, 
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* ❤️ Nút yêu thích */}
                <TouchableOpacity 
                    style={styles.heartButton}
                   
                >
                    <Icon 
                        name="favorite" 
                        size={24} 
                        color={isFavorite ? "red" : "gray"} 
                    />
                </TouchableOpacity>

                {/* 🛒 Nút giỏ hàng */}
                <TouchableOpacity style={styles.cartButton} onPress={() => onAddToCart(proId, size)}  >
                    <Icon name="shopping-cart" size={24} color="green" />
                </TouchableOpacity>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 220,
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 130,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    name: {
        fontSize: 26,
        fontFamily:FONTFAMILY.dongle_bold,
        marginTop: 8,
        textAlign: 'center',
    },
    priceContainer: {
        marginTop: 'auto',
        marginBottom: 10,
    },
    price: {
        fontSize: 24,
        color: 'green',
        fontFamily:FONTFAMILY.dongle_bold,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(58, 58, 58, 0.32)',
        borderRadius: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        position: 'absolute',
        alignSelf: 'center',
        top: '45%',
        zIndex: 1,
    },
    heartButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        elevation: 3,
        marginHorizontal: 10,
    },
    cartButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        elevation: 3,
        marginHorizontal: 10,
    },
});

export default ProductCard;