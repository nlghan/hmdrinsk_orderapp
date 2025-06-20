import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ActivityIndicator,
    Image, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from "../store/store";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/MaterialIcons";
import EmptyListAnimation from '../components/EmptyListAnimation';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import styles from '../styles/orderHistoryStyle';

const WaitingOrder = () => {
    const [selectedTab, setSelectedTab] = useState<'normal' | 'group'>('normal');
    const [normalOrders, setNormalOrders] = useState<any[]>([]);
    const [groupOrders, setGroupOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdowns, setCountdowns] = useState<{ [orderId: string]: number }>({});
    const { language, userId, checkTimeOrder } = useCategoryStore();
    const { t } = useTranslation();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        fetchNormalOrders();
        fetchGroupOrders();
    }, []);

    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];
        const expiredOrders: Set<string> = new Set();

        normalOrders.forEach(order => {
            const [d, t] = order.dateOders.split(' ');
            const [y, m, day] = d.split('-').map(Number);
            const [h, min, s] = t.split(':').map(Number);
            const orderTime = new Date(y, m - 1, day, h, min, s).getTime();
            const endTime = orderTime + 30 * 60 * 1000;

            const updateCountdown = () => {
                const now = Date.now();
                const timeLeft = Math.max(endTime - now, 0);
                setCountdowns(prev => ({ ...prev, [order.orderId]: timeLeft }));
                if (timeLeft <= 0 && !expiredOrders.has(order.orderId)) {
                    expiredOrders.add(order.orderId);
                    checkTimeOrder();
                    setTimeout(() => fetchNormalOrders(), 500);
                }
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            intervals.push(interval);
        });

        return () => intervals.forEach(clearInterval);
    }, [normalOrders.length]);

    const fetchNormalOrders = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('access_token');
        try {
            const res = await axiosInstance.get(
                `/orders/view/fetchOrdersAwaiting/${userId}?language=${language}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const { listOrderWaiting, listAllOrderConfirmAndNotPayment, listAllOrderConfirmAndPaymentPending } = res.data;
            const combined = [
                ...(listOrderWaiting?.list || []),
                ...(listAllOrderConfirmAndNotPayment?.list || []),
                ...(listAllOrderConfirmAndPaymentPending?.list || [])
            ];
            setNormalOrders(combined);
        } catch (err) {
            setError(t('history.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupOrders = async () => {
        const token = await AsyncStorage.getItem('access_token');
        try {
            const res = await axiosInstance.get(`/group-order/list-awaiting/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroupOrders(res.data?.listGroup || []);
        } catch (err) {
            console.error('❌ fetch group failed:', err);
        }
    };

    const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const formatCountdown = (time: number | undefined) => {
        if (!time || time <= 0) return '00:00:00';
        const h = Math.floor(time / (1000 * 60 * 60));
        const m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((time % (1000 * 60)) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const renderNormalItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Payment', { orderId: Number(item.orderId) })}>
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
                <Text style={styles.totalPrice}><Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(item.totalPrice)}đ</Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.dateOders}</Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.countdown')}</Text> {formatCountdown(countdowns[item.orderId])}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderGroupItem = (group: any) => {
        const detail = group.crudGroupOrderResponse;
        const member = group.crudGroupOrderResponseList.find((m: any) => m.userId === userId);
        const items = member?.crudCartGroupResponse?.listCartItemGroup || [];

        return (
            <TouchableOpacity onPress={() => navigation.navigate('OrderGroupDetail', { groupOrderId: detail.groupOrderId })}>
                <View style={styles.card}>
                    <Text style={styles.orderId}><Text style={styles.boldText}>{t('history.group_order')}</Text> #{detail.groupOrderId}</Text>
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
                    <Text style={styles.totalPrice}><Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(group.total)}đ</Text>
                    <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.order_date')}</Text> {detail.orderDate}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    return (
        <LinearGradient colors={['#f7eee9de', '#f3ebe0']} style={styles.container}>
            <View style={styles.flatlistContainer}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={22} color="#FF9800" />
                    </TouchableOpacity>
                    <Text style={styles.header}>{t('orderPayment')}</Text>
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

                {selectedTab === 'normal' ? (
                    normalOrders.length === 0 ? (
                        <EmptyListAnimation title={t('history.empty_list')} />
                    ) : (
                        <FlatList
                            data={normalOrders}
                            keyExtractor={(item) => item?.orderId?.toString()}
                            renderItem={renderNormalItem}
                        />
                    )
                ) : (
                    groupOrders.length === 0 ? (
                        <EmptyListAnimation title={t('history.empty_list')} />
                    ) : (
                        <FlatList
                            data={groupOrders}
                            keyExtractor={(item, index) => `group-${item?.crudGroupOrderResponse?.groupOrderId || index}`}
                            renderItem={({ item }) => renderGroupItem(item)}
                        />
                    )
                )}
            </View>
        </LinearGradient>
    );
};

export default WaitingOrder;