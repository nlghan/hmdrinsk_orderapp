
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
import { useOrderStoreRefund } from "../store/countStore";

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
    const { setOrderCountRefund } = useOrderStoreRefund();

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

            if (response.data.length === 0) {
                setOrderCountRefund(0);
            }
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
            setOrderCountRefund(refunds.length);
        } catch (err) {
            setError(language === 'EN' ? 'Unable to load refund orders.' : 'Không thể tải danh sách hoàn tiền.');
            console.error('Error fetching refund orders:', err);
        } finally {
            setLoading(false);
        }
    };
    const handleRestoreOrder = (orderId: string) => {
        Alert.alert('Mua lại', `Bạn có chắc chắn muốn mua lại đơn hàng ${orderId} không?`);
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

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
                                                            <Text style={styles.boldText}>{t('history.name')}</Text> {product.proName}
                                                        </Text>
                                                        <Text style={styles.size}>
                                                            <Text style={styles.boldText}>{t('history.quantity')}</Text> {product.quantity}
                                                        </Text>
                                                        <Text style={styles.price}>
                                                            <Text style={styles.boldText}>{t('history.price')}</Text> {product.totalPrice} VND
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        />
                                        <Text style={styles.totalPrice}>
                                            <Text style={styles.boldText}>{t('history.total_price')}</Text> {item.totalPrice} VND
                                        </Text>
                                        <Text>
                                            <Text style={styles.boldText}>{t('history.order_date')}</Text> {item.dateOders}
                                        </Text>
                                        <Text>
                                            <Text style={styles.boldText}>{t('history.payment_method')}</Text> {item.payment.paymentMethod}
                                        </Text>
                                        <Text>
                                            <Text style={styles.boldText}>{t('history.refunded_status')}</Text> {item.payment.refunded}
                                        </Text>
                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity onPress={() => handleRestoreOrder(item.orderId)} style={styles.button}>
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    boldText: {
        fontWeight: 'bold',
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 10,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    size: {
        fontSize: 14,
        color: 'gray',
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#27ae60',
        marginTop: 4,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginTop: 6,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#ff6347',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default RefundOrder;
