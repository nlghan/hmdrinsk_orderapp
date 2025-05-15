import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import styles from '../styles/choosePayStyle'

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

    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handleSelect = (methodId: string) => {
        setSelectedMethod(methodId);
    };

    const handleConfirmPayment = async () => {
        if (!selectedMethod) {
            Alert.alert('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            // TODO: Gọi API thanh toán ở đây
            // Ví dụ:
            // await axiosInstance.post('/api/payment', { groupOrderId, method: selectedMethod });

            Alert.alert('Thanh toán thành công', `Phương thức: ${selectedMethod}`);
            navigation.goBack();
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            Alert.alert('Thanh toán thất bại', 'Vui lòng thử lại sau.');
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
            <View style={styles.actions} >
                <TouchableOpacity
                    style={[styles.confirmButton, !selectedMethod && { backgroundColor: '#ccc' }]}
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

