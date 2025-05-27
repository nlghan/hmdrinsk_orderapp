import React, { useEffect, useState } from 'react';
import {
    View, Text, ImageBackground, TouchableOpacity,
    ScrollView, StyleSheet, Modal, Pressable, Image,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/groupOrderDetail';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import Header from '../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/store';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationPopup from '../components/NotificationPopup';
import { TextInput } from 'react-native'; // mới thêm
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Swipeable } from 'react-native-gesture-handler';
import { FONTFAMILY } from '../theme/theme';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { useAlertStore } from '../store/alertStore';
import DotLoading from '../components/DotLoading';
import DotLoadingMini from '../components/DotLoadingMini';


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
    link: string
}
const GroupOrderDetail = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { groupCartData, fetchCartItem, checkGroupCart, groupOrderCount } = useCartStore();
    const setGroupOrderCount = useCartStore((state) => state.setGroupOrderCount);

    const groupInfo = groupCartData?.crudGroupOrderResponse;
    const members = groupCartData?.crudGroupOrderResponseList || [];
    const { userId } = useCategoryStore();
    const rawUserId = useCategoryStore.getState().userId;

    const currentMember = members.find(member => member.userId === userId);
    const isLeader = currentMember?.isLeader;


    const formatPrice = (price: number) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);

    const onTimeChange = (event: any, selectedDate?: Date | undefined) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setSelectedTime(selectedDate);
        }
    };

    const handleKickMember = async (member: any) => {
        const { groupOrderId } = groupInfo || {};
        const leaderId = userId;
        const memberId = member.userId;
        const token = await AsyncStorage.getItem('access_token');

        if (!groupOrderId || !leaderId || !memberId || !token) {
            useAlertStore.getState().showAlert(
                t('common.error'),
                t('android.group.missingInfoToKick')
            );
            return;
        }

        useAlertStore.getState().showAlert(
            t('android.mess.title9'),
            t('android.mess.check10', { name: member.name }),
            () => {
                void handleDeleteAndAskBlock(memberId, leaderId, groupOrderId, token, member.name);
            },
            () => { }
        );
    };

    // Hàm xử lý xóa rồi hỏi chặn
    const handleDeleteAndAskBlock = async (
        memberId: number,
        leaderId: number,
        groupOrderId: number,
        token: string,
        memberName: string
    ) => {
        try {
            // Gọi API xóa thành viên
            await axiosInstance.delete(
                `/group-order/delete-member/${groupOrderId}/${leaderId}/${memberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Hỏi có muốn chặn thành viên sau khi xoá
            useAlertStore.getState().showAlert(
                t('common.confirm'),
                t('android.group.askBlockMember', { name: memberName }),
                () => {
                    void handleBlacklistMember(memberId, leaderId, groupOrderId, token);
                },
                () => { } // Không làm gì nếu hủy
            );

            fetchGroupOrders();
        } catch (error) {
            console.error('Lỗi khi xoá thành viên:', error);
            useAlertStore.getState().showAlert(
                t('common.error'),
                t('android.group.kickFailed')
            );
        }
    };

    // Hàm xử lý chặn thành viên
    const handleBlacklistMember = async (
        memberId: number,
        leaderId: number,
        groupOrderId: number,
        token: string
    ) => {
        try {
            await axiosInstance.put(
                `/group-order/activate-blacklist`,
                {
                    groupOrderId,
                    leaderId,
                    userId: memberId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            useAlertStore.getState().showAlert(
                t('common.noti'),
                t('android.group.blacklistActivated')
            );

            fetchGroupOrders();
        } catch (error) {
            console.error('Lỗi khi chặn thành viên:', error);
            useAlertStore.getState().showAlert(
                t('common.error'),
                t('android.group.blockFailed')
            );
        }
    };




    const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const fetchGroupOrders = async () => {
        const accessToken = await AsyncStorage.getItem('access_token');
        const userId = typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : Number(rawUserId);
        if (isNaN(userId)) return;

        try {
            const res = await axiosInstance.get(`/group-order/get-group-activate/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setGroupOrders(res.data.list);

            // Quan trọng: fetch lại cart sau khi cập nhật nhóm

            fetchCartItem();
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhóm:', error);
        }
    };

    // Gọi một lần khi load màn hình
    useEffect(() => {
        fetchGroupOrders();
    }, []);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [newQuantity, setNewQuantity] = useState<string>('1');
    const [newSize, setNewSize] = useState<string>('');

    const quantityInputRef = React.useRef<TextInput>(null); // Khai báo ref cho TextInput số lượng
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const handleEditItem = (item: any, userIdMember: number) => {
        setEditItem({
            ...item,
            memberUserId: userIdMember, // override userId để sau xác định người sở hữu món
        });
        setNewQuantity(item.quantity.toString());
        setNewSize(item.size);
        setEditModalVisible(true);
    };


    const handleSaveEdit = async () => {
        setIsLoading(true);
        setIsFocused(false);
        if (!editItem) return;

        const token = await AsyncStorage.getItem('access_token');

        if (!newSize || !newQuantity) {
            Alert.alert('Lỗi', 'Vui lòng chọn size và nhập số lượng.');
            return;
        }

        const quantityNumber = parseInt(newQuantity, 10);
        if (isNaN(quantityNumber) || quantityNumber <= 0) {
            Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0.');
            setIsFocused(true);
            return;
        }

        const isEditingOwnItem = editItem.userId === userId;

        try {
            if (isLeader && !isEditingOwnItem) {
                const changeSizePayload = {
                    groupOrderId: groupInfo?.groupOrderId,
                    userIdMember: editItem.memberUserId,
                    userIdLeader: userId,
                    cartItemId: editItem.cartItemGroupId,
                    size: newSize,
                };

                console.log('Calling leader/change-size with payload:', changeSizePayload);

                const sizeRes = await axiosInstance.put(
                    '/cart-item/group-order/leader/change-size',
                    changeSizePayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Response from leader/change-size:', sizeRes.data);

                const updateQuantityPayload = {
                    groupOrderId: groupInfo?.groupOrderId,
                    userIdMember: editItem.memberUserId,
                    userIdLeader: userId,
                    cartItemId: editItem.cartItemGroupId,
                    quantity: quantityNumber,
                };

                console.log('Calling leader/update with payload:', updateQuantityPayload);

                const quantityRes = await axiosInstance.put(
                    '/cart-item/group-order/leader/update',
                    updateQuantityPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Response from leader/update:', quantityRes.data);
            } else {
                const changeSizePayload = {
                    userId: userId,
                    cartItemId: editItem.cartItemGroupId,
                    size: newSize,
                };

                console.log('Calling change-size with payload:', changeSizePayload);

                const sizeRes = await axiosInstance.put(
                    '/cart-item/group-order/change-size',
                    changeSizePayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Response from change-size:', sizeRes.data);

                const updateQuantityPayload = {
                    userId: userId,
                    cartItemId: editItem.cartItemGroupId,
                    quantity: quantityNumber,
                };

                console.log('Calling update with payload:', updateQuantityPayload);

                const quantityRes = await axiosInstance.put(
                    '/cart-item/group-order/update',
                    updateQuantityPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                console.log('Response from update:', quantityRes.data);
            }

            setEditModalVisible(false);
            setEditItem(null);
            fetchCartItem();
        } catch (error: any) {
            console.error('API Error:', error);

            const responseData = error?.response?.data;

            if (typeof responseData === 'string' && responseData === 'Quantity is greater than stock') {
                Alert.alert('Hết hàng', 'Số lượng vượt quá tồn kho. Vui lòng nhập lại.');
                quantityInputRef.current?.focus();
                return;
            }

            Alert.alert('Hết hàng', `Hết sản phẩm kích thước này. Vui lòng chọn lại`);
        } finally {
            setIsLoading(false);
        }
    };



    const [open, setOpen] = useState(false);
    const [sizeOptions, setSizeOptions] = useState([
        { label: 'Size S', value: 'S' },
        { label: 'Size M', value: 'M' },
        { label: 'Size L', value: 'L' },
    ]);

    const handleDeleteItem = async (item: any) => {
        try {
            const token = await AsyncStorage.getItem('access_token');

            await axiosInstance.delete(
                `/cart-item/group-order/delete/${item.cartItemGroupId}`, // cartItemGroupId trong URL
                {
                    data: {
                        userId: userId,
                        cartItemId: item.cartItemGroupId, // vẫn gửi trong body
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            fetchCartItem?.(); // Cập nhật lại danh sách sau khi xóa
            console.log('✅ Đã xóa sản phẩm');
        } catch (error) {
            console.log('❌ Lỗi xóa món:', error);
            Alert.alert('Lỗi', 'Không thể xóa món. Vui lòng thử lại.');
        }
    };

    const handleDeleteAllItemsOfMember = async (member: any) => {
        try {
            const token = await AsyncStorage.getItem('access_token');

            const isSelf = member.userId === userId;

            if (!member.crudCartGroupResponse?.cartGroupId) {
                Alert.alert('Lỗi', 'Không tìm thấy giỏ hàng của thành viên.');
                return;
            }

            const cartId = member.crudCartGroupResponse.cartGroupId;

            if (isLeader && !isSelf) {
                // 🧑‍✈️ Leader xóa món của người khác
                await axiosInstance.delete(
                    `/cart/group-order/leader/delete-allItem/${member.userId}`,
                    {
                        data: {
                            groupOrderId: member.groupOrderId,
                            userIdMember: member.userId,
                            userIdLeader: userId,
                            cartId: cartId,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } else {
                // 👤 Người thường xóa món của chính mình
                await axiosInstance.delete(
                    `/cart/group-order/delete-allItem/${userId}`,
                    {
                        data: {
                            userId: userId,
                            cartId: cartId,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            fetchCartItem?.();
            console.log('✅ Đã xóa toàn bộ món');
        } catch (error) {
            console.log('❌ Lỗi khi xóa toàn bộ món:', error);
            Alert.alert('Lỗi', 'Không thể xóa món. Vui lòng thử lại.');
        }
    };




    const renderRightActions = (item: any) => (
        <TouchableOpacity
            style={{
                backgroundColor: 'transparent',

                justifyContent: 'center',
                alignItems: 'center',
                width: 64,
                height: '100%',
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
            }}
            onPress={() => handleDeleteItem(item)} // Xử lý xóa ở đây
        >
            <Icon name="delete" size={20} color="black" />
        </TouchableOpacity>
    );

    const [showCopiedModal, setShowCopiedModal] = useState(false);
    const link = groupCartData?.crudGroupOrderResponse?.link ?? '';

    const handleInvite = () => {
        Clipboard.setString(link);
        setShowCopiedModal(true);

        setTimeout(() => {
            setShowCopiedModal(false);

        }, 2500);
    };



    return (
        <>
            <Header
                style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    marginBottom: 3,
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                }}
            />
            {isLoading && (
                <Modal
                    visible={true}
                    transparent={true}
                    animationType="none"
                    onRequestClose={() => { }}
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // zIndex và elevation có thể không cần thiết trong Modal, nhưng thêm cũng không sao
                        zIndex: 99999,
                        elevation: 99999,
                    }}>
                        <DotLoadingMini title={''} />
                    </View>
                </Modal>
            )}


            <NotificationPopup userId={userId ?? 0} />
            <ScrollView contentContainerStyle={styles.container}>
                <ImageBackground
                    source={require('../assets/app_images/group.jpeg')}
                    style={styles.banner}
                    resizeMode="stretch"
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>

                    {isLeader &&
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate('BlackList', {
                                    groupOrderId: groupCartData!.crudGroupOrderResponse.groupOrderId!,
                                })

                            }
                            style={styles.backButton1}
                        >
                            <Icon name="menu" size={24} color="black" />
                        </TouchableOpacity>}


                </ImageBackground>

                <Modal visible={showOptionModal} transparent animationType="fade" onRequestClose={() => setShowOptionModal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Pressable style={styles.modalOption} onPress={() => { setSelectedTime(null); setShowOptionModal(false); }}>
                                <Text style={styles.modalText}>Không giới hạn</Text>
                            </Pressable>
                            <Pressable style={styles.modalOption} onPress={() => { setShowOptionModal(false); setShowTimePicker(true); }}>
                                <Text style={styles.modalText}>Chọn thời gian hết hạn</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {showTimePicker && (
                    <DateTimePicker
                        value={selectedTime || new Date()}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

                {/* 2 ô lựa chọn */}
                <View style={styles.optionRow}>
                    <TouchableOpacity style={styles.optionBox} onPress={() => setShowOptionModal(true)} activeOpacity={0.7}>
                        <Icon name="access-time" size={20} color="black" />
                        <Text style={styles.optionText}>
                            {selectedTime ? selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('android.anytime')}
                        </Text>
                        <Icon name="edit" size={20} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionBox} onPress={handleInvite} >
                        <Icon name="group" size={20} color="black" />
                        <Text style={styles.optionText}>{members.length}</Text>
                        <Icon name="add" size={20} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Thông báo chưa thêm món */}
                <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>
                        {t('android.groupOrderNote.notice_pending_members', { count: members.length })}
                    </Text>

                    <Text style={styles.noticeSubText}>
                        {t('android.groupOrderNote.notice_discount_unlock')} <Text style={{ color: '#FF5722' }}>{t('android.groupOrderNote.notice_discount_unlock2', { discount: '2%' })}</Text>
                    </Text>
                </View>

                {/* Chi tiết */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('detail')}</Text>
                    <View style={styles.detailRow}>

                        <TouchableOpacity
                            style={styles.detailRow1}
                            onPress={() => {
                                if (isLeader) {
                                    const groupOrderId = groupCartData?.crudGroupOrderResponse.groupOrderId;
                                    const currentAddress = groupCartData?.crudGroupOrderResponse.address || '';

                                    if (groupOrderId !== undefined) {
                                        navigation.navigate('EditGroupAddress', {
                                            groupOrderId,
                                            currentAddress,
                                        });
                                    } else {
                                        Alert.alert('Lỗi', 'Không tìm thấy mã nhóm');
                                    }
                                }
                            }}
                        >

                            <View style={styles.detailRows}>
                                <Icon name="pin-drop" size={20} color="green" />
                                <Text style={styles.detailText}>
                                    {groupCartData?.crudGroupOrderResponse.address?.trim()
                                        ? groupCartData.crudGroupOrderResponse.address
                                        : t('android.noAddress')}
                                </Text>
                                <Icon name="chevron-right" size={20} />
                            </View>


                        </TouchableOpacity>
                        <TouchableOpacity style={styles.detailRow1} >
                            <View style={styles.detailRows}>
                                <Icon name="receipt" size={20} color="black" />
                                <Text style={styles.detailText}>{t('android.leader_pays')}</Text>
                                <Icon name="chevron-right" size={20} />
                            </View>

                        </TouchableOpacity>



                    </View>
                </View>

                {/* Danh sách thành viên */}
                <View style={styles.section}>
                    <View style={styles.subSection}>
                        <Text style={styles.sectionTitle}>{t('android.status_label.member')}</Text>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('Order', {
                                state: { cateId: 0 } // Truyền cateId qua state
                            }
                            )
                        }}>
                            <Text style={styles.sectionTitle1}>{t('android.add')}</Text>
                        </TouchableOpacity>

                    </View>

                    {members.map((member, index) => {
                        const hasItems = member.crudCartGroupResponse?.listCartItemGroup?.length > 0;

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.memberCard,
                                    {
                                        marginBottom: 12,
                                        padding: 12,
                                        backgroundColor: '#fff',
                                        borderRadius: 8,
                                    },
                                ]}
                            >
                                <View style={styles.subUser}>
                                    <Text style={[styles.boldText, { marginBottom: 4 }]}>
                                        {member.name}{member.isLeader ? ` (${t('android.status_label.leader')})` : ''}
                                    </Text>

                                    {hasItems &&
                                        ((isLeader && member.userId !== userId) || member.userId === userId) && (
                                            <TouchableOpacity onPress={() => handleDeleteAllItemsOfMember(member)}>
                                                <Icon name="clear" size={20} color="red" />
                                            </TouchableOpacity>
                                        )}
                                </View>

                                {hasItems ? (
                                    member.crudCartGroupResponse.listCartItemGroup.map((item, idx) => (
                                        <Swipeable
                                            key={idx}
                                            renderRightActions={() =>
                                                (isLeader || member.userId === userId) ? renderRightActions(item) : null
                                            }
                                        >
                                            <View style={styles.orderItem}>
                                                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                                                <Text style={styles.itemText}>
                                                    {item.quantity}x {item.proName} ({item.size})
                                                </Text>
                                                <View style={styles.priceContainer}>
                                                    <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}đ</Text>
                                                </View>

                                                {(isLeader || member.userId === userId) && (
                                                    <TouchableOpacity
                                                        onPress={() => handleEditItem(item, member.userId)}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        <Icon name="edit" size={20} color="#1976D2" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </Swipeable>
                                    ))
                                ) : (
                                    <Text style={{ color: '#666', marginBottom: 4 }}>{t('android.no_items_added')}</Text>
                                )}

                                {isLeader && member.userId !== userId && (
                                    <TouchableOpacity
                                        onPress={() => handleKickMember(member)}
                                        style={{ alignSelf: 'center', marginTop: 6, width: '100%' }}
                                    >
                                        <Text style={{
                                            color: 'red', fontSize: 22,
                                            fontFamily: FONTFAMILY.dongle_bold, textAlign: 'center'
                                        }}>{t('android.deleteBtn')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>


                {/* Tổng cộng */}
                <View style={styles.totalRow}>
                    <Text style={styles.price}>{t('products.subTotal')}</Text>
                    <Text style={styles.price}>{formatPrice(groupInfo?.totalPrice || 0)}đ</Text>
                </View>
                <TouchableOpacity
                    style={styles.nextButton1}
                    onPress={() => {
                        if (isLeader) {
                            Alert.alert(
                                'Xác nhận xoá nhóm',
                                'Bạn có chắc muốn xoá đơn hàng nhóm này không?',
                                [
                                    { text: 'Hủy', style: 'cancel' },
                                    {
                                        text: 'Xoá nhóm',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                const token = await AsyncStorage.getItem('access_token');
                                                const groupOrderId = groupInfo?.groupOrderId;

                                                await axiosInstance.delete(
                                                    `/group-order/delete/${groupOrderId}/${userId}`,
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );

                                                Alert.alert('Thành công', 'Nhóm đã được xoá');
                                                navigation.navigate('GroupOrderList');
                                            } catch (err) {
                                                console.error('Lỗi khi xoá nhóm:', err);
                                            }
                                        },
                                    },
                                ],
                                { cancelable: true }
                            );
                            console.log('Xóa đơn hàng nhóm');
                        } else {
                            // TODO: Gọi API rời khỏi nhóm
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
                                                    `/group-order/leave/${groupInfo?.groupOrderId}/${userId}`,
                                                    {},
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );

                                                fetchGroupOrders();
                                                setGroupOrderCount(Math.max(0, groupOrderCount - 1));
                                                navigation.navigate('GroupOrderList');
                                            } catch (err) {
                                                console.error('Lỗi khi rời nhóm:', err);
                                            }
                                        },
                                    },
                                ],
                                { cancelable: true }
                            );
                            console.log('Rời khỏi đơn hàng nhóm');

                        }
                    }}
                >
                    <Text style={[styles.nextText1, isLeader && { color: 'red' }]}>
                        {isLeader ? t('android.delete_group_order') : t('android.leave_group_order')}
                    </Text>
                </TouchableOpacity>




            </ScrollView>
            {isLeader && groupCartData?.crudGroupOrderResponse.totalPrice != 0 &&
                <View style={styles.actions} >
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={() => {
                            const address = groupCartData?.crudGroupOrderResponse.address || '';
                            const groupOrderId = groupCartData?.crudGroupOrderResponse.groupOrderId ?? 0;

                            if (!address.trim()) {
                                Alert.alert('❗ Thiếu địa chỉ', 'Vui lòng cập nhật địa chỉ giao hàng trước khi tiếp tục.');
                                return;
                            }

                            const hasEmptyMember = members.some(
                                member => !member.crudCartGroupResponse?.listCartItemGroup?.length
                            );

                            if (hasEmptyMember) {
                                Alert.alert(
                                    'Thành viên chưa đặt món',
                                    'Một số thành viên chưa thêm đồ uống. Bạn có muốn tiếp tục thanh toán không?',
                                    [
                                        { text: 'Huỷ', style: 'cancel' },
                                        {
                                            text: 'Tiếp tục',
                                            style: 'default',
                                            onPress: () => {
                                                navigation.navigate('Preview', {
                                                    groupOrderId,
                                                    currentAddress: address,
                                                });
                                            },
                                        },
                                    ],
                                    { cancelable: true }
                                );
                            } else {
                                navigation.navigate('Preview', {
                                    groupOrderId,
                                    currentAddress: address,
                                });
                            }
                        }}
                    >
                        <Text style={styles.nextText}>{t('android.next')}</Text>
                    </TouchableOpacity>




                </View>}


            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: '85%',
                        backgroundColor: '#FFF6EE', //  Trắng ngả cam
                        padding: 20,
                        borderRadius: 12,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 8, // Bóng đổ cho Android
                    }}>
                        <Text style={{
                            fontSize: 22,
                            fontFamily: FONTFAMILY.lobster_regular,
                            color: '#FF7F3F',
                            textAlign: 'center',
                        }}>
                            {t('android.editProduct')}
                        </Text>

                        <Text style={{
                            fontSize: 24,
                            fontFamily: FONTFAMILY.dongle_regular,
                        }}>{t('quantity')}</Text>
                        <TextInput
                            ref={quantityInputRef}  // Gắn ref vào TextInput
                            style={{
                                marginBottom: 12,
                                marginVertical: 6,
                                width: '100%',
                                borderWidth: 1.5,
                                borderColor: isFocused ? '#FFB482' : '#FFB482',
                                borderRadius: 12,
                                padding: 12,
                                backgroundColor: '#FFF1E8',
                                color: '#333',
                                fontSize: 28,
                                lineHeight: 20,
                                fontFamily: FONTFAMILY.dongle_regular

                            }}
                            keyboardType="numeric"
                            value={newQuantity}
                            onChangeText={setNewQuantity}
                            onFocus={() => setIsFocused(true)}  // Khi focus
                            onBlur={() => setIsFocused(false)}  // Khi mất focus
                        />


                        <Text style={{
                            marginBottom: 4, fontSize: 24,
                            fontFamily: FONTFAMILY.dongle_regular,
                        }}>{t('size')}</Text>
                        <DropDownPicker
                            open={open}
                            value={newSize}
                            items={sizeOptions}
                            setOpen={setOpen}
                            setValue={setNewSize}
                            setItems={setSizeOptions}
                            placeholder={t('chooseSize')}
                            placeholderStyle={{
                                color: '#999',
                                fontFamily: FONTFAMILY.dongle_regular,
                                fontSize: 20,
                            }}
                            containerStyle={{ marginBottom: 20 }}
                            style={{
                                borderColor: '#FFB482',
                                backgroundColor: 'rgba(255, 232, 218, 0.87)',
                                borderRadius: 12,
                                borderWidth: 1.5,

                            }}
                            dropDownContainerStyle={{
                                padding: 12,
                                marginVertical: 6,
                                backgroundColor: 'rgb(255, 232, 218)', //  Cam nhạt đẹp mắt
                                borderRadius: 12,
                                borderWidth: 1.5,
                                width: '100%',
                                borderColor: '#FFB482',
                            }}
                        />


                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingVertical: 10,

                        }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#FFE1D0',
                                    padding: 10,
                                    flex: 1,
                                    marginRight: 8,
                                    borderRadius: 12,
                                }}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={{
                                    color: '#333',
                                    fontFamily: FONTFAMILY.dongle_regular,
                                    fontSize: 24,
                                    lineHeight: 21,
                                    textAlign: 'center'
                                }}>{t('order.orderDetail.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#FF8C42',
                                    padding: 10,
                                    borderRadius: 12,
                                    flex: 1,

                                }}
                                onPress={handleSaveEdit}
                            >
                                <Text style={{
                                    color: '#fff',
                                    fontFamily: FONTFAMILY.dongle_regular,
                                    fontSize: 24,
                                    lineHeight: 21,
                                    textAlign: 'center'
                                }}>{t('android.saveBtn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal: Đã sao chép mã */}
            <Modal visible={showCopiedModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContent, { alignItems: 'center' }]}>
                        <Text style={styles.modalText}>{t('android.link_copied')} {link}</Text>
                        <Text style={[styles.modalText, { fontSize: 12, marginTop: 6 }]}>
                            {t('android.share_invite_tip')}
                        </Text>
                    </View>
                </View>
            </Modal>


        </>
    );
};

export default GroupOrderDetail;
