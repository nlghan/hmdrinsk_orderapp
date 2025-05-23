import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert, Image
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from "../store/store";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/MaterialIcons";
import EmptyListAnimation from '../components/EmptyListAnimation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import styles from '../styles/PendingStyle';
import LinearGradient from 'react-native-linear-gradient';

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
        address: string;
        phoneNumber: string;
        totalPrice: number;
        status: string;
        dateCreated: string;
        dateDelivered: string;
        dateOders: string;
        shipment: Shipment;
        cartItems: ProductItem[];
        payment: {
            deliveryFee: number;
            discountPrice: number;
            infoPaymentResponse: {
                amount: number;
                status: string;
            };
        };
    };

    const [individualOrders, setIndividualOrders] = useState<Order[]>([]);
    const [groupOrders, setGroupOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<'individual' | 'group'>('individual');

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { language, userId } = useCategoryStore();

    useEffect(() => {
        if (selectedTab === 'individual') {
            fetchIndividualOrders();
        } else {
            fetchGroupOrders();
        }
    }, [selectedTab]);

    const fetchIndividualOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(`/shipment/view/list-waiting/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const listOrders = response.data.listShipment || [];
            const listWithPaymentInfo = await Promise.all(listOrders.map(async (order: Order) => {
                try {
                    const paymentRes = await axiosInstance.get(`/orders/info-payment-language?orderId=${order.orderId}&language=${language}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    return { ...order, payment: paymentRes.data, cartItems: paymentRes.data.cartItems || [] };
                } catch (e) {
                    console.error(`Payment error for ${order.orderId}`, e);
                    return { ...order, payment: null };
                }
            }));
            setIndividualOrders(listWithPaymentInfo);
        } catch (e) {
            console.error('fetchIndividualOrders error:', e);
            setError(t('history.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');
            const res = await axiosInstance.get(`/shipment-group/view/list-waiting/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const listShipments = res.data?.listShipment || [];
            setGroupOrders(listShipments);
        } catch (e) {
            console.error("fetchGroupOrders error:", e);
            setError(t('history.fetch_error'));
        } finally {
            setLoading(false);
        }
    };


    const getFirstImageUrl = (imageUrl: string): string => {
        if (!imageUrl) return 'https://via.placeholder.com/60';
        const match = imageUrl.split(',')[0].match(/1:\s*(https?:\/\/[^\s]+)/);
        return match ? match[1] : 'https://via.placeholder.com/60';
    };

    const formatPrice = (price: number) =>
        price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const renderIndividualOrder = ({ item }: { item: Order }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item.orderId) })}>
            <View style={styles.card}>
                <Text style={styles.orderId}>{t('history.order_id')} {item.orderId}</Text>
                <FlatList
                    data={item.cartItems}
                    keyExtractor={(p) => p.cartItemId}
                    renderItem={({ item: product }) => (
                        <View style={styles.productContainer}>
                            <Image source={{ uri: getFirstImageUrl(product.imageUrl) }} style={styles.image} />
                            <View style={styles.info}>
                                <Text>{t('history.name')} {product.proName}</Text>
                                <Text>{t('history.quantity')} {product.quantity}</Text>
                                <Text>{t('history.price')} {formatPrice(product.totalPrice)}đ</Text>
                            </View>
                        </View>
                    )}
                />
                <Text style={styles.totalPrice}>{t('history.total_price')} {formatPrice(item.payment?.infoPaymentResponse?.amount || 0)} đ</Text>
                <Text>{t('history.order_date')} {item.dateCreated}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderGroupOrder = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('OrderGroupDetail', { groupOrderId: item.orderId })}
                style={{ marginBottom: 12 }}
            >
                <View style={{
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
                        {t('history.group_order')} #{item.shipmentId}
                    </Text>
                    <Text style={styles.infoText}>
                        {t('history.shipper')} <Text style={styles.bold}>{item.nameShipper}</Text>
                    </Text>
                    <Text style={styles.infoText}>
                        {t('order.customer')}: <Text style={styles.bold}>{item.customerName}</Text>
                    </Text>
                    <Text style={styles.infoText}>
                        {t('address')}: <Text style={styles.bold}>{item.address}</Text>
                    </Text>
                    <Text style={styles.infoText}>
                        {t('phone')}: <Text style={styles.bold}>{item.phoneNumber}</Text>
                    </Text>
                    <Text style={styles.infoText}>
                        {t('history.order_date')} <Text style={styles.bold}>{item.dateCreated}</Text>
                    </Text>
                   
                </View>
            </TouchableOpacity>
        );
    };


    return (
        <View style={styles.container}>
            <LinearGradient colors={['#f7eee9de', '#f3ebe0']} style={styles.container}>
                <View style={styles.flatlistContainer}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={22} color="#FF9800" />
                        </TouchableOpacity>
                        <Text style={styles.header}>{t('orderPending')}</Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, selectedTab === 'individual' && styles.activeTab]}
                            onPress={() => {
                                setSelectedTab('individual');
                                fetchIndividualOrders();
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
                                fetchGroupOrders();
                            }}
                        >
                            <Text style={[styles.tabText, selectedTab === 'group' && styles.activeTabText]}>
                                {t('history.group_order')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.separator} />

                    {/* Body */}
                    <View style={styles.body}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : error ? (
                            <Text style={{ color: 'red' }}>{error}</Text>
                        ) : selectedTab === 'individual' ? (
                            individualOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_list')} />
                            ) : (
                                <FlatList
                                    data={individualOrders}
                                    keyExtractor={(item) => item.orderId}
                                    renderItem={renderIndividualOrder}
                                    showsVerticalScrollIndicator={false}
                                />
                            )
                        ) : groupOrders.length === 0 ? (
                            <EmptyListAnimation title={t('history.empty_group_list')} />
                        ) : (
                            <FlatList
                                data={groupOrders}
                                keyExtractor={(item, index) => `group-${item?.crudGroupOrderResponse?.groupOrderId || index}`}
                                renderItem={renderGroupOrder}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

};



export default PendingOrder;
