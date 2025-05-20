import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, StyleSheet,
    Image, TouchableOpacity, TextInput,
    Alert,
    Linking
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmptyListAnimation from '../components/EmptyListAnimation';
import { BORDERRADIUS, COLORS, FONTFAMILY, SPACING } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import DotLoading from '../components/DotLoading';
import { useCartStore } from '../store/useCartStore';
import { Swipeable } from 'react-native-gesture-handler';
import Loading from '../components/Loading';
import EditGroupNameModal from '../components/EditGroupNameModal';
import { useAlertStore } from '../store/alertStore';
import Notification from '../components/Notification';


interface GroupOrder {
    memberId: number;
    name: string;
    groupOrderId: number;
    nameGroup: string;
    userId: number;
    amount: number | null;
    isPaid: boolean;
    isLeader: boolean;
    note: string;
    status: string;
    typePayment: string;
    dateCreated: string;
}

const GroupOrderList: React.FC = () => {
    const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
    const [notification, setNotification] = useState({ message: '', visible: false });
    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
    };
    const [loading, setLoading] = useState<boolean>(true);
    const [editingGroup, setEditingGroup] = useState<GroupOrder | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [updating, setUpdating] = useState(false);
    const rawUserId = useCategoryStore.getState().userId;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { setGroupCartId, setHasGroupCart, fetchCartItem, groupCartData } = useCartStore.getState();
    const { language } = useCategoryStore();

    const fetchGroupOrders = async () => {
        const accessToken = await AsyncStorage.getItem('access_token');
        const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
        if (isNaN(userId)) return;

        try {
            const res = await axiosInstance.get(`/group-order/get-group-activate/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const filteredGroups = res.data.list.filter((group: GroupOrder) => {
                const status = group.status?.toUpperCase();
                if (status === 'COMPLETED' || status === 'CANCELED') return false;
                if (status === 'CHECKOUT' && !group.isLeader) return false; // ẩn với member
                return true;
            });

            setGroupOrders(filteredGroups);
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhóm:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchGroupOrders();
    }, []);

    const handleSaveGroupName = async (newName: string) => {
        const accessToken = await AsyncStorage.getItem('access_token');
        const { userId } = useCategoryStore.getState();


        if (!editingGroup) return;

        try {
            const response = await axiosInstance.put(
                '/group-order/update-name',
                {
                    nameGroup: newName,
                    groupId: editingGroup.groupOrderId,
                    leaderId: userId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = response.data;

            if (response.status === 200 && data === "Successfully updated name group") {
                setGroupOrders(prev =>
                    prev.map(group =>
                        group.groupOrderId === editingGroup.groupOrderId
                            ? { ...group, nameGroup: newName }
                            : group
                    )
                );
                setEditingGroup(null);
            } else {
                console.error('Cập nhật tên nhóm không thành công:', data);
                showNotification(t('android.mess.error3'))
            }
        } catch (error: any) {
            console.error('Lỗi API:', error?.response?.data || error.message);
            showNotification(t('error'))
        }
    };


    const handlePress = async (item: GroupOrder) => {
        try {
            setLoading(true);
            console.log('🔍 Bắt đầu handlePress với groupOrderId:', item.groupOrderId);

            const accessToken = await AsyncStorage.getItem('access_token');
            const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
            if (isNaN(userId)) {
                console.warn('⚠️ userId không hợp lệ:', rawUserId);
                return;
            }

            // 1. Gọi API kiểm tra thời gian còn lại
            const timeRes = await axiosInstance.get(
                `/group-order/${item.groupOrderId}/time-remaining`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const remainingTime = timeRes.data;
            console.log('⏰ Thời gian còn lại:', remainingTime);

            if (remainingTime === "00:00:00") {
                useAlertStore.getState().showAlert(
                    t('common.noti'),
                    'Nhóm đã hết hạn. Vui lòng xác nhận để hủy nhóm',
                    () => {
                        console.log('🗑️ Hủy nhóm');
                        useAlertStore.getState().hideAlert();
                        // TODO: Gọi API hủy nhóm nếu cần
                    },
                    undefined
                );
                return;
            }

            // 2. Lấy cartId
            const cartRes = await axiosInstance.get(
                `/group-order/get-id-cart-group/${userId}?groupOrderId=${item.groupOrderId}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const cartId = cartRes.data;
            console.log('✅ Lấy được cartId:', cartId);

            setGroupCartId(item.groupOrderId);
            setHasGroupCart(true);
            useCartStore.getState().hasRejectedGroupCart = false;
            useCartStore.getState().currentCartId = cartId;
            fetchCartItem();

            // 3. Gọi API detail group
            const detailRes = await axiosInstance.get(
                `/group-order/detail-group/${item.groupOrderId}?language=${language}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            const status = detailRes.data?.crudGroupOrderResponse?.status;
            const isLeader = detailRes.data?.crudGroupOrderResponseList[0]?.isLeader;

            console.log('📦 Detail group status:', status);
            console.log('👤 Is Leader:', isLeader);

            // 4. Nếu đã CHECKOUT
            if (status === 'CHECKOUT') {
                if (isLeader) {
                    // Gọi API lấy link thanh toán
                    const paymentLinkRes = await axiosInstance.get(
                        `/group-order/link-payment/${item.groupOrderId}`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                        }
                    );

                    const paymentLink = paymentLinkRes.data;
                    if (paymentLink && typeof paymentLink === 'string' && paymentLink.startsWith('http')) {
                        console.log('🔗 Mở link thanh toán:', paymentLink);
                        Linking.openURL(paymentLink);
                    } else {
                        console.log('⚠️ Không có link thanh toán, dẫn đến ChoosePay');
                        navigation.navigate('ChoosePay', { groupOrderId: item.groupOrderId });
                    }
                } else {
                    console.warn('⛔ Không phải leader trong trạng thái CHECKOUT');
                    return;
                }
            }
            else {
                console.log('➡️ Dẫn hướng đến GroupOrderDetail');
                navigation.navigate('GroupOrderDetail', { groupOrderId: item.groupOrderId });
            }
        } catch (error) {
            console.error('❌ Lỗi khi xử lý chọn nhóm:', error);
            showNotification(t('error'));
        } finally {
            setLoading(false);
        }
    };




    const handleLeaveGroup = (item: GroupOrder) => {
        const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);

        if (item.isLeader) {
            useAlertStore.getState().showAlert(
                t('android.mess.title5'),
                t('android.mess.check5'),
                async () => {
                    try {
                        const token = await AsyncStorage.getItem('access_token');
                        await axiosInstance.delete(
                            `/group-order/delete/${item.groupOrderId}/${userId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        showNotification(t('android.mess.sucess1'));
                        fetchGroupOrders(); // cập nhật lại danh sách nhóm sau khi xoá
                    } catch (err) {
                        console.error('Lỗi khi xoá nhóm:', err);
                        showNotification(t('android.mess.error1'));
                    }
                },
                () => {
                    // Hủy bỏ
                }
            );
        } else {
            useAlertStore.getState().showAlert(
                t('android.mess.title4'),
                t('android.mess.check4'),
                async () => {
                    try {
                        const token = await AsyncStorage.getItem('access_token');
                        await axiosInstance.put(
                            `/group-order/leave/${item.groupOrderId}/${userId}`,
                            {},
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        showNotification(t('android.mess.sucess2'));
                        fetchGroupOrders(); // cập nhật lại danh sách nhóm
                    } catch (err) {
                        console.error('Lỗi khi rời nhóm:', err);
                        showNotification(t('android.mess.error2'));
                    }
                },
                () => {
                    // Hủy bỏ
                }
            );
        }
    };



    const renderGroupOrder = ({ item }: { item: GroupOrder }) => {
        const renderRightActions = () => (
            <View style={styles.swipeActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleLeaveGroup(item)}
                >
                    <Icon name="delete" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );


        return (
            <Swipeable renderRightActions={renderRightActions}>
                <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
                    <View style={styles.card}>
                        <View style={styles.groupOrderHeader}>
                            <View style={styles.groupHeaderLeft}>
                                <Image source={require("../assets/app_images/avtgroup.jpeg")} style={styles.avatar} />
                                <Text style={styles.groupNameText}> {item.nameGroup}</Text>
                                {item.isLeader && (
                                    <TouchableOpacity onPress={() => {
                                        setEditingGroup(item);
                                        setNewGroupName(item.nameGroup);
                                    }}>
                                        <Icon name="edit" size={20} color="#FF9800" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <Text style={[styles.groupOrderInfo, getStatusStyle(item.status)]}>
                            <Text style={[styles.groupOrderInfo, getStatusStyle(item.status)]}>
                                {t('common.status')}: {t(`android.status_label.${item.status}`)}
                            </Text>

                        </Text>
                        <Text style={styles.groupOrderInfo}>
                            {t('userContent.role')}: <Text style={styles.boldText}>{item.isLeader ? t('android.status_label.leader') : t('android.status_label.member')}</Text>
                        </Text>
                        <Text style={styles.groupOrderInfo}>
                            {t('android.status_label.joinDate')}: {new Date(item.dateCreated).toLocaleString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <View style={styles.container}>
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Main')}>
                    <Icon name="arrow-back" size={20} color="#FF9800" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('android.groupOrderList')}</Text>
            </View>

            {loading ? (
                <View style={styles.loadingOverlay}>
                    <DotLoading title={''} />
                </View>
            ) : groupOrders.length === 0 ? (
                <EmptyListAnimation title={t('history.empty_list')} />
            ) : (
                <FlatList
                    data={groupOrders}
                    keyExtractor={(item) => item.groupOrderId.toString()}
                    renderItem={renderGroupOrder}
                    ListEmptyComponent={<EmptyListAnimation title={t('history.empty_list')} />}
                    showsVerticalScrollIndicator={false}
                />


            )}
            <EditGroupNameModal
                visible={editingGroup !== null}
                initialName={editingGroup?.nameGroup || ''}
                onCancel={() => setEditingGroup(null)}
                onSave={handleSaveGroupName}
            />

        </View>
    );
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'SHOPPING': return { color: '#2196F3' };
        case 'CREATED': return { color: '#FFA500' };
        case 'FINISHED': return { color: '#4CAF50' };
        default: return { color: '#888' };
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
    card: {
        backgroundColor: '#fff', padding: 16, borderRadius: 12,
        shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4, elevation: 3, marginBottom: 16,
    },
    groupOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    groupOrderInfo: { fontSize: 26, color: '#555', marginBottom: 6, fontFamily: FONTFAMILY.dongle_regular },
    boldText: { fontWeight: '600', color: '#222' },
    groupHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    groupNameText: { fontSize: 22, color: '#333', marginRight: 8, fontFamily: FONTFAMILY.lobster_regular },
    swipeActions: {
        backgroundColor: 'transparent',
        padding: 10,
        justifyContent: 'center',

    },
    deleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 13
    },

    header: {
        flexDirection: "row", justifyContent: "center", alignItems: "center",
        marginBottom: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E0E0E0",
    },
    backIcon: {
        position: "absolute", left: 5, padding: 8, borderRadius: 10,
        backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    },
    headerTitle: { fontSize: 24, fontFamily: FONTFAMILY.lobster_regular, color: "#333" },
    loadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', justifyContent: 'center', zIndex: 999,
    },
    modalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#FFF7F0',
        padding: 24,
        borderRadius: 16,
        width: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#FFBC8C',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#FFF0E6',
        color: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        color: '#E35D11',
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
});

export default GroupOrderList;
