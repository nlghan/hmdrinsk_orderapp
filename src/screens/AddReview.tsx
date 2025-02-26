import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCategoryStore } from '../store/store';
import reviewStyles from '../styles/reviewStyles';
import Header from '../components/Header';

type AddReviewRouteProp = RouteProp<RootStackParamList, 'AddReview'>;

const AddReview = () => {
    const navigation = useNavigation();
    const route = useRoute<AddReviewRouteProp>();
    const { productId } = route.params;

    const { addReviewToProduct } = useCategoryStore();

    const [fullName, setFullName] = useState('');
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState('');

    const handleSubmit = async () => {
        if ( rating === 0 || !content) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
            return;
        }
    
        const userId = useCategoryStore.getState().userId; // Lấy userId từ store
        if (!userId) {
            Alert.alert("Lỗi", "Bạn cần đăng nhập để đánh giá!");
            return;
        }
    
        const newReview = {
            userId, // ✅ Bổ sung userId
            proId: productId, // ✅ Bổ sung proId
            fullName,
            ratingStart: rating,
            content,
        };
    
        await addReviewToProduct(productId, newReview);
        Alert.alert("Thành công", "Đánh giá của bạn đã được gửi!");
        navigation.goBack();
    };
    
    

    const renderStars = () => (
        <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity key={num} onPress={() => setRating(num)}>
                    <Icon 
                        name={num <= rating ? "star" : "star-border"} 
                        size={30} 
                        color="#FFD700" 
                        style={{ marginHorizontal: 3 }} 
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

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
                <Text style={reviewStyles.headerTitle}>Thêm đánh giá</Text>
            </View>

            <Text style={reviewStyles.label}>Đánh giá:</Text>
            {renderStars()}

            <Text style={reviewStyles.label}>Nội dung đánh giá:</Text>
            <TextInput 
                style={[reviewStyles.input, { height: 100 }]} 
                placeholder="Nhập nội dung đánh giá" 
                value={content} 
                onChangeText={setContent} 
                multiline 
            />

            <TouchableOpacity style={reviewStyles.submitButton} onPress={handleSubmit}>
                <Text style={reviewStyles.submitButtonText}>Gửi đánh giá</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddReview;
