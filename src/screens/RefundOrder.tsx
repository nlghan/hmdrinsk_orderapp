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

const RefundOrder = () => {
    const [normalOrders, setNormalOrders] = useState<any[]>([]);
    const [groupOrders, setGroupOrders] = useState<any[]>([]);
    const [selectedTab, setSelectedTab] = useState<'normal' | 'group'>('normal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { language, userId } = useCategoryStore();
    const { handleRestoreOrder } = useCartStore();

    useEffect(() => {
        fetchNormalRefundOrders();
        fetchGroupRefundOrders();
    }, []);

    const fetchNormalRefundOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(`/orders/view/order-cancel/payment-refund-user/${userId}?language=${language}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNormalOrders(response.data?.list || []);
        } catch (err) {
            console.error("Lỗi fetch normal refund orders:", err);
            setError(t('history.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupRefundOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await axiosInstance.get(
                `/group-order/list-refund/${userId}?page=1&size=10`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const listGroup = response.data?.listGroup || [];

            // Gán dữ liệu vào state
            setGroupOrders(listGroup);
        } catch (err) {
            console.error("Lỗi fetch group refund orders:", err);
        }
    };



    const formatPrice = (price: number) =>
        price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    const renderNormalOrder = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item.order.orderId) })}>
            <View style={styles.card}>
                <Text style={styles.orderId}><Text style={styles.boldText}>{t('history.order_id')}</Text> {item.order.orderId}</Text>
                {item.order.listItem?.length > 0 && (
                    <View style={styles.productContainer}>
                        <Image source={{ uri: item.order.listItem[0].imageUrl }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.title}>{t('history.name')} {item.order.listItem[0].proName}</Text>
                            <Text style={styles.size}>{t('history.quantity')} {item.order.listItem[0].quantity}</Text>
                            <Text style={styles.price}>{t('history.price')} {formatPrice(item.order.listItem[0].totalPrice)}đ</Text>
                            {item.order.listItem.length > 1 && (
                                <Text style={styles.moreText}>+ {item.order.listItem.length - 1} {t('history.otherItems')}</Text>
                            )}
                        </View>
                    </View>
                )}
                <Text style={styles.totalPrice}><Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(item.order.totalPrice)}đ</Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.order_date')}</Text> {item.order.dateOders}</Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.payment_method')}</Text> {item.payment.paymentMethod}</Text>
                <Text style={styles.boldText2}><Text style={styles.boldText1}>{t('history.refunded_status')}</Text> {item.payment.refunded ? t('history.refunded') : t('history.not_refunded')}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => handleRestoreOrder(Number(item.order.orderId), Number(userId))} style={styles.button}>
                        <Text style={styles.buttonText}>{t('history.reorder')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderGroupOrder = (group: any) => {
  const detail = group.crudGroupOrderResponse;
  const memberInfo = group.crudGroupOrderResponseList.find((mem: any) => mem.userId === userId);
  const items = memberInfo?.crudCartGroupResponse?.listCartItemGroup || [];

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
            <Image
              source={{ uri: items[0].imageUrl?.split(',')[0]?.split(': ')[1]?.trim() || '' }}
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
          <Text style={styles.boldText1}>{t('history.total_price')}</Text> {formatPrice(group.total || 0)}đ
        </Text>
        <Text style={styles.boldText2}>
          <Text style={styles.boldText1}>{t('history.order_date')}</Text> {detail.orderDate}
        </Text>
        <Text style={styles.boldText2}>
          <Text style={styles.boldText1}>{t('android.status_label.leader')}</Text> {detail.nameLeader}
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
                        <Text style={styles.header}>{t('orderRefunded')}</Text>
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
                            normalOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_list')} />
                            ) : (
                                <FlatList
                                    data={normalOrders}
                                    keyExtractor={(item) => item.order.orderId.toString()}
                                    renderItem={renderNormalOrder}
                                />
                            )
                        ) : (
                            groupOrders.length === 0 ? (
                                <EmptyListAnimation title={t('history.empty_list')} />
                            ) : (
                                <FlatList
                                    data={groupOrders}
                                    keyExtractor={(item, index) => `group-${item?.groupOrderDetail?.groupOrderId || index}`}
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

export default RefundOrder;
