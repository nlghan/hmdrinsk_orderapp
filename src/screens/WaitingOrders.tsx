import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from "../store/store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EmptyListAnimation from '../components/EmptyListAnimation';
import Icon from "react-native-vector-icons/MaterialIcons";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { FONTFAMILY } from '../theme/theme';

const WaitingOrder = () => {
    type ProductItem = {
        cartItemId: string;
        proId: string;
        proName: string;
        size: string;
        totalPrice: number;
        quantity: number;
        imageUrl: string;
    };

    type Shipment = {
        shipmentId: string;
        customerName: string;
        phoneNumber: string;
        email: string;
        status: string;
        dateDeliver: string;
        dateShipped: string;
        nameShipper: string;
    };

    type Order = {
        orderId: string;
        userId: string;
        address: string;
        deliveryFee: number;
        discountPrice: number;
        totalPrice: number;
        status: string;
        dateCreated: string;
        dateDelivered: string;
        dateOders: string;
        shipment: Shipment;
        listItem: ProductItem[];
    };

    const [waitingOrders, setWaitingOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdowns, setCountdowns] = useState<{ [orderId: string]: number }>({});
    // State to hold countdown time
    const { language, userId, checkTimeOrder } = useCategoryStore();
    const { t } = useTranslation();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        fetchWaitingOrders();
    }, []);

    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];
        const expiredOrders: Set<string> = new Set();
    
        waitingOrders.forEach(order => {
            const [datePart, timePart] = order.dateOders.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart.split(':').map(Number);
    
            const localOrderTime = new Date(year, month - 1, day, hour, minute, second).getTime();
            const endTime = localOrderTime + 30 * 60 * 1000;
    
            const updateCountdown = () => {
                const now = Date.now();
                const timeLeft = Math.max(endTime - now, 0);
    
                setCountdowns(prev => ({ ...prev, [order.orderId]: timeLeft }));
    
                if (timeLeft <= 0 && !expiredOrders.has(order.orderId)) {
                    expiredOrders.add(order.orderId); // Đánh dấu đơn này đã xử lý
                    checkTimeOrder(); // Gọi check 1 lần
                    setTimeout(() => {
                        fetchWaitingOrders(); // Delay fetch để tránh gọi liên tục khi state chưa cập nhật
                    }, 500);
                }
            };
    
            updateCountdown(); // lần đầu
            const interval = setInterval(updateCountdown, 1000);
            intervals.push(interval);
        });
    
        return () => {
            intervals.forEach(clearInterval);
        };
    }, [waitingOrders.length]); // 👈 chỉ chạy lại khi số lượng đơn thay đổi
    

    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const fetchWaitingOrders = async () => {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('access_token');

        try {
            const response = await axiosInstance.get(`/orders/view/fetchOrdersAwaiting/${userId}?language=${language}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { listOrderWaiting, listAllOrderConfirmAndNotPayment, listAllOrderConfirmAndPaymentPending } = response.data;
            const combinedOrders = [
                ...(listOrderWaiting?.list || []),
                ...(listAllOrderConfirmAndNotPayment?.list || []),
                ...(listAllOrderConfirmAndPaymentPending?.list || [])
            ];

            setWaitingOrders(combinedOrders);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreOrder = (orderId: string) => {
        Alert.alert('Mua lại', `Bạn có chắc chắn muốn mua lại đơn hàng ${orderId} không?`);
    };

    // Function to format the countdown time
    const formatCountdown = (time: number | undefined) => {
        if (time === undefined || time <= 0) return '00:00:00';
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={22} color="#FF9800" />
                </TouchableOpacity>
                <Text style={styles.header}>{t('orderPayment')}</Text>
            </View>

            {waitingOrders.length === 0 ? (
                <EmptyListAnimation title={t('history.empty_list')} />
            ) : (
                <FlatList
                    data={waitingOrders}
                    keyExtractor={(item) => item?.orderId?.toString() || `order-${Math.random()}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('Payment', { orderId: Number(item.orderId) })}>
                            <View style={styles.card}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderId}><Text style={styles.boldText}>{t('history.order_id')}</Text> {item?.orderId}</Text>
                                    <Text style={styles.countdownText}>
                                        {formatCountdown(countdowns[item.orderId])}
                                    </Text>

                                </View>


                                <FlatList
                                    data={item?.listItem}
                                    keyExtractor={(product) => product?.cartItemId?.toString() || `product-${Math.random()}`}
                                    renderItem={({ item: product }: { item: ProductItem }) => (
                                        <View style={styles.productContainer}>
                                            <Image source={{ uri: product.imageUrl }} style={styles.image} />
                                            <View style={styles.info}>
                                                <Text style={styles.title}>{t('history.name')} {product.proName}</Text>
                                                <Text style={styles.size}>{t('history.quantity')} {product.quantity}</Text>
                                                <Text style={styles.price}>{t('history.price')} {formatPrice(product.totalPrice)}đ</Text>
                                            </View>
                                        </View>
                                    )}
                                />
                                <Text style={styles.totalPrice}><Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(Math.max(item.totalPrice + item.deliveryFee - item.discountPrice, 0))}đ</Text>
                                <Text style={styles.boldText2} ><Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}</Text>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity onPress={() => handleRestoreOrder(item.orderId)} style={styles.button}>
                                        <Text style={styles.buttonText}>{t('history.payment')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
    },
    backIcon: {
        position: "absolute",
        top: 15,
        left: 10,
    },
    orderHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        textAlign: 'center'

    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#ff6347',
        padding: 8,
        borderRadius: 5,
        width: 100
    },
    buttonText: {
        color: 'white',
        fontSize: 22,
        fontFamily: FONTFAMILY.dongle_bold,
        textAlign: 'center'
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    header: {
        fontSize: 24,
        fontFamily: FONTFAMILY.lobster_regular,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: FONTFAMILY.dongle_regular,
        color: '#333',
        marginBottom: 4,
    },
    size: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_regular,
        color: 'gray',
    },
    price: {
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_regular,
        color: '#27ae60',
        marginTop: 4,
    },
    card: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    boldText: {
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
    },
    orderId: {
        marginBottom: 8,
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    totalPrice: {
        fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 28,
        color: '#e74c3c',
    },
    boldText1: {
        fontFamily: FONTFAMILY.dongle_regular,
        fontSize: 24,
    },
    boldText2: {
        fontFamily: FONTFAMILY.dongle_light,
        fontSize: 24,
    },
    countdownText: {
        marginBottom: 8,
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_bold,
        color: 'red'
    },
});

export default WaitingOrder;
