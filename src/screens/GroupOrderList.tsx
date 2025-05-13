import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, ActivityIndicator, StyleSheet,
    Image, TouchableOpacity, TextInput,
    Alert
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
    const [loading, setLoading] = useState<boolean>(true);
    const [editingGroup, setEditingGroup] = useState<GroupOrder | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [updating, setUpdating] = useState(false);
    const rawUserId = useCategoryStore.getState().userId;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { setGroupCartId, setHasGroupCart, fetchCartItem } = useCartStore.getState();

    const fetchGroupOrders = async () => {
        const accessToken = await AsyncStorage.getItem('access_token');
        const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
        if (isNaN(userId)) return;

        try {
            const res = await axiosInstance.get(`/group-order/get-group-activate/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setGroupOrders(res.data.list);
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
                Alert.alert('Lỗi', 'Không thể cập nhật tên nhóm.');
            }
        } catch (error: any) {
            console.error('Lỗi API:', error?.response?.data || error.message);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gọi API.');
        }
    };


    const handlePress = async (item: GroupOrder) => {
        try {
            const accessToken = await AsyncStorage.getItem('access_token');
            const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
            if (isNaN(userId)) return;

            const res = await axiosInstance.get(`/group-order/get-id-cart-group/${userId}?groupOrderId=${item.groupOrderId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const cartId = res.data;
            setGroupCartId(item.groupOrderId);
            setHasGroupCart(true);
            useCartStore.getState().hasRejectedGroupCart = false;
            useCartStore.getState().currentCartId = cartId;
            fetchCartItem();
            navigation.navigate('GroupOrderDetail', { groupOrderId: item.groupOrderId });
        } catch (error) {
            console.error('Lỗi khi lấy cartId cho user trong group:', error);
        }
    };

    const renderGroupOrder = ({ item }: { item: GroupOrder }) => {
        const renderRightActions = () => (
            <View style={styles.swipeActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Xác nhận rời nhóm',
                            'Bạn có chắc muốn rời khỏi nhóm này?',
                            [
                                { text: 'Hủy', style: 'cancel' },
                                {
                                    text: 'Rời nhóm',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            const token = await AsyncStorage.getItem('access_token');
                                            const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);

                                            await axiosInstance.put(
                                                `/group-order/leave/${item.groupOrderId}/${userId}`,
                                                {},
                                                {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                }
                                            );

                                            fetchGroupOrders(); // Cập nhật lại danh sách nhóm
                                        } catch (err) {
                                            console.error('Lỗi khi rời nhóm:', err);
                                        }
                                    },
                                },
                            ],
                            { cancelable: true }
                        );
                    }}
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
                            Trạng thái: {item.status}
                        </Text>
                        <Text style={styles.groupOrderInfo}>
                            Vai trò: <Text style={styles.boldText}>{item.isLeader ? 'Trưởng nhóm' : 'Thành viên'}</Text>
                        </Text>
                        <Text style={styles.groupOrderInfo}>
                            Ngày tham gia: {new Date(item.dateCreated).toLocaleString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <View style={styles.container}>
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
                <EmptyListAnimation title="Bạn chưa tham gia nhóm nào đang hoạt động." />
            ) : (
                <FlatList
                    data={groupOrders}
                    keyExtractor={(item) => item.groupOrderId.toString()}
                    renderItem={renderGroupOrder}
                    ListEmptyComponent={<EmptyListAnimation title="Không có nhóm nào!" />}
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
    groupOrderInfo: { fontSize: 15, color: '#555', marginBottom: 6 },
    boldText: { fontWeight: '600', color: '#222' },
    groupHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    groupNameText: { fontSize: 18, fontWeight: '600', color: '#333', marginRight: 8 },
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
