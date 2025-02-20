import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface ProductCardProps {
    image: string;
    name: string;
    price: number;
    size: string
}

const ProductCard: React.FC<ProductCardProps> = ({ image, name, price, size }) => {
    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    return (
        <TouchableOpacity style={styles.card}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.name}>{name} </Text>

            {/* View bọc price để căn bottom nhưng không quá xa */}
            <View style={styles.priceContainer}>
                <Text style={styles.price}>
                {formatPrice(price)} VND ({size})
                </Text>
            </View>

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
    },
    image: {
        width: '100%',
        height: 130,
        borderRadius: 8,
        resizeMode:'cover'
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
    },
    priceContainer: {
        marginTop: 'auto', // Chỉ đẩy giá xuống khi có không gian dư
        marginBottom: 5, // Cách bottom 5px
    },
    price: {
        fontSize: 16,
        color: 'green',
        textAlign: 'center',
    },
});

export default ProductCard;
