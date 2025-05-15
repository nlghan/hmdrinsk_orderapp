import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationPopup from '../components/NotificationPopup';
import { useCategoryStore } from '../store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { FONTFAMILY } from '../theme/theme';
import styles from '../styles/previewStyles'
import { RootStackParamList } from '../navigation/RootStackParamList';


type PreviewRouteProp = RouteProp<RootStackParamList, 'Preview'>;

const Preview = () => {
    const route = useRoute<PreviewRouteProp>();
    const { groupOrderId, currentAddress } = route.params;

    const { language, userId } = useCategoryStore();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleCancel = () => navigation.goBack();

    const fetchPreviewData = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get('/group-order/preview', {
                params: { groupId: groupOrderId, language: 'VN' },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch preview data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreviewData();
    }, []);

    const handleOrderConfirm = async () => {
        setProcessing(true);
        try {
            const accessToken = await AsyncStorage.getItem('access_token');

            await axiosInstance.post(
                `/group-order/confirm`,
                {}, // body rỗng
                {
                    params: {
                        groupId: groupOrderId,
                        leaderId: userId, // lấy từ store
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // Chuyển sang màn hình chọn phương thức thanh toán
            setModalVisible(false);
            navigation.navigate('ChoosePay', { groupOrderId, }


            )
        } catch (error) {
            console.error('Failed to confirm order:', error);
            alert('Đặt đơn thất bại, vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };


    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );

    if (!data)
        return (
            <View style={styles.center}>
                <Text>Không có dữ liệu</Text>
            </View>
        );

    const { crudCartGroupResponse, deliveryFee, groupMemberDiscount, quantity } = data;
    const items = crudCartGroupResponse[0]?.listCartItemGroup || [];

    const subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const discount3 = subtotal >= 40000 ? Math.floor(subtotal * 0.05) : 0;
    const finalTotal = subtotal + deliveryFee - groupMemberDiscount - discount3;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <NotificationPopup userId={userId ?? 0} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backIcon} onPress={handleCancel}>
                        <Icon name="arrow-back" size={20} color="#FF9800" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tóm tắt đơn đặt nhóm</Text>
                </View>

                {/* Section ĐỊA CHỈ */}
                <View style={[styles.sectionContainer, styles.card]}>
                    <Text style={styles.sectionTitleBig}>Địa chỉ giao hàng</Text>
                    <View style={styles.detailRows}>
                        <Icon name="pin-drop" size={20} color="green" />
                        <Text style={{ fontSize: 15, color: '#333' }}>{currentAddress || 'Không có địa chỉ'}</Text>

                    </View>

                </View>



                {/* Section 1: SẢN PHẨM */}
                <View style={[styles.sectionContainer, styles.card]}>
                    <Text style={styles.sectionTitleBig}>Sản phẩm ({quantity})</Text>
                    {items.map((item: any) => (
                        <View key={item.cartItemGroupId} style={styles.itemBox}>
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.proName}</Text>
                                <Text style={styles.detail}>Kích cỡ: {item.size}</Text>
                                <Text style={styles.detail}>Số lượng: {item.quantity}</Text>
                                <Text style={styles.price}>{item.totalPrice.toLocaleString()}đ</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Section 2: HÓA ĐƠN */}
                <View style={[styles.sectionContainer, styles.card]}>
                    <Text style={styles.sectionTitleBig}>Hóa đơn</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tổng tạm tính</Text>
                        <Text style={styles.sectionValue}>{subtotal.toLocaleString()}đ</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Phí giao hàng</Text>
                        <Text style={styles.sectionValue}>{deliveryFee.toLocaleString()}đ</Text>
                    </View>

                    <View style={styles.discountRow}>
                        <Text style={styles.discountText}>🏷️ Giảm giá khi đặt đơn nhóm</Text>
                        <Text style={styles.discountValue}>-{groupMemberDiscount.toLocaleString()}đ</Text>
                    </View>

                    {/* Đường kẻ phân cách */}
                    <View style={styles.separator} />

                    <View style={styles.discountRow}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalAmount}>{finalTotal.toLocaleString()}đ</Text>
                    </View>

                    <Text style={styles.savedText}>
                        🎉 Bạn tiết kiệm được {(subtotal + deliveryFee - finalTotal).toLocaleString()}đ!
                    </Text>
                </View>
            </ScrollView>

            {/* Action Button */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.nextButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.nextText}>Đặt đơn nhóm</Text>
                </TouchableOpacity>
            </View>

            {/* Modal xác nhận */}
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Xác nhận đặt đơn nhóm</Text>
                        <Text style={styles.modalMessage}>
                            Bạn có chắc chắn muốn đặt đơn nhóm này không?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={processing}
                            >
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleOrderConfirm}
                                disabled={processing}
                            >
                                <Text style={styles.modalButtonText}>
                                    {processing ? 'Đang xử lý...' : 'Xác nhận'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Preview;


