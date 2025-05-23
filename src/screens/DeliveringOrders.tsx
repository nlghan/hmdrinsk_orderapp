import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from "../store/store";
import EmptyListAnimation from '../components/EmptyListAnimation';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { useTranslation } from 'react-i18next';
import styles from '../styles/deliveringStyle';

const DeliveringOrders = () => {
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

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<'individual' | 'group'>('individual');
    const { language, userId, checkShipment } = useCategoryStore();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    useEffect(() => {
        checkShipment();
        fetchOrders('individual');
    }, []);

    const fetchOrders = async (type: 'individual' | 'group') => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');

            let fetchedOrders: Order[] = [];

            if (type === 'individual') {
                const response = await axiosInstance.get(
                    `/orders/view/confirmed/${userId}?language=${language}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                fetchedOrders = response.data.map((item: any) => ({
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
            } else {
                const response = await axiosInstance.get(
                    `/shipment-group/view/listByStatus?page=1&limit=10&status=SHIPPING`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                fetchedOrders = response.data.listShipment.map((item: any) => ({
                    orderId: item.orderId.toString(),
                    address: item.address,
                    deliveryFee: 0,
                    discountPrice: 0,
                    totalPrice: 0,
                    dateCreated: item.dateCreated,
                    dateDelivered: item.dateDeliver,
                    dateOders: item.dateCreated,
                    pointCoinUse: 0,
                    listItem: [], // Không có thông tin sản phẩm
                    shipment: {
                        shipmentId: item.shipmentId.toString(),
                        nameShipper: item.nameShipper,
                        dateDeliver: item.dateDeliver,
                        dateShipped: item.dateShipped,
                        status: item.status,
                    },
                }));
            }

            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Fetch orders error:", err);
            setError(t('history.load_error'));
        } finally {
            setLoading(false);
        }
    };


    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'individual' && styles.activeTab]}
                    onPress={() => {
                        setSelectedTab('individual');
                        fetchOrders('individual');
                    }}
                >
                    <Text style={[styles.tabText, selectedTab === 'individual' && styles.activeTabText]}>
                        {t('history.normal_order')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, selectedTab === 'group' && styles.activeTab]}
                    onPress={() => {
                        setSelectedTab('group');
                        fetchOrders('group');
                    }}
                >
                    <Text style={[styles.tabText, selectedTab === 'group' && styles.activeTabText]}>
                        {t('history.group_order')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            {orders.length === 0 ? (
                <EmptyListAnimation title={t('history.empty_list')} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item?.orderId?.toString() || `order-${Math.random()}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                if (selectedTab === 'individual') {
                                    navigation.navigate('MyOrderDetails', { shipmentId: Number(item?.orderId) });
                                } else {
                                    navigation.navigate('OrderGroupDetail', { groupOrderId: Number(item?.orderId) });

                                }
                            }}

                        >
                            <View style={styles.card}>
                                <Text style={styles.orderId}>
                                    <Text style={styles.boldText}>{t('history.order_id')}</Text> {item?.orderId}
                                </Text>

                                <FlatList
                                    data={item?.listItem}
                                    keyExtractor={(product) => product?.cartItemId?.toString() ?? `product-${Math.random()}`}
                                    renderItem={({ item: product }) => (
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

                                {selectedTab === 'individual' && (
                                    <Text style={styles.totalPrice}>
                                        <Text style={styles.boldText1}>{t('history.total_price')}</Text>{' '}
                                        {formatPrice(Math.max(item.totalPrice + item.deliveryFee - item.discountPrice - item.pointCoinUse, 0))}đ
                                    </Text>
                                )}

                                <Text style={styles.boldText2}>
                                    <Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}
                                </Text>
                                <Text style={styles.boldText2}>
                                    <Text style={styles.boldText1}>{t('history.shipper')}</Text> {item.shipment?.nameShipper}
                                </Text>
                                <Text style={styles.boldText2}>
                                    <Text style={styles.boldText1}>{t('order.deliveryTime')}</Text> {item.shipment?.dateDeliver}
                                </Text>
                                {selectedTab === 'individual' && (
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('ChatWithShipper', { shipmentId: Number(item.shipment?.shipmentId) })}
                                            style={styles.button}
                                        >
                                            <Text style={styles.buttonText}>{t('chat.title')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}


                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default DeliveringOrders;
