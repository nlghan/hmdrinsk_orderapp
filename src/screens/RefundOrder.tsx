
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from "../store/store";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/MaterialIcons";
import EmptyListAnimation from '../components/EmptyListAnimation';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { FONTFAMILY } from '../theme/theme';
import { useCartStore } from '../store/useCartStore';

const RefundOrder = () => {
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
    type Payment = {
        paymentMethod: string;
        refunded: boolean;
    };
    type Order = {
        orderId: string;
        address: string;
        note: string;
        deliveryFee: number;
        discountPrice: number;
        totalPrice: number;
        status: string;
        dateCreated: string;
        dateDelivered: string;
        dateOders: string;
        shipment: Shipment;
        listItem: ProductItem[];
        payment: Payment;
    };
    const [refundOrders, setRefundOrders] = useState<Order[]>([]);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { language, userId } = useCategoryStore();

    useEffect(() => {
        fetchRefundOrders();
    }, []);

    const fetchRefundOrders = async () => {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('access_token');

        try {
            const response = await axiosInstance.get(`/orders/view/order-cancel/payment-refund-user/${userId}?language=${language}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: '*/*',
                    },
                }
            );

            const { list = [] } = response.data;

            const refunds = list.map((item: any) => ({
                orderId: item.order.orderId,
                totalPrice: item.order.totalPrice,
                dateOders: item.order.dateOders,
                note: item.order.note,

                payment: {
                    amount: item.payment.amount,
                    dateRefund: item.payment.dateRefund,
                    paymentMethod: item.payment.paymentMethod,
                    refunded: language === 'EN' ? (item.payment.refunded ? 'REFUNDED' : 'NOT REFUNDED') : (item.payment.refunded ? 'ĐÃ HOÀN' : 'CHƯA HOÀN'),
                },
                listItem: item.order.listItem.map((product: ProductItem) => ({
                    cartItemId: product.cartItemId,
                    proName: product.proName,
                    totalPrice: product.totalPrice,
                    quantity: product.quantity,
                    imageUrl: product.imageUrl,
                }))
            }));

            setRefundOrders(refunds);
        } catch (err) {
            setError(language === 'EN' ? 'Unable to load refund orders.' : 'Không thể tải danh sách hoàn tiền.');
            console.error('Error fetching refund orders:', err);
        } finally {
            setLoading(false);
        }
    };
    const { handleRestoreOrder } = useCartStore();
    const handleRestoreOrderCancelled = (orderId: number, userId: number) => {
        try {
            handleRestoreOrder(orderId, userId);

        } catch (err){
            console.error("Lỗi restore:", err);
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const paymentMethodMapVN: Record<string, string> = {
        CASH: 'Tiền mặt',
        CREDIT: 'Chuyển khoản'
    };

    const paymentMethodMapEN: Record<string, string> = {
        CASH: 'CASH',
        CREDIT: 'CREDIT'
    };
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f7eee9de', '#f3ebe0']} style={styles.container}>
                <View style={styles.flatlistContainer}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={22} color="#FF9800" />
                        </TouchableOpacity>
                        <Text style={styles.header}>{t('orderRefunded')}</Text>
                    </View>

                    <View style={styles.body}>
                        {refundOrders.length === 0 ? (
                            <EmptyListAnimation title={t('history.empty_list')} />
                        ) : (
                            <FlatList
                                data={refundOrders}
                                keyExtractor={(item) => item?.orderId?.toString() || `order-${Math.random()}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item?.orderId) })}>

                                        <View style={styles.card}>
                                            <Text style={styles.orderId}>
                                                <Text style={styles.boldText}>{t('history.order_id')}</Text> {item?.orderId}
                                            </Text>
                                            <FlatList
                                                data={item?.listItem}
                                                keyExtractor={(product) => product?.cartItemId?.toString() || `product-${Math.random()}`}
                                                renderItem={({ item: product }) => (
                                                    <View style={styles.productContainer}>
                                                        <Image source={{ uri: product.imageUrl }} style={styles.image} />
                                                        <View style={styles.info}>
                                                            <Text style={styles.title}>
                                                                {t('history.name')} {product.proName}
                                                            </Text>
                                                            <Text style={styles.size}>
                                                                {t('history.quantity')} {product.quantity}
                                                            </Text>
                                                            <Text style={styles.price}>
                                                                {t('history.price')} {formatPrice(product.totalPrice)}đ
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                            />
                                            <Text style={styles.totalPrice}>
                                                <Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(item.totalPrice)}đ
                                            </Text>
                                            <Text style={styles.boldText2}>
                                                <Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}
                                            </Text>
                                            <Text style={styles.boldText2}>
                                                <Text style={styles.boldText1}>{t('history.payment_method')}</Text>{' '}
                                                {item?.payment?.paymentMethod
                                                    ? language === 'EN'
                                                        ? paymentMethodMapEN[item.payment.paymentMethod] || item.payment.paymentMethod
                                                        : paymentMethodMapVN[item.payment.paymentMethod] || item.payment.paymentMethod
                                                    : 'Không có'}
                                            </Text>
                                            <Text style={styles.boldText2}>
                                                <Text style={styles.boldText1}>{t('history.refunded_status')}:</Text> {item.payment.refunded}
                                            </Text >
                                            <View style={styles.buttonContainer}>
                                                <TouchableOpacity onPress={() => handleRestoreOrderCancelled(Number(item.orderId), Number(userId))} style={styles.button}>
                                                    <Text style={styles.buttonText}>{t('history.reorder')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
    },
    flatlistContainer: {
        backgroundColor: '#FFFFFF',
        padding: 5,
        marginHorizontal: 8,
        borderRadius: 10,
        marginTop: 10,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    backIcon: {
        position: "absolute",
        top: 15,
        left: 10,
    },
    header: {
        fontSize: 24,
        fontFamily: FONTFAMILY.lobster_regular,
        textAlign: 'center',
    },
    body: {
        flex: 1,
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
    orderId: {
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
        marginBottom: 8,
    },
    boldText: {
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
    totalPrice: {
        fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 28,
        color: '#e74c3c',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'flex-end', // Đưa nút về lề phải
        alignItems: 'center', // Căn giữa theo chiều dọc
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
    boldText1: {
        fontFamily: FONTFAMILY.dongle_regular,
        fontSize: 24
    },
    boldText2: {
        fontFamily: FONTFAMILY.dongle_light,
        fontSize: 24
    }
});

export default RefundOrder;
