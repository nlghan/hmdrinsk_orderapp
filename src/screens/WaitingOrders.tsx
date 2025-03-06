
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
import { useOrderStorePending } from "../store/countStore";


const PendingOrder = () => {
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
    const { language, userId } = useCategoryStore();
    const { t } = useTranslation();
    const { setOrderCountPending } = useOrderStorePending();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        fetchWaitingOrders();
    }, []);

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
            setOrderCountPending(combinedOrders.length);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng.');
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
                        <TouchableOpacity
                                        onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item?.orderId) })}>

                        <View style={styles.card}>
                            <Text style={styles.orderId}><Text style={styles.boldText}>{t('history.order_id')}</Text> {item?.orderId}</Text>
                            <FlatList
                                data={item?.listItem}
                                keyExtractor={(product) => product?.cartItemId?.toString() || `product-${Math.random()}`}
                                renderItem={({ item: product }: { item: ProductItem }) => (
                                    <View style={styles.productContainer}>
                                        <Image source={{ uri: product.imageUrl }} style={styles.image} />
                                        <View style={styles.info}>
                                            <Text style={styles.title}><Text style={styles.boldText}>{t('history.name')}</Text> {product.proName}</Text>
                                            <Text style={styles.size}><Text style={styles.boldText}>{t('history.quantity')}</Text> {product.quantity}</Text>
                                            <Text style={styles.price}><Text style={styles.boldText}>{t('history.price')}</Text> {product.totalPrice} VND</Text>
                                        </View>
                                    </View>
                                )}
                            />
                            <Text style={styles.totalPrice}><Text style={styles.boldText}>{t('history.total_price')}</Text> {Math.max(item.totalPrice + item.deliveryFee - item.discountPrice, 0)} VND</Text>
                            <Text><Text style={styles.boldText}>{t('history.order_date')}</Text> {item.dateOders}</Text>
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderId: {
        marginBottom: 8,
        fontSize: 16,
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
    totalPrice: {
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default PendingOrder;
=======
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
import { useOrderStorePending } from "../store/countStore";


const PendingOrder = () => {
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
    const { language, userId } = useCategoryStore();
    const { t } = useTranslation();
    const { setOrderCountPending } = useOrderStorePending();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        fetchWaitingOrders();
    }, []);

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
            setOrderCountPending(combinedOrders.length);
        } catch (err) {
            setError('Không thể tải danh sách đơn hàng.');
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
                        <TouchableOpacity
                                        onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item?.orderId) })}>

                        <View style={styles.card}>
                            <Text style={styles.orderId}><Text style={styles.boldText}>{t('history.order_id')}</Text> {item?.orderId}</Text>
                            <FlatList
                                data={item?.listItem}
                                keyExtractor={(product) => product?.cartItemId?.toString() || `product-${Math.random()}`}
                                renderItem={({ item: product }: { item: ProductItem }) => (
                                    <View style={styles.productContainer}>
                                        <Image source={{ uri: product.imageUrl }} style={styles.image} />
                                        <View style={styles.info}>
                                            <Text style={styles.title}><Text style={styles.boldText}>{t('history.name')}</Text> {product.proName}</Text>
                                            <Text style={styles.size}><Text style={styles.boldText}>{t('history.quantity')}</Text> {product.quantity}</Text>
                                            <Text style={styles.price}><Text style={styles.boldText}>{t('history.price')}</Text> {product.totalPrice} VND</Text>
                                        </View>
                                    </View>
                                )}
                            />
                            <Text style={styles.totalPrice}><Text style={styles.boldText}>{t('history.total_price')}</Text> {Math.max(item.totalPrice + item.deliveryFee - item.discountPrice, 0)} VND</Text>
                            <Text><Text style={styles.boldText}>{t('history.order_date')}</Text> {item.dateOders}</Text>
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    orderId: {
        marginBottom: 8,
        fontSize: 16,
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
    totalPrice: {
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default PendingOrder;

