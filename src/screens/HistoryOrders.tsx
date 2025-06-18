import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
import styles from '../styles/orderHistoryStyle'
import { useAlertStore } from '../store/alertStore';

const HistoryOrders = () => {
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

    const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
    const [groupOrders, setGroupOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState<'normal' | 'group'>('normal');

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { language, userId } = useCategoryStore();

    useEffect(() => {
        fetchHistoryOrders();
        fetchGroupOrders();
    }, []);

    const fetchHistoryOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(`/orders/history/${userId}?language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.list) {
                setHistoryOrders(response.data.list.map((item: { order: Order; shipment: Shipment }) => ({
                    ...item.order,
                    shipment: item.shipment,
                })));
            } else {
                setHistoryOrders([]);
            }
        } catch (err) {
            console.error("Lỗi fetchHistoryOrders:", err);
            setError('Không thể tải danh sách lịch sử đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(`/group-order/list-success/${userId}?page=1&size=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data?.listGroup) {
                setGroupOrders(response.data.listGroup);
            }
        } catch (err) {
            console.error("Lỗi fetchGroupOrders:", err);
        }
    };

    const handleRestoreOrder = (orderId: string) => {
        const handleRestoreOrder = (orderId: string) => {
            useAlertStore.getState().showAlert(
                t('history.reorder'),
                t('history.confirm_reorder'),
                () => {
                    // TODO: Gọi API mua lại đơn hàng ở đây
                    console.log('✅ Mua lại đơn hàng:', orderId);
                },
                () => {
                    console.log('❌ Đã hủy mua lại');
                }
            );
        };
    };

    const handlePrint = (orderId: string) => {
        useAlertStore.getState().showAlert(
            t('history.print_invoice'),
            t('history.confirm_invoice'),
            () => {
                // TODO: Gọi xử lý in hóa đơn tại đây
                console.log('🖨️ In hóa đơn:', orderId);
            }
            // Không cần onCancel
        );
    };

    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const renderGroupOrder = (group: any) => {
        const leaderName = group.crudGroupOrderResponse.nameLeader;
        const orderDate = group.crudGroupOrderResponse.orderDate;
        const items = group.crudGroupOrderResponseList.find(
            (mem: any) => mem.userId === userId
        )?.crudCartGroupResponse?.listCartItemGroup || [];

        return (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('OrderGroupDetail', {
                        groupOrderId: group.crudGroupOrderResponse.groupOrderId,
                    })
                }
            >
                <View style={styles.card}>
                    <Text style={styles.orderId}>
                        <Text style={styles.boldText}>{t('history.group_order')}</Text> #{group.crudGroupOrderResponse.groupOrderId}
                    </Text>
                    {items.length > 0 && (
                        <View style={styles.productContainer} key={items[0].cartItemGroupId}>
                            <Image
                                source={{ uri: items[0].imageUrl.split(',')[0].split(': ')[1] }}
                                style={styles.image}
                            />
                            <View style={styles.info}>
                                <Text style={styles.title}>
                                    {t('history.name')} {items[0].proName}
                                </Text>
                                <Text style={styles.size}>
                                    {t('history.quantity')} {items[0].quantity}
                                </Text>
                                <Text style={styles.price}>
                                    {t('history.price')} {formatPrice(items[0].totalPrice)}đ
                                </Text>

                                {items.length > 1 && (
                                    <Text style={styles.moreText}>+ {items.length - 1} {t('history.otherItems')}</Text>
                                )}
                            </View>
                        </View>
                    )}


                    <Text style={styles.totalPrice}>
                        <Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(group.total)}đ
                    </Text>
                    <Text style={styles.boldText2}>
                        <Text style={styles.boldText1}>{t('history.order_date')}</Text> {orderDate}
                    </Text>
                    <Text style={styles.boldText2}>
                        <Text style={styles.boldText1}>{t('android.status_label.leader')}</Text> {leaderName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
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
                        <Text style={styles.header}>{t('history.history')}</Text>
                    </View>


                    {/* Tab Buttons */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, selectedTab === 'normal' && styles.activeTab]}
                            onPress={() => {
                                setSelectedTab('normal');
                                fetchHistoryOrders();
                            }}
                        >
                            <Text style={[styles.tabText, selectedTab === 'normal' && styles.activeTabText]}>
                                {t('history.normal_order')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, selectedTab === 'group' && styles.activeTab]}
                            onPress={() => setSelectedTab('group')}
                        >
                            <Text style={[styles.tabText, selectedTab === 'group' && styles.activeTabText]}>
                                {t('history.group_order')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separator}>

                    </View>

                    {/* Tab Content */}
                    <View style={styles.body}>
                        {selectedTab === 'normal' ? (
                            historyOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_list')} />
                            ) : (
                                <FlatList
                                    data={historyOrders}
                                    keyExtractor={(item) => item?.orderId?.toString() || `order-${Math.random()}`}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item?.orderId) })}
                                        >
                                            <View style={styles.card}>
                                                <Text style={styles.orderId}>
                                                    <Text style={styles.boldText}>{t('history.order_id')}</Text> {item?.orderId}
                                                </Text>

                                                {item?.listItem?.length > 0 && (
                                                    <View style={styles.productContainer}>
                                                        <Image
                                                            source={{ uri: item.listItem[0].imageUrl }}
                                                            style={styles.image}
                                                        />
                                                        <View style={styles.info}>
                                                            <Text style={styles.title}>
                                                                {t('history.name')} {item.listItem[0].proName}
                                                            </Text>
                                                            <Text style={styles.size}>
                                                                {t('history.quantity')} {item.listItem[0].quantity}
                                                            </Text>
                                                            <Text style={styles.price}>
                                                                {t('history.price')} {formatPrice(item.listItem[0].totalPrice)}đ
                                                            </Text>

                                                            {item.listItem.length > 1 && (
                                                                <Text style={styles.moreText}>+ {item.listItem.length - 1} {t('history.otherItems')}</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                )}


                                                <Text style={styles.totalPrice}>
                                                    <Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(Math.max(item.totalPrice + item.deliveryFee - item.discountPrice, 0))}đ
                                                </Text>
                                                <Text style={styles.boldText2}>
                                                    <Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}
                                                </Text>
                                                <Text style={styles.boldText2}>
                                                    <Text style={styles.boldText1}>{t('history.shipper')}</Text> {item.shipment?.nameShipper}
                                                </Text>
                                                <Text style={styles.boldText2}>
                                                    <Text style={styles.boldText1}>{t('history.delivery_date')}</Text>{' '}
                                                    {item.shipment?.dateShipped ? item.shipment.dateShipped : t('history.delivery_failed')}
                                                </Text>
                                                <View style={styles.buttonContainer}>
                                                    <TouchableOpacity onPress={() => navigation.navigate('ChatWithShipper', { shipmentId: Number(item.shipment?.shipmentId) })} style={styles.button}>
                                                        <Text style={styles.buttonText}>{t('chat.title')}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleRestoreOrder(item.orderId)} style={styles.button}>
                                                        <Text style={styles.buttonText}>{t('history.reorder')}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handlePrint(item.orderId)} style={styles.button}>
                                                        <Text style={styles.buttonText}>{t('history.print_invoice')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            )
                        ) : (
                            groupOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_group_list')} />
                            ) : (
                                <FlatList
                                    data={groupOrders}
                                    keyExtractor={(item, index) => `group-${item?.crudGroupOrderResponse?.groupOrderId || index}`}

                                    renderItem={({ item }) => renderGroupOrder(item)}
                                />
                            )

                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

export default HistoryOrders;
