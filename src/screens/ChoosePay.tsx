import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    Linking,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axiosInstance'; // Đảm bảo bạn đã cấu hình sẵn axiosInstance
import { RootStackParamList } from '../navigation/RootStackParamList';
import styles from '../styles/choosePayStyle';
import { useCategoryStore } from '../store/store';
import { useCartStore } from '../store/useCartStore';
import Notification from '../components/Notification';
import { useTranslation } from 'react-i18next';

type PaymentMethod = {
    id: string;
    label: string;
    image: any;
};

const paymentMethods: PaymentMethod[] = [
    { id: 'cash', label: 'Tiền mặt', image: require('../assets/app_images/tien.jpg') },
    { id: 'card', label: 'Thẻ ngân hàng', image: require('../assets/app_images/bidv.png') },
    { id: 'momo', label: 'Momo', image: require('../assets/app_images/momo.png') },
    { id: 'zalopay', label: 'ZaloPay', image: require('../assets/app_images/zalopay.png') },
    { id: 'vnpay', label: 'VNPay', image: require('../assets/app_images/vnpay.png') },
];

const ChoosePay = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const route = useRoute<RouteProp<RootStackParamList, 'ChoosePay'>>();
    const { groupOrderId } = route.params;
    const { userId, language } = useCategoryStore();
    const rawUserId = useCategoryStore.getState().userId;

    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const setHasRejectedGroupCart = useCartStore((state) => state.setHasRejectedGroupCart);
    const ensureActiveCart = useCartStore((state) => state.ensureActiveCart);

    const handleSelect = (methodId: string) => {
        setSelectedMethod(methodId);
    };
    const [notification, setNotification] = useState({ message: '', visible: false });
    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
        // Ẩn thông báo sau 3 giây
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    };

    const handleConfirmPayment = async () => {
        if (!selectedMethod) {
            showNotification(t('aandroid.mess.checck9'));
            return;
        }

        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const leaderId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
            console.log('✅ leaderId:', leaderId);
            if (!accessToken || isNaN(leaderId)) throw new Error('Token hoặc UserId không hợp lệ');

            const headers = {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            };

            const methodMap: Record<string, { typePayment: string; endpoint: string }> = {
                cash: { typePayment: 'CASH', endpoint: 'cash' },
                card: { typePayment: 'PAYOS', endpoint: 'credit/payOs' },
                momo: { typePayment: 'MOMO', endpoint: 'credit/momo' },
                zalopay: { typePayment: 'ZALO', endpoint: 'credit/zaloPay' },
                vnpay: { typePayment: 'VNPAY', endpoint: 'credit/vnPay' },
            };

            const method = methodMap[selectedMethod];
            if (!method) throw new Error('Phương thức thanh toán không hợp lệ');
            console.log('✅ Chọn phương thức:', method.typePayment, method.endpoint);

            // 1. Cập nhật loại thanh toán chính
            const updateRes = await axiosInstance.put(
                '/group-order/update-type-payment-main',
                {
                    typePayment: method.typePayment,
                    groupId: groupOrderId,
                    leaderId,
                },
                { headers }
            );
            console.log('✅ Cập nhật phương thức thanh toán:', updateRes.status);

            // 2. Tạo giao dịch thanh toán
            const payload = {
                groupOrderId,
                leaderUserId: leaderId,
                type: 'ANDROID',
                language,
            };

            console.log(`🚀 Gửi request tạo link thanh toán (${method.endpoint}):`, payload);

            const response = await axiosInstance.post(
                `/payment-group/create/${method.endpoint}`,
                payload,
                { headers }
            );

            console.log('✅ Phản hồi tạo thanh toán:', response.status, response.data);

            if (response.status === 200) {
                const data = response.data;
                if (data.linkPayment) {
                    console.log('🌐 Mở link thanh toán:', data.linkPayment);
                    Linking.openURL(data.linkPayment);
                } else {
                    console.warn('⚠️ Không có link thanh toán, chuyển về trang hoàn tất');
                    navigation.navigate('OrderComplete');
                }
            } else {
                console.error('❌ Tạo thanh toán thất bại:', response.status);
                navigation.navigate('OrderFailed');
            }
        } catch (error: any) {
            console.error('❌ Lỗi trong handleConfirmPayment:', error?.message || error);
            if (error.response) {
                console.error('📩 Chi tiết lỗi từ server:', error.response.data);
            }
            navigation.navigate('OrderFailed');
        }
    };




    return (
        <View style={styles.container}>
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
            <Text style={styles.title}>🔰 Chọn phương thức thanh toán</Text>
            <FlatList
                data={paymentMethods}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedMethod === item.id;
                    return (
                        <TouchableOpacity
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => handleSelect(item.id)}
                        >
                            <View style={styles.radioCircle}>
                                {isSelected && <View style={styles.radioInnerCircle} />}
                            </View>
                            <Image source={item.image} style={styles.logo} />
                            <Text style={styles.label}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        !selectedMethod && { backgroundColor: '#ccc' },
                    ]}
                    onPress={handleConfirmPayment}
                    disabled={!selectedMethod}
                >
                    <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChoosePay;
