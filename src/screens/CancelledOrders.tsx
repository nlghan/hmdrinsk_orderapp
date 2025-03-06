import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
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
import { useOrderStoreCancelled } from "../store/countStore";

const CancelledOrder = () => {
    type Product = {
        cartItemId: string;
        imageUrl: string;
        proName: string;
        quantity: number;
        totalPrice: number;
    };

    type CancelledOrder = {
        orderId: string;
        listItem: Product[];
        totalPrice: number;
        deliveryFee: number;
        discountPrice: number;
        dateOders: string;
        dateCanceled: string;
    };


    const [cancelledOrders, setCancelledOrders] = useState<CancelledOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { language, userId } = useCategoryStore();
    const { setOrderCountCancelled } = useOrderStoreCancelled();

    useEffect(() => {
        fetchCancelledOrders();
    }, []);

    const fetchCancelledOrders = async () => {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('access_token');

        try {
            const responsePaid = await axiosInstance.get(`/orders/view/order-cancel/payment-have/${userId}?language=${language}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        accept: '*/*',
                    },
                }
            );
            console.log("🚚 Đơn hàng đa huy:", responsePaid.data);
            if (responsePaid.data && responsePaid.data.list) {
                setCancelledOrders(responsePaid.data.list);
                setOrderCountCancelled(responsePaid.data.list.length);
            } else {
                setCancelledOrders([]);
                setOrderCountCancelled(0);
            }
        } catch (err) {
            console.error("Lỗi fetchCancelledOrders:", err);
            setError('Không thể tải danh sách lịch sử đơn hàng.');
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
                        <Text style={styles.header}>{t('orderCancelled')}</Text>
                    </View>

                    <View style={styles.body}>
                        {cancelledOrders.length === 0 ? (
                            <EmptyListAnimation title={t('history.empty_list')} />
                        ) : (
                            <FlatList
                                data={cancelledOrders}
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
                                            <Text>
                                                <Text style={styles.boldText}>{t('history.delivery_cancel')}</Text>{item.dateCanceled}
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

export default CancelledOrder;

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
