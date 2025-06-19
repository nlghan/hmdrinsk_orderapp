import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    Image, ActivityIndicator, StyleSheet
} from 'react-native';
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
import { useCartStore } from '../store/useCartStore';
import styles from '../styles/orderHistoryStyle';
import { FONTFAMILY } from '../theme/theme';

const CancelledOrder = () => {
    const [cancelledOrders, setCancelledOrders] = useState<any[]>([]);
    const [groupOrders, setGroupOrders] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState<'normal' | 'group'>('normal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { language, userId } = useCategoryStore();
    const { handleRestoreOrder } = useCartStore();

    useEffect(() => {
        fetchCancelledOrders();
        fetchGroupOrders();
    }, []);

    const fetchCancelledOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(`/orders/view/order-cancel/payment-have/${userId}?language=${language}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCancelledOrders(response.data?.list || []);
        } catch (err) {
            console.error("Lỗi fetchCancelledOrders:", err);
            setError(t('history.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(`/group-order/get-all-group-cancel/${userId}?language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroupOrders(response.data?.detailGroupOrders || []);
        } catch (err) {
            console.error("Lỗi fetchGroupOrders:", err);
        }
    };

    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const renderNormalOrder = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item.orderId) })}>
            <View style={styles.card}>
                <Text style={styles.orderId}><Text style={styles.boldText}>{t('history.order_id')}</Text> {item.orderId}</Text>
                {item.listItem?.length > 0 && (
                    <View style={styles.productContainer}>
                        <Image source={{ uri: item.listItem[0].imageUrl }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.title}>{t('history.name')} {item.listItem[0].proName}</Text>
                            <Text style={styles.size}>{t('history.quantity')} {item.listItem[0].quantity}</Text>
                            <Text style={styles.price}>{t('history.price')} {formatPrice(item.listItem[0].totalPrice)}đ</Text>
                            {item.listItem.length > 1 && (
                                <Text style={styles.moreText}>+ {item.listItem.length - 1} {t('history.otherItems')}</Text>
                            )}
                        </View>
                    </View>
                )}
                <Text style={styles.totalPrice}>
                    <Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(Math.max(item.totalPrice + item.deliveryFee - item.discountPrice, 0))} đ
                </Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}</Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.delivery_cancel')}</Text> {item.dateCanceled}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => handleRestoreOrder(Number(item.orderId), Number(userId))} style={styles.button}>
                        <Text style={styles.buttonText}>{t('history.reorder')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderGroupOrder = (group: any) => {
        const detail = group.groupOrderDetail;
        const leaderName = detail.nameLeader;
        const orderDate = detail.orderDate;
        const items = (group.listDetailCartGroup || [])
            .find((mem: any) => mem.userId === userId)?.listCartItemGroup || [];

        

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('OrderGroupDetail', {
                    groupOrderId: detail.groupOrderId,
                })}
            >
                <View style={styles.card}>
                    <Text style={styles.orderId}>
                        <Text style={styles.boldText}>{t('history.group_order')}</Text> #{detail.groupOrderId}
                    </Text>

                    {items.length > 0 && (
                        <View style={styles.productContainer}>
                            <Image source={{ uri: items[0].imageUrl?.split(',')[0]?.split(': ')[1] || '' }} style={styles.image} />
                            <View style={styles.info}>
                                <Text style={styles.title}>{t('history.name')} {items[0].proName}</Text>
                                <Text style={styles.size}>{t('history.quantity')} {items[0].quantity}</Text>
                                <Text style={styles.price}>{t('history.price')} {formatPrice(items[0].totalPrice)}đ</Text>
                                {items.length > 1 && (
                                    <Text style={styles.moreText}>+ {items.length - 1} {t('history.otherItems')}</Text>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={styles.totalPrice}>
                        <Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(group.total || 0)}đ
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
                        <Text style={styles.header}>{t('orderCancelled')}</Text>
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, selectedTab === 'normal' && styles.activeTab]}
                            onPress={() => setSelectedTab('normal')}
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

                    <View style={styles.separator} />

                    <View style={styles.body}>
                        {selectedTab === 'normal' ? (
                            cancelledOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_list')} />
                            ) : (
                                <FlatList
                                    data={cancelledOrders}
                                    keyExtractor={(item) => item.orderId.toString()}
                                    renderItem={renderNormalOrder}
                                />
                            )
                        ) : (
                            groupOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_list')} />
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


export default CancelledOrder;

