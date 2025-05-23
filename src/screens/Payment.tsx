import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, BackHandler, Linking, Image } from 'react-native';
import { useCartStore } from '../store/useCartStore';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from "../utils/axiosInstance";
import { useCategoryStore } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTFAMILY } from '../theme/theme';
import Loading from '../components/DotLoading';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;
const Payment = () => {

    // Lấy thông tin đơn hàng từ store
    const route = useRoute<PaymentScreenRouteProp>();
    const { t } = useTranslation();

    // Nhận orderId từ navigation
    const orderId = route.params?.orderId;
    console.log('Received orderId:', orderId);

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // Mặc định là tiền mặt
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { language } = useCategoryStore();
    const { idOrderPause, setIdOrderPause, currentCartId, setIdCartPause, ensureActiveCart, fetchCartItem } = useCartStore();
    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                if (!token) {
                    setError('Không tìm thấy token đăng nhập, vui lòng đăng nhập lại.');
                    return;
                }
    
                const response = await axiosInstance.get(`/orders/detail/${orderId}?language=${language}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                const orderData = response.data.order;
                const linkPayment = response.data.payment?.link; // 👈 lấy link từ payment
    
                console.log('Order Detail Response:', response.data);
    
                // Gộp link vào order để dễ dùng
                setOrder({
                    ...orderData,
                    linkPayment: linkPayment || null,
                });
            } catch (err) {
                console.error('Lỗi khi lấy thông tin đơn hàng:', err);
                setError('Có lỗi xảy ra khi lấy thông tin đơn hàng.');
            }finally{
                setLoading(false);
            }
        };
    
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);
    

    if (loading) {
        return (
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Overlay tối mờ
                justifyContent: 'center',
                zIndex: 999,  // Đảm bảo overlay nằm trên tất cả
            }}>
                <Loading title={''} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>{error}</Text>
            </View>
        );
    }

    if (!order || !order.listItem || order.listItem.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>{t('dashboardContent.noOrder')}</Text>
            </View>
        );
    }



    const handleOrder = async () => {
        console.log('handleOrder called');
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
    
            // 👉 Nếu đã có link thanh toán, chỉ cần mở
            if (order.linkPayment) {
                Linking.openURL(order.linkPayment);
                return;
            }
            
    
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
    
            // Xác nhận đơn hàng
            const confirmResponse = await axiosInstance.post(
                `/orders/confirm`,
                { userId: order.userId, orderId: order.orderId },
                { headers }
            );
    
            if (confirmResponse.status !== 200) {
                throw new Error('Lỗi khi xác nhận đơn hàng');
            }
    
            // Tạo thanh toán
            const paymentUrl = `/payment/create/${paymentMethod}`;
            const paymentResponse = await axiosInstance.post(
                paymentUrl,
                { orderId: order.orderId, userId: order.userId, type: 'ANDROID' },
                { headers }
            );
    
            if (paymentResponse.status === 200) {
                const data = paymentResponse.data;
    
                if (data.linkPayment) {
                    Linking.openURL(data.linkPayment);
                } else {
                    navigation.navigate('OrderComplete');
                }
    
            } else {
                navigation.navigate('OrderFailed');
                throw new Error('Lỗi khi tạo thanh toán');
            }
    
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderPause = async () => {
        console.log('handleOrderPause called'); // Kiểm tra xem có vào hàm không
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

            console.log('Bắt đầu xử lý đơn hàng tạm dừng với ID:', order.orderId);

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            // Gửi yêu cầu xác nhận đơn hàng tạm dừng
            console.log('Gửi yêu cầu xác nhận đơn hàng tạm dừng...');
            const confirmResponse = await axiosInstance.post(
                '/orders/confirm_order_pause',
                { userId: order.userId, orderId: order.orderId },
                { headers }
            );

            console.log('Phản hồi xác nhận đơn hàng tạm dừng:', confirmResponse.data);
            if (confirmResponse.status !== 200) {
                throw new Error('Lỗi khi xác nhận đơn hàng tạm dừng');
            }

            console.log(`Tạo thanh toán với phương thức: ${paymentMethod}`);
            const paymentUrl = `/payment/create/${paymentMethod}`;
            const paymentResponse = await axiosInstance.post(
                paymentUrl,
                { orderId: order.orderId, userId: order.userId, type: 'ANDROID' },
                { headers }
            );

            console.log('Phản hồi tạo thanh toán:', paymentResponse.data);
            if (paymentResponse.status === 200) {
                const data = paymentResponse.data;

                // Trường hợp ZaloPay hoặc các phương thức cần redirect
                if (data.linkPayment) {
                    Linking.openURL(data.linkPayment); // Mở ZaloPay redirect
                }
                else {
                    setIdCartPause(null);
                    setIdOrderPause(null);
                    navigation.navigate('OrderComplete');
                }
            } else {
                navigation.navigate('OrderFailed');
                throw new Error('Lỗi khi tạo thanh toán');
            }
        } catch (error) {
            console.error('Lỗi đặt hàng:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại sau.');
        }
    };


    // Gọi API pause_order khi rời khỏi trang hoặc back
    const handlePauseOrder = async () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn tạm dừng thanh toán không?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const token = await AsyncStorage.getItem('access_token');
                            if (!token || !order?.orderId || !order?.userId) return;

                            await axiosInstance.post(
                                '/orders/pause_order',
                                { orderId: order.orderId, userId: order.userId },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                    },
                                }
                            );

                            setIdOrderPause(order.orderId);
                            await Promise.all([ensureActiveCart(), fetchCartItem()]);

                            console.log('✅ Pause order thành công');
                            navigation.goBack();
                        } catch (error) {
                            console.error('❌ Lỗi khi gọi pause_order:', error);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (!token || !order?.orderId || !order?.userId) return;

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            // Nếu là đơn đang pause thì cần xác nhận trước khi hủy
            if (order.orderId === idOrderPause) {
                console.log('🕒 Đơn đang ở trạng thái PAUSE, gửi yêu cầu xác nhận...');
                const confirmResponse = await axiosInstance.post(
                    '/orders/confirm_order_pause',
                    { userId: order.userId, orderId: order.orderId },
                    { headers }
                );

                if (confirmResponse.status !== 200) {
                    console.warn('⚠️ Xác nhận đơn pause thất bại. Hủy đơn bị dừng lại.');
                    setLoading(false);
                    return;
                }
            }

            // Tiến hành hủy đơn
            await axiosInstance.put(
                '/orders/cancel-order',
                { orderId: order.orderId, userId: order.userId },
                { headers }
            );

            // Nếu là đơn pause thì reset idOrderPause
            if (order.orderId === idOrderPause) {
                setIdOrderPause(null);
                setIdCartPause(null);
                console.log('🔁 Đã hủy đơn pause, đặt lại idOrderPause = null');
            }

            setOrder(null);
            await ensureActiveCart();
            await fetchCartItem();

            console.log('✅ Hủy order thành công');
            navigation.navigate('Main');
        } catch (error) {
            console.error('❌ Lỗi khi hủy đơn:', error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => {
                        handlePauseOrder();

                    }}>
                        <Icon name="arrow-back" size={24} color={COLORS.primaryGreenHex} />
                    </TouchableOpacity>

                    <Text style={styles.sectionTitleP}>Thông tin đặt hàng</Text>
                </View>

                {/* Thông tin giao hàng */}
                <Text style={styles.sectionTitle}>{t('android.payment.title')}</Text>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>{t('phone')}: {order.phone || 'N/A'}</Text>
                    <Text style={styles.infoText}>{t('address')}: {order.address || 'N/A'}</Text>
                    <Text style={styles.infoText}>{t('history.order_date')} {order.dateDelivered || 'N/A'}</Text>
                </View>

                {/* Danh sách sản phẩm */}
                <Text style={styles.sectionTitle}>{t('android.payment.product')}</Text>
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
                                <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}đ</Text>
                            </View>
                        </View>
                    ))}
                </View>
                {/* Phương thức thanh toán */}
                <Text style={styles.sectionTitle}>{t('paymentMethod')}</Text>
                <View style={styles.paymentContainer}>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('cash')}>
                        <Icon name="attach-money" size={24} color={paymentMethod === 'cash' ? "#FF9800" : "#555"} />
                        <Text style={styles.paymentText}>{t('order.orderDetail.method.method1')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'credit/payOs' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('credit/payOs')}>
                        <Image
                            source={
                                paymentMethod === 'credit/payOs'
                                    ? require('../assets/app_images/bidv.png')
                                    : require('../assets/app_images/bidv.png')
                            }
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                        />

                        <Text style={styles.paymentText}>{t('order.orderDetail.method.method2')}</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'credit/momo' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('credit/momo')}>
                        <Image
                            source={
                                paymentMethod === 'credit/momo'
                                    ? require('../assets/app_images/momo.png')
                                    : require('../assets/app_images/momo.png')
                            }
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                        />

                        <Text style={styles.paymentText}>{t('order.orderDetail.method.method3')}</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'credit/zaloPay' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('credit/zaloPay')}>
                        <Image
                            source={
                                paymentMethod === 'credit/zaloPay'
                                    ? require('../assets/app_images/zalopay.png')
                                    : require('../assets/app_images/zalopay.png')
                            }
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                        />

                        <Text style={styles.paymentText}>{t('order.orderDetail.method.method4')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'credit/vnPay' && styles.selectedPayment]}
                        onPress={() => setPaymentMethod('credit/vnPay')}>
                        <Image
                            source={
                                paymentMethod === 'credit/vnPay'
                                    ? require('../assets/app_images/vnpay.png')
                                    : require('../assets/app_images/vnpay.png')
                            }
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                        />

                        <Text style={styles.paymentText}>{t('order.orderDetail.method.method5')}</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Tổng cộng & Thanh toán */}
            <View style={styles.footer}>
                {/* Tổng cộng */}
                <View style={styles.summaryContainer}>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>{t('products.subTotal')}</Text>
                        <Text style={styles.summaryAmount}>{formatPrice(order.totalPrice)}đ</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>{t('order.shipFee')}</Text>
                        <Text style={styles.summaryAmount}>{formatPrice(order.deliveryFee)}đ</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>{t('order.discount')}</Text>
                        <Text style={styles.summaryAmount}>{formatPrice(order.discountPrice)}đ</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.summaryText}>{t('cart.coin')}</Text>
                        <Text style={styles.summaryAmount}>{formatPrice(order.pointCoinUse)}đ</Text>
                    </View>
                </View>

                {/* Số tiền thanh toán */}
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>{t('order.orderDetail.totalBill')}</Text>
                    <Text style={styles.totalAmount}>
                        {formatPrice(Math.max(order.totalPrice - order.pointCoinUse + order.deliveryFee - order.discountPrice, 0))}đ
                    </Text>

                </View>

                {/* Nút đặt hàng */}
                <View style={styles.buyContainer}>
                    <TouchableOpacity
                        style={[styles.orderButton1, loading && { opacity: 0.5 }]}
                        onPress={() => {
                            Alert.alert(
                                'Xác nhận hủy đơn',
                                'Bạn có chắc chắn muốn hủy thanh toán đơn hàng này không?',
                                [
                                    {
                                        text: 'Không',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Hủy đơn',
                                        style: 'destructive',
                                        onPress: () => handleCancel(),
                                    },
                                ],
                                { cancelable: true }
                            );
                        }}
                        disabled={loading}
                    >
                        <Text style={styles.orderText}>
                            {loading ? t('loading') : t('order.orderDetail.cancel')}
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={[styles.orderButton, loading && { opacity: 0.5 }]}
                        onPress={() => {
                            if (idOrderPause === order?.orderId) {
                                handleOrderPause();
                            } else {
                                handleOrder();
                            }
                        }}
                        disabled={loading}
                    >
                        <Text style={styles.orderText}>{loading ? t('loading') : t('pay')}</Text>
                    </TouchableOpacity>



                </View>

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
        marginBottom: 280, // Chừa khoảng trống cho footer
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: FONTFAMILY.lobster_regular,
        marginBottom: 10,
        color: '#333',
        marginTop: 10
    },
    sectionTitleP: {
        fontSize: 24,
        fontFamily: FONTFAMILY.lobster_regular,
        color: '#333',
        textAlign: 'center',
        flex: 1, // quan trọng để chiếm không gian còn lại

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
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_light,
        lineHeight: 18,
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
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
        marginLeft: 15,
    },
    priceContainer: {
        width: 80,
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
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
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_bold,
        lineHeight: 20,
        color: '#555',
    },
    summaryAmount: {
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_bold,
        lineHeight: 20,
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
        fontSize: 32,
        fontFamily: FONTFAMILY.dongle_bold,
        lineHeight: 24,
    },
    totalAmount: {
        fontSize: 32,
        fontFamily: FONTFAMILY.dongle_bold,
        lineHeight: 24,
        color: '#E53935',
    },

    /* Nút đặt hàng */
    orderButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 10,
        zIndex: 1000,
        width: 150,
        height: 50,
    },
    orderButton1: {
        backgroundColor: '#d8d8d8',
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 10,
        zIndex: 1000,
        width: 150,
        height: 50,

    },
    orderText: {
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
        color: '#fff',
    },
    emptyText: {
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_bold,
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
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_regular,
        marginLeft: 15,
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20
    },
    buyContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 80
    }
});
