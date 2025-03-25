
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from "../store/store";
import IconM from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from 'react-i18next';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../navigation/RootStackParamList";
import NotificationPopup from '../components/NotificationPopup';

interface Order {
    orderId: number;
    address: string;
    totalPrice: number;
    status: string;
}

interface Payment {
    paymentMethod: string;
    amount: number;
    statusPayment: string;
}

interface Shipment {
    nameShipper: string;
    dateDeliver?: string;
    status: string;
    address: string;
}

interface Item {
    proName: string;
    quantity: number;
    totalPrice: number;
    size: string;
    imageUrl: string;
}

const MyOrderDetails = () => {
    const route = useRoute();
    const { shipmentId } = route.params as { shipmentId: string | number };
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [customerName, setCustomerName] = useState<string>('');
    const [order, setOrder] = useState<Order | null>(null);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const { language, userId } = useCategoryStore();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const response = await axiosInstance.get(`/orders/detail/${shipmentId}?language=${language}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;
                console.log("test", data);
                setCustomerName(data.customerName || 'Không có tên');
                setOrder({
                    orderId: data.order.orderId,
                    address: data.order.address,
                    totalPrice: data.order.totalPrice,
                    status: data.order.status
                });
                setPayment({
                    paymentMethod: data.payment.paymentMethod || '',
                    amount: data.payment.amount || '',
                    statusPayment: data.payment.statusPayment || '',
                });
                setShipment({
                    nameShipper: data.shipment.nameShipper,
                    dateDeliver: data.shipment.dateDeliver,
                    status: data.shipment.status,
                    address: data.shipment.address
                });
                setItems(data.listItem.map((item: any) => ({
                    proName: item.proName,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    size: item.size,
                    imageUrl: item.imageUrl,
                })));
            } catch (err) {
                console.error("Lỗi fetchOrderDetails:", err);
                setError('Không thể tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [shipmentId]);

    if (loading) return <ActivityIndicator size="large" color="#FF9800" />;
    if (error) return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;

    return (
        <ScrollView style={styles.container}>
            {/* <NotificationPopup userId={userId ?? 0} /> */}
            <View style={styles.body}>
                <View style={styles.header}>
                    <Text style={styles.header}>Chi tiết đơn hàng</Text>
                    <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                        <IconM name="arrow-back" size={20} color="#FF9800" />
                    </TouchableOpacity>
                </View>
                {/* Mã đơn hàng */}
                <View style={styles.orderIdBox}>
                    <Text style={styles.orderIdText}>Mã đơn hàng: {order?.orderId || 'Không có'}</Text>
                </View>

                {/* Thông tin khách hàng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Tên khách hàng:</Text>
                        <Text style={styles.value}>{customerName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Địa chỉ giao hàng:</Text>
                    </View>
                    <View style={styles.detailRow}>

                        <Text style={styles.value}>{order?.address || 'Không có'}</Text>

                    </View>
                </View>

                {/* Thông tin đơn hàng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Tổng tiền:</Text>
                        <Text style={styles.value}>{order?.totalPrice || 'Không có'} VNĐ</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Trạng thái đơn hàng:</Text>
                        <Text style={styles.value}>{order?.status || 'Không có'}</Text>
                    </View>
                </View>

                {/* Thông tin thanh toán */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Phương thức thanh toán:</Text>
                        <Text style={styles.value}>{payment?.paymentMethod || 'Không có'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Tình trạng thanh toán:</Text>
                        <Text style={styles.value}>{payment?.statusPayment || 'Không có'}</Text>
                    </View>
                </View>

                {/* Thông tin giao hàng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Tên shipper:</Text>
                        <Text style={styles.value}>{shipment?.nameShipper || 'Không có'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Ngày giao hàng:</Text>
                        <Text style={styles.value}>{shipment?.dateDeliver || 'Chưa cập nhật'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Trạng thái giao hàng:</Text>
                        <Text style={styles.value}>{shipment?.status || 'Không có'}</Text>
                    </View>
                </View>

                {/* Danh sách sản phẩm */}
                <View style={styles.section}>
                    <Text style={styles.subHeader}>Danh sách sản phẩm</Text>
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <View key={index} style={styles.itemBox}>
                                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.proName}</Text>
                                    <Text style={styles.itemDetail}>Số lượng: {item.quantity}</Text>
                                    <Text style={styles.itemDetail}>Kích thước: {item.size}</Text>
                                    <Text style={styles.itemPrice}>{item.totalPrice} VNĐ</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Không có sản phẩm nào trong đơn hàng.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );

};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 16,
    },
    body: {
        flex: 1,
    },
    addressBox: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        minHeight: 50, // Đảm bảo không bị quá nhỏ
        justifyContent: 'center',
        marginTop: 4, // Tạo khoảng cách với tiêu đề
    },
    addressText: {
        fontSize: 16,
        color: '#555',
        flexWrap: 'wrap', // Cho phép xuống dòng
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    backIcon: {
        position: "absolute",
        top: 10,
        left: 5,
      },
    orderIdBox: {
        backgroundColor: '#ffcccb',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    orderIdText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#D9534F',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#0275d8',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
    },
    value: {
        fontSize: 16,
        color: '#666',
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#5cb85c',
    },
    itemBox: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemDetail: {
        fontSize: 14,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d9534f',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        marginTop: 10,
    },
});


export default MyOrderDetails;
