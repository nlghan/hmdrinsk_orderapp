import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/RootStackParamList';
import productDetail from '../styles/productDetail';
import Header from '../components/Header';

export interface Product {
    description: string;
    proId: number;
    proName: string;
    productImageResponseList: { linkImage: string }[];
    listProductVariants: { price: number; size: string }[];
}

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail = () => {
    const navigation = useNavigation();
    const route = useRoute<ProductDetailRouteProp>();
    const { product } = route.params;

    const [expanded, setExpanded] = useState(false);

    // Giới hạn số ký tự hiển thị trước khi bấm "Read More"
    const MAX_LENGTH = 300;
    const shortDescription =
        product.description.length > MAX_LENGTH
            ? product.description.substring(0, MAX_LENGTH) + '...'
            : product.description;

    return (
        <View style={productDetail.container}>
            <Header style={{
                paddingHorizontal: 14,
                paddingTop: 10,
            }} />
         
            <ScrollView contentContainerStyle={productDetail.scrollContainer} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={productDetail.backButton}>
                    <Icon name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
                <Image source={{ uri: product.productImageResponseList[0]?.linkImage }} style={productDetail.image} />
                <Text style={productDetail.title}>{product.proName}</Text>

                {/* Mô tả sản phẩm */}
                <View style={productDetail.descriptionContainer}>
                    <Text style={productDetail.sizeLabel}>Mô tả</Text>
                    <Text style={productDetail.description}>
                        {expanded ? product.description : shortDescription}
                        {product.description.length > MAX_LENGTH && (
                            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                                <Text style={productDetail.readMore}>
                                    {expanded ? ' Show Less' : ' Read More'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Text>
                </View>

                <View style={productDetail.sizeContainer}>
                    <Text style={productDetail.sizeLabel}>Sizes</Text>
                    <View style={productDetail.sizeOptions}>
                        <TouchableOpacity style={productDetail.sizeButton}>
                            <Text>S</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[productDetail.sizeButton, productDetail.selectedSize]}>
                            <Text>M</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={productDetail.sizeButton}>
                            <Text>L</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Giá & Nút Add to Cart sẽ luôn hiển thị cố định ở dưới */}
            <View style={productDetail.priceContainer}>
                <Text style={productDetail.price}>₹ {product.listProductVariants[0]?.price}</Text>
                <TouchableOpacity style={productDetail.cartButton}>
                    <Text style={productDetail.cartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ProductDetail;
