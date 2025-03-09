import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from "../utils/axiosInstance";
import { useCategoryStore } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

const Payment = () => {

    // Lấy thông tin đơn hàng từ store
    const order = useCartStore((state) => state.order);
    console.log('Order:', order);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // Mặc định là tiền mặt

    // Kiểm tra nếu không có đơn hàng
    if (!order || !order.listItem || order.listItem.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
            </View>
        );
    }

    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handleOrder = async () => {
        console.log('handleOrder called'); // Kiểm tra xem có vào hàm không
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                Alert.alert('Lỗi', 'Không tìm thấy token đăng nhập, vui lòng đăng nhập lại.');
                return;
            }
    
            if (!order || !order.orderId) {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng.');
                return;
            }
    
            console.log('Bắt đầu xử lý đơn hàng với ID:', order.orderId);
    
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
    
            console.log('Gửi yêu cầu xác nhận đơn hàng...');
            const confirmResponse = await axiosInstance.post(
                `/orders/confirm`,
                { userId: order.userId, orderId: order.orderId },
                { headers }
            );
    
            console.log('Phản hồi xác nhận đơn hàng:', confirmResponse.data);
            if (confirmResponse.status !== 200) {
                throw new Error('Lỗi khi xác nhận đơn hàng');
            }
    
            console.log(`Tạo thanh toán với phương thức: ${paymentMethod}`);
            const paymentUrl = `/payment/create/${paymentMethod}`;
            const paymentResponse = await axiosInstance.post(
                paymentUrl,
                { orderId: order.orderId, userId: order.userId },
                { headers }
            );
    
            console.log('Phản hồi tạo thanh toán:', paymentResponse.data);
            if (paymentResponse.status === 200) {
                
                navigation.navigate('OrderComplete');
            } else {
                throw new Error('Lỗi khi tạo thanh toán');
            }
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };
    
    


    return (
        <View style={styles.container}>
            <ScrollView style={styles.contentContainer}>
                {/* Thông tin giao hàng */}
                <Text style={styles.sectionTitle}>Giao hàng tận nơi</Text>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>Số điện thoại: {order.phone || 'N/A'}</Text>
                    <Text style={styles.infoText}>Địa chỉ: {order.address || 'N/A'}</Text>
                    <Text style={styles.infoText}>Thời gian giao hàng: {order.dateDelivered || 'N/A'}</Text>
                </View>

                {/* Danh sách sản phẩm */}
                <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
                <View style={styles.itemsContainer}>
                    {order.listItem?.map((item: {
                        cartItemId: number;
                        proId: number;
                        proName: string;
                        cartId: number;
                        size: string;
                        totalPrice: number;
                        quantity: number;
                        imageUrl: string;
                    }, index: number) => (
                        <View key={index} style={styles.itemRow}>
                            <TouchableOpacity style={styles.editIcon}>
                                <Icon name="edit" size={20} color="#FF9800" />
                            </TouchableOpacity>
                            <Text style={styles.itemText}>{item.quantity}x {item.proName} ({item.size})</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.itemPrice}>{item.totalPrice?.toLocaleString()}đ</Text>
                            </View>
                        </View>
                    ))}
                </View>
                {/* Phương thức thanh toán */}
                <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                <View style={styles.paymentContainer}>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('cash')}>
                        <Icon name="attach-money" size={24} color={paymentMethod === 'cash' ? "#FF9800" : "#555"} />
                        <Text style={styles.paymentText}>Tiền mặt</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'bank' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('bank')}>
                        <Icon name="credit-card" size={24} color={paymentMethod === 'bank' ? "#FF9800" : "#555"} />
                        <Text style={styles.paymentText}>Thẻ ngân hàng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'e-wallet' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('e-wallet')}>
                        <Icon name="account-balance-wallet" size={24} color={paymentMethod === 'e-wallet' ? "#FF9800" : "#555"} />
                        <Text style={styles.paymentText}>Ví điện tử</Text>
                    </TouchableOpacity> */}
                </View>
            </ScrollView>

            {/* Tổng cộng & Thanh toán */}
            <View style={styles.footer}>
                {/* Tổng cộng */}
                <View style={styles.summaryContainer}>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>Thành tiền</Text>
                        <Text style={styles.summaryAmount}>{order.totalPrice?.toLocaleString()}đ</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>Phí giao hàng</Text>
                        <Text style={styles.summaryAmount}>{order.deliveryFee}đ</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>Số xu đã dùng</Text>
                        <Text style={styles.summaryAmount}>{order.pointCoinUse}đ</Text>
                    </View>
                </View>

                {/* Số tiền thanh toán */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Số tiền thanh toán</Text>
                    <Text style={styles.totalAmount}>{(order.totalPrice - order.pointCoinUse - order.deliveryFee).toLocaleString()}đ</Text>
                </View>

                {/* Nút đặt hàng */}
                <TouchableOpacity
                    style={[styles.orderButton, loading && { opacity: 0.5 }]}
                    onPress={handleOrder}
                    disabled={loading}
                >
                    <Text style={styles.orderText}>{loading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default Payment;

// **StyleSheet**
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: 250, // Chừa khoảng trống cho footer
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        marginTop: 10
    },
    infoBox: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    itemsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    editIcon: {
        width: 30,
        alignItems: 'center',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 15,
    },
    priceContainer: {
        width: 80,
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E53935',
        textAlign: 'right',
    },

    /* Tổng cộng */
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        elevation: 10,
    },
    summaryContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    summaryText: {
        fontSize: 16,
        color: '#555',
    },
    summaryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    promoText: {
        color: '#1E88E5',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 5,
    },

    /* Số tiền thanh toán */
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E53935',
    },

    /* Nút đặt hàng */
    orderButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 10,
        zIndex: 1000,
    },
    orderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
        color: 'gray',
    },
    paymentContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
    },
    selectedPayment: {
        backgroundColor: '#FFF3E0',
    },
    paymentText: {
        fontSize: 16,
        marginLeft: 10,
    },
});
