

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from "../store/store";
import EmptyListAnimation from '../components/EmptyListAnimation';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { useTranslation } from 'react-i18next';
import { FONTFAMILY } from '../theme/theme';

const DeliveringOrders = () => {
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
        userId: string;
        address: string;
        deliveryFee: number;
        discountPrice: number;
        totalPrice: number;
        status: string;
        dateCreated: string;
        dateDelivered: string;
        dateOders: string;
        pointCoinUse: number;
        shipment: Shipment;
        listItem: ProductItem[];
    };

    const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [currentDeliveringPage, setCurrentDeliveringPage] = useState(1);
    const { language, userId } = useCategoryStore();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    useEffect(() => {
        fetchConfirmedOrders();
    }, []);

    const fetchConfirmedOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');

            const response = await axiosInstance.get(`/orders/view/confirmed/${userId}?language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.length > 0) {
                const orders = response.data.map((item: any) => ({
                    orderId: item.order.orderId,
                    address: item.order.address,
                    deliveryFee: item.order.deliveryFee,
                    dateCreated: item.order.dateCreated,
                    dateDelivered: item.order.dateDelivered,
                    totalPrice: item.order.totalPrice,
                    discountPrice: item.order.discountPrice,
                    dateOders: item.order.dateOders,
                    phone: item.order.phone,
                    status: item.order.status,
                    pointCoinUse: item.order.pointCoinUse,
                    listItem: item.order.listItem.map((product: any) => ({
                        cartItemId: product.cartItemId,
                        proId: product.proId,
                        proName: product.proName,
                        size: product.size,
                        totalPrice: product.totalPrice,
                        quantity: product.quantity,
                        imageUrl: product.imageUrl,
                    })),
                    shipment: item.shipment ? {
                        shipmentId: item.shipment.shipmentId,
                        nameShipper: item.shipment.nameShipper,
                        dateDeliver: item.shipment.dateDeliver,
                        dateShipped: item.shipment.dateShipped,
                        status: item.shipment.status,
                    } : null,
                }));

                setConfirmedOrders(orders);
            } else {
                setConfirmedOrders([]);
            }
        } catch (err) {
            console.error("Lỗi fetchConfirmedOrders:", err);
            setError('Không thể tải danh sách đơn hàng đã xác nhận.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };


    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={22} color="#FF9800" />
                </TouchableOpacity>
                <Text style={styles.header}>{t('orderDelivering')}</Text>
            </View>

            {confirmedOrders.length === 0 ? (
                <EmptyListAnimation title={t('history.empty_list')} />
            ) : (
                <FlatList
                    data={confirmedOrders}
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
                                    keyExtractor={(product) => product?.cartItemId?.toString() ?? `product-${Math.random()}`}
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

                                <Text style={styles.totalPrice}><Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(Math.max(item.totalPrice + item.deliveryFee - item.discountPrice - item.pointCoinUse, 0))}đ</Text>
                                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}</Text>
                                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.shipper')}</Text> {item.shipment?.nameShipper}</Text>
                                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('order.deliveryTime')}</Text> {item.shipment?.dateDeliver}</Text>
                                <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => navigation.navigate('ChatWithShipper', { shipmentId: Number(item.shipment?.shipmentId) })} style={styles.button}>
                                    <Text style={styles.buttonText}>{t('chat.title')}</Text>
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
        fontSize: 24
    },
    boldText2: {
        fontFamily: FONTFAMILY.dongle_light,
        fontSize: 24
    },
    buttonContainer: {
        flexDirection: 'row',
        fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 28,
        color: '#e74c3c',
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
        textAlign: 'center',
        justifyContent: 'flex-end', // Đưa nút về lề phải
        alignItems: 'center', // Căn giữa theo chiều dọc,
        gap:5
    },

});

export default DeliveringOrders;
