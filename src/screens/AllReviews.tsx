import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCategoryStore } from '../store/store';
import reviewStyles from '../styles/reviewStyles';
import Header from '../components/Header';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

type AllReviewsRouteProp = RouteProp<RootStackParamList, 'AllReviews'>;

const AllReviews = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<AllReviewsRouteProp>();
    const { productId } = route.params;
    const { t } = useTranslation();

    const { data, fetchProductReviews } = useCategoryStore();
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const product = data.products?.find(p => p.proId === productId);
    const reviews = product?.reviews || [];
    const totalReviews = product?.totalReviews || 0;

    const pageRef = useRef<number>(page); // 🔹 Tránh gọi API trùng lặp

    useEffect(() => {
        const loadReviews = async () => {
            if (loading || pageRef.current === page || reviews.length >= totalReviews) return;

            setLoading(true);
            pageRef.current = page; // ✅ Cập nhật page đã tải
            await fetchProductReviews(productId, page, 5);
            setLoading(false);
        };

        loadReviews();
    }, [page]);

    const loadMoreReviews = () => {
        if (!loading && reviews.length < totalReviews) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const navigateToAddReview = () => {
        navigation.navigate('AddReview', { productId }); // 🔥 Chuyển đến trang thêm review
    };

    const renderStars = (rating: number) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                {[...Array(5)].map((_, i) => (
                    <Icon
                        key={i}
                        name={i + 1 <= rating ? "star" : i + 0.5 <= rating ? "star-half" : "star-border"}
                        size={20}
                        color="#FFD700"
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={reviewStyles.container}>
            <Header
                style={{
                    paddingHorizontal: 14,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginBottom: 10,
                    backgroundColor: 'white', // Giữ nền rõ hơn với shadow
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5, // Dành cho Android
                }}
            />
            <View style={reviewStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={reviewStyles.backButton}>
                    <Icon name="arrow-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={reviewStyles.headerTitle}>{t('common.listComment')}</Text>

                {/* 🔥 Nút Thêm Đánh Giá */}
                <TouchableOpacity onPress={navigateToAddReview} style={reviewStyles.addReviewButton}>
                    <Icon name="add" size={16} color="#FF8247" />

                </TouchableOpacity>
            </View>

            <FlatList
                data={reviews}
                keyExtractor={(item) => item.reviewId.toString()}
                renderItem={({ item }) => (
                    <View style={reviewStyles.reviewItem}>
                        <Text style={reviewStyles.userName}>{item.fullName}</Text>
                        {renderStars(item.ratingStart)}
                        <Text style={reviewStyles.reviewText}>{item.content}</Text>
                        <Text style={reviewStyles.reviewDate}>{item.dateCreated}</Text>
                    </View>
                )}
                ListFooterComponent={() =>
                    loading ? <ActivityIndicator size="small" color="#000" style={{ marginVertical: 10 }} /> : null
                }
                onEndReached={loadMoreReviews}
                onEndReachedThreshold={0.2}
                showsVerticalScrollIndicator
            />
        </View>
    );
};

export default AllReviews;
