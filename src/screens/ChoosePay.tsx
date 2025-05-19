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

    const handleConfirmPayment = async () => {
        if (!selectedMethod) {
            Alert.alert('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const leaderId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
            if (!accessToken || isNaN(leaderId)) throw new Error('Token hoặc UserId không hợp lệ');

            const headers = { Authorization: `Bearer ${accessToken}` };

            const methodMap: Record<string, { typePayment: string; endpoint: string }> = {
                cash: { typePayment: 'CASH', endpoint: 'cash' },
                card: { typePayment: 'PAYOS', endpoint: 'credit/payOs' },
                momo: { typePayment: 'MOMO', endpoint: 'credit/momo' },
                zalopay: { typePayment: 'ZALOPAY', endpoint: 'credit/zaloPay' },
                vnpay: { typePayment: 'VNPAY', endpoint: 'credit/vnPay' },
            };

            const method = methodMap[selectedMethod];
            if (!method) throw new Error('Phương thức thanh toán không hợp lệ');

            // Cập nhật phương thức thanh toán
            await axiosInstance.put(
                '/group-order/update-type-payment-main',
                {
                    typePayment: method.typePayment,
                    groupId: groupOrderId,
                    leaderId,
                },
                { headers }
            );

            // Nếu là CASH thì xử lý như cũ
            if (method.typePayment === 'CASH') {
                await axiosInstance.post(
                    `/payment-group/create/${method.endpoint}`,
                    {
                        groupOrderId,
                        leaderUserId: leaderId,
                        type: method.typePayment,
                        language,
                    },
                    { headers }
                );

                await ensureActiveCart();
                setHasRejectedGroupCart(true);
                navigation.navigate('OrderComplete');
            } else {
                // Các phương thức thanh toán khác
                const paymentUrl = `/payment-group/create/${method.endpoint}`;
                const response = await axiosInstance.post(
                    paymentUrl,
                    {
                        orderId: groupOrderId,
                        userId: leaderId,
                        type: method.typePayment,
                        language,
                    },
                    { headers }
                );

                if (response.status === 200) {
                    const data = response.data;

                    if (data.linkPayment) {
                        Linking.openURL(data.linkPayment);
                    } else {
                        navigation.navigate('OrderComplete');
                    }
                } else {
                    navigation.navigate('OrderFailed');
                    throw new Error('Lỗi khi tạo thanh toán');
                }
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            navigation.navigate('OrderFailed');
        }
    };

    return (
        <View style={styles.container}>
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
