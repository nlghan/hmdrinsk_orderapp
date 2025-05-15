
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
import { FONTFAMILY } from '../theme/theme';
import { RootStackParamList } from "../navigation/RootStackParamList";

const PendingOrder = () => {
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
    const [waitingOrders, setWaitingOrders] = useState<Order[]>([]);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { language, userId } = useCategoryStore();

    useEffect(() => {
        fetchWaitingList();
    }, []);

    const fetchWaitingList = async () => {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('access_token');
        try {
            const response = await axiosInstance.get(`/shipment/view/list-waiting/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            console.log("check", response.data);

            const listOrders = response.data.listShipment || [];

            const promises = listOrders.map(async (order: Order) => {
                try {
                    const responsePayment = await axiosInstance.get(`/orders/info-payment-language?orderId=${order.orderId}&language=${language}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                    console.log("responsePayment", responsePayment.data);
                    return { ...order, payment: responsePayment.data, cartItems: responsePayment.data.cartItems || [], };

                } catch (error) {
                    console.error(`Lỗi khi lấy payment cho orderId ${order.orderId}:`, error);
                    return { ...order, payment: null };
                }
            });
            const listWithPaymentInfo = await Promise.all(promises);
            setWaitingOrders(listWithPaymentInfo);
            console.log("listWithPaymentInfo", listWithPaymentInfo);
        } catch (error) {
            console.error('Lỗi fetchWaitingList:', error);
            setError(language === 'EN' ? 'Unable to load the waiting list data.' : 'Không thể tải dữ liệu danh sách chờ.');
        } finally {
            setLoading(false);
        }
    };
    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    const getFirstImageUrl = (imageUrl: string): string => {
        if (!imageUrl) {
            return 'https://via.placeholder.com/60'; // Hình mặc định nếu rỗng
        }

        // Tách chuỗi thành mảng các URL
        const urls = imageUrl.split(',').map((url) => url.trim());

        // Lấy phần tử đầu tiên và trích xuất URL sau "1: "
        const firstUrlMatch = urls[0].match(/1:\s*(https?:\/\/[^\s]+)/);

        return firstUrlMatch ? firstUrlMatch[1] : 'https://via.placeholder.com/60';
    };


    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

    return (
        <View style={styles.container}>
            {/* <LinearGradient colors={['#f7eee9de', '#f3ebe0']} style={styles.container}> */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={22} color="#FF9800" />
                </TouchableOpacity>
                <Text style={styles.header}>{t('orderPending')}</Text>
            </View>

            <View style={styles.body}>
                {waitingOrders.length === 0 ? (
                    <EmptyListAnimation title={t('history.empty_list')} />
                ) : (
                    <FlatList
                        data={waitingOrders}
                        keyExtractor={(item) => item?.orderId?.toString() || `order-${Math.random()}`}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('MyOrderDetails', { shipmentId: Number(item?.orderId) })}>
                                    <Text style={styles.orderId}>{t('history.order_id')} {item?.orderId}</Text>
                                    <FlatList
                                        data={item?.cartItems}
                                        keyExtractor={(product) => product?.cartItemId?.toString() || `product-${Math.random()}`}
                                        renderItem={({ item: product }: { item: ProductItem }) => (
                                            <View style={styles.productContainer}>
                                                <Image
                                                    source={{ uri: getFirstImageUrl(product.imageUrl) }}
                                                    style={styles.image}
                                                    onError={(e) => console.log('Lỗi tải hình:', e.nativeEvent.error)}
                                                />
                                                <View style={styles.info}>
                                                    <Text style={styles.title}>{t('history.name')} {product.proName}</Text>
                                                    <Text style={styles.size}>{t('history.quantity')} {product.quantity}</Text>
                                                    <Text style={styles.price}>{t('history.price')} {formatPrice(product.totalPrice)}đ</Text>
                                                </View>
                                            </View>
                                        )}
                                    />
                                    {/* <Text style={styles.boldText}>{t('address')}: {item.address}</Text> */}

                                    <Text style={styles.boldText2}><Text style={styles.boldText}>{t('phone')}:</Text> {item.phoneNumber} </Text>

                                    <Text style={styles.boldText2}><Text style={styles.boldText}>{t('order.discount')}:</Text> {item.payment?.discountPrice} VND</Text>
                                    <Text style={styles.boldText2}><Text style={styles.boldText}>{t('order.shipFee')}:</Text> {item.payment?.deliveryFee} VND</Text>
                                    <Text style={styles.totalPrice}>
                                        <Text style={styles.boldText}>{t('history.total_price')}</Text> {item.payment?.infoPaymentResponse.amount} đ
                                    </Text>
                                    <Text>
                                        <Text style={styles.boldText}>{t('history.order_date')}</Text> {item.dateCreated}
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    />
                )}
            </View>
            {/* </LinearGradient> */}
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
        backgroundColor: '#fff',
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
        fontFamily: FONTFAMILY.lobster_regular,
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
        marginBottom: 8,
        fontSize: 30,
        fontFamily: FONTFAMILY.dongle_bold,
    },
    boldText: {
        fontFamily: FONTFAMILY.dongle_regular,
        fontSize: 26,
    },
        boldText2: {
        fontFamily: FONTFAMILY.dongle_light,
        fontSize: 24
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
        fontSize: 26,
        color: '#333',
        marginBottom: 4,
        fontFamily: FONTFAMILY.dongle_regular,
    },
    size: {
        fontSize: 24,
        color: 'gray',
        fontFamily: FONTFAMILY.dongle_regular,
    },
    price: {
        fontSize: 26,
        color: '#27ae60',
        marginTop: 4,
        fontFamily: FONTFAMILY.dongle_regular,
    },
    totalPrice: {
        fontSize: 26,
        fontFamily: FONTFAMILY.dongle_regular,
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

export default PendingOrder;
