import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCategoryStore } from '../store/store';
import reviewStyles from '../styles/reviewStyles';
import Header from '../components/Header';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAlertStore } from '../store/alertStore';

type AllReviewsRouteProp = RouteProp<RootStackParamList, 'AllReviews'>;
export type ProductReview = {
    reviewId: number;
    userId: number;
    fullName: string;
    content: string;
    ratingStart: number;
    dateCreated: string;
};

const AllReviews = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<AllReviewsRouteProp>();
    const { productId } = route.params;
    const { t } = useTranslation();

    const { data, fetchProductReviews, userId, deleteReview } = useCategoryStore();
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [activeReviewId, setActiveReviewId] = useState<number | null>(null);

    const product = data.products?.find(p => p.proId === productId);
    const reviews = product?.reviews || [];
    const totalReviews = product?.totalReviews || 0;

    const pageRef = useRef<number>(page);

    useEffect(() => {
        const loadReviews = async () => {
            if (loading || pageRef.current === page || reviews.length >= totalReviews) return;

            setLoading(true);
            pageRef.current = page;
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
        navigation.navigate('AddReview', { productId });
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

    const [reviewToEdit, setReviewToEdit] = useState<ProductReview | null>(null);

    const handleEditReview = (reviewId: number) => {
        const reviewToEdit = reviews.find(review => review.reviewId === reviewId);

        if (reviewToEdit) {
            setReviewToEdit(reviewToEdit);
            setActiveReviewId(null);
            navigation.navigate('AddReview', {
                productId,
                reviewToEdit,
            });
        }
    };
    const handleDeleteReview = (reviewId: number) => {
        useAlertStore.getState().showAlert(
            t('common.confirmDelete'),    // tiêu đề
            t('common.areYouSure'),       // nội dung
            () => {
                deleteReview(reviewId);   // xử lý khi xác nhận
            },
            () => { }                      // xử lý khi hủy (có thể bỏ qua nếu không cần)
        );
    };

    return (
        <TouchableWithoutFeedback onPress={() => { setActiveReviewId(null); Keyboard.dismiss(); }}>
            <View style={reviewStyles.container}>
                <Header
                    style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        marginBottom: 10,
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                    }}
                />
                <View style={reviewStyles.nestedContainer}>
                    <View style={reviewStyles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={reviewStyles.backButton}>
                            <Icon name="arrow-back" size={20} color="#000" />
                        </TouchableOpacity>
                        <Text style={reviewStyles.headerTitle}>{t('common.listComment')}</Text>

                        <TouchableOpacity onPress={navigateToAddReview} style={reviewStyles.addReviewButton}>
                            <Icon name="add" size={16} color="#FF8247" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={reviews}
                        keyExtractor={(item) => item.reviewId.toString()}
                        renderItem={({ item }) => (
                            <View style={reviewStyles.reviewItem}>
                                <View style={reviewStyles.reviewItem1}>
                                    <Text style={reviewStyles.userName}>{item.fullName}</Text>
                                    <View style={reviewStyles.reviewItem2}>
                                        {item.userId === userId && (
                                            <TouchableOpacity onPress={() => setActiveReviewId(activeReviewId === item.reviewId ? null : item.reviewId)}>
                                                <Text style={reviewStyles.editText}>
                                                    <Icon name="more-horiz" size={20} color="#000" />
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {renderStars(item.ratingStart)}
                                <Text style={reviewStyles.reviewText}>{item.content}</Text>
                                <Text style={reviewStyles.reviewDate}>{item.dateCreated}</Text>

                                {item.userId === userId && activeReviewId === item.reviewId && (
                                    <View style={reviewStyles.actions}>
                                        <TouchableOpacity onPress={() => handleEditReview(item.reviewId)}>
                                            <Text style={reviewStyles.actionText}>Sửa</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteReview(item.reviewId)}>
                                            <Text style={reviewStyles.actionText}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                        ListFooterComponent={() => (
                            <View style={{ height: 5 }} />
                        )}
                        onEndReached={loadMoreReviews}
                        onEndReachedThreshold={0.2}
                        showsVerticalScrollIndicator
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default AllReviews;
