import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
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
import { useOrderStoreWaiting } from "../store/countStore";

const WaitingOrder = () => {
    // Định nghĩa kiểu dữ liệu
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
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { language, userId } = useCategoryStore();
    const { setOrderCountWaiting } = useOrderStoreWaiting();

    // useEffect(() => {
    //     fetchWaitingList();
    // }, []);

    const fetchWaitingList = async () => {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('access_token');
        try {
            const response = await axiosInstance.get(`/orders/list-waiting/${userId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            console.log("check", response.data);
    
            const listOrders = response.data.listOrderWaiting.list || [];
            
            if (listOrders.length === 0) {
                setOrderCountWaiting(0);
            }
    
            const promises = listOrders.map(async (order: Order) => {
                try {
                    const responsePayment = await axiosInstance.get(`/orders/info-payment?orderId=${order.orderId}`, {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                    return { ...order, payment: responsePayment.data };
                } catch (error) {
                    console.error(`Lỗi khi lấy payment cho orderId ${order.orderId}:`, error);
                    return { ...order, payment: null };
                }
            });
    
            const listWithPaymentInfo = await Promise.all(promises);
            setWaitingOrders(listWithPaymentInfo);
            setOrderCountWaiting(listWithPaymentInfo.length);
        } catch (error) {
            console.error('Lỗi fetchWaitingList:', error);
            setOrderCountWaiting(0);
            setError('Không thể tải danh sách đơn hàng chờ.');
        } finally {
            setLoading(false);
        }
    };
    


    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f7eee9de', '#f3ebe0']} style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={22} color="#FF9800" />
                    </TouchableOpacity>
                    <Text style={styles.header}>{t('orderPending')}</Text>
                </View>

                <View style={styles.body}>
                <EmptyListAnimation title={t('history.empty_list')} />
                    {/* {waitingOrders.length === 0 ? (
                        <EmptyListAnimation title={t('history.empty_list')} />
                    ) : (
                        <FlatList
                            data={waitingOrders}
                            keyExtractor={(item) => item?.orderId?.toString() || `order-${Math.random()}`}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <Text style={styles.orderId}>{t('history.order_id')} {item?.orderId}</Text>
                                    <FlatList
                                        data={item?.listItem}
                                        keyExtractor={(product) => product?.cartItemId?.toString() ?? `product-${Math.random()}`}
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
                                        <Text style={styles.boldText}>{t('history.total_price')}</Text> {Math.max(item.totalPrice + item.deliveryFee - item.discountPrice, 0)} VND
                                    </Text>
                                    <Text>
                                        <Text style={styles.boldText}>{t('history.order_date')}</Text> {item.dateOders}
                                    </Text>

                                </View>
                            )}
                        />
                    )} */}
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

export default WaitingOrder;
