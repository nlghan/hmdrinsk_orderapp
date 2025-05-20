import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ImageBackground,
    ScrollView, Modal, Pressable, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../components/Header';
import styles from '../styles/groupOrder';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';
import EditGroupNameModal from '../components/EditGroupNameModal';
import { useCategoryStore } from '../store/store';
import { useTranslation } from 'react-i18next';
import { useAlertStore } from '../store/alertStore';

type NavigationProp = StackNavigationProp<RootStackParamList, 'GroupOrder'>;

const GroupOrder: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { t } = useTranslation();

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOption, setPaymentOption] = useState('Bạn thanh toán cho mọi người');
    const [showCopiedModal, setShowCopiedModal] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const { groupCartData, createGroupOrder } = useCartStore();
    const { userId } = useCategoryStore.getState();

    const [groupName, setGroupName] = useState('Nhóm mới');

    const inviteCode = groupCartData?.crudGroupOrderResponse?.code ?? '';
    const link = groupCartData?.crudGroupOrderResponse?.link ?? '';

    // Hàm tạo nhóm, dùng tên nhóm lưu trong state
    const createGroup = async () => {
        if (!userId) {
            console.log('không tìm thấy user')
            return;
        }

        try {
            const title = groupName || `Nhóm của ${userId} - ${new Date().toLocaleTimeString()}`;

            const flexiblePayment = paymentOption === 'Cá nhân tự thanh toán';
            const type = flexiblePayment ? 'PAY_FOR_ALL' : 'PAY_FOR_ALL';

            const datePayment = selectedTime
                ? {
                    hour: selectedTime.getHours(),
                    minute: selectedTime.getMinutes(),
                    second: selectedTime.getSeconds(),
                    nano: 0,
                }
                : null;

            // Thêm typeTime theo yêu cầu
            const groupOrderData = {
                userId,
                title,
                flexiblePayment,
                datePayment,
                type,
                typeTime,  // Truyền thêm typeTime
            };

            const success = await createGroupOrder(
                userId,
                title,
                flexiblePayment,
                datePayment,
                type,
                typeTime  // Bạn cần chỉnh hàm createGroupOrder nhận thêm param này
            );

            if (success) {
                navigation.navigate('GroupOrderList');
            } else {
                useAlertStore.getState().showAlert(
                    t('android.mes.title8'),
                    t('android.mess.error9'),
                    undefined, // Không cần xử lý khi bấm nút xác nhận
                    undefined, // Không có nút hủy

                );

            }
        } catch (error) {
            console.error('Tạo nhóm lỗi:', error);
            useAlertStore.getState().showAlert(
                t('android.mes.title8'),
                t('error'),
                undefined, // Không cần xử lý khi bấm nút xác nhận
                undefined, // Không có nút hủy

            );
        }
    };


    // Chỉ cập nhật state local, không gọi API
    const updateGroupName = (newName: string) => {
        setGroupName(newName);
        setIsEditModalVisible(false);
    };

    const [typeTime, setTypeTime] = useState<'TIME' | 'NO_TIME'>('NO_TIME');

    // Cập nhật hàm chọn thời gian
    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setSelectedTime(selectedDate);
            setTypeTime('TIME');  // Chọn thời gian -> typeTime = TIME
        }
    };

    // Khi người dùng chọn "Không giới hạn"
    const onSelectNoTime = () => {
        setSelectedTime(null);
        setTypeTime('NO_TIME'); // Không giới hạn -> NO_TIME
        setShowOptionModal(false);
    };
    const formatTime = (date: Date | null): string => {
        if (!date) return 'Không đặt thời hạn';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleInvite = () => {
        createGroup();
        // Phần copy link và modal sao chép đã tạm ẩn, có thể thêm lại nếu cần
    };

    return (
        <View style={styles.container}>
            <Header style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 3,
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ImageBackground source={require('../assets/app_images/group.jpeg')} style={styles.banner} resizeMode="cover">
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={COLORS.primaryGreenHex} />
                    </TouchableOpacity>

                    <View style={styles.card}>
                        <Text style={styles.discountTitle}>{t('android.groupOrderNote.discount_title')}</Text>
                        <Text style={styles.discountSubtitle}>{t('android.groupOrderNote.discount_subtitle')}</Text>
                        <View style={styles.discountSteps}>
                            {[
                                { percent: '2%', people: '2 người' },
                                { percent: '4%', people: '3 người' },
                                { percent: '6%', people: '5 người' },
                                { percent: '10%', people: '8 người' },
                            ].map((item, index) => (
                                <View key={index} style={styles.stepItem}>
                                    <View style={styles.circle} />
                                    <Text style={styles.stepPercent}>{item.percent}</Text>
                                    <Text style={styles.stepPeople}>{item.people}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ImageBackground>

                {/* Info */}
                <View style={styles.infoBlock}>
                    <View style={styles.infoLayout}>
                        <View style={styles.infoIcon}><Icon name="home" size={24} color="#FF9800" /></View>
                        <View style={styles.infoSubTitle}><Text style={styles.label}>HMDRINKS - Số 1 Võ Văn Ngân</Text></View>
                    </View>

                    <View style={styles.infoLayout}>
                        <View style={styles.infoIcon}><Icon name="group" size={24} color="#FF9800" /></View>
                        <View style={styles.infoSubTitle}>
                            <Text style={styles.label}>Tên nhóm</Text>
                            <Text style={styles.value}>{groupName || 'Chưa có tên nhóm'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.infoEditIcon}>
                            <Icon name="edit" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => setShowOptionModal(true)} activeOpacity={0.7}>
                        <View style={styles.infoLayout}>
                            <View style={styles.infoIcon}><Icon name="access-time" size={24} color="#FF9800" /></View>
                            <View style={styles.infoSubTitle}>
                                <Text style={styles.label}>Thời hạn thêm món</Text>
                                <Text style={styles.value}>
                                    {selectedTime
                                        ? formatTime(selectedTime)
                                        : groupCartData?.crudGroupOrderResponse?.deadlinePayment
                                            ? formatTime(new Date(groupCartData.crudGroupOrderResponse.deadlinePayment))
                                            : 'Không đặt thời hạn'}
                                </Text>
                            </View>
                            <View style={styles.infoEditIcon}><Icon name="edit" size={24} color="black" /></View>
                        </View>
                    </TouchableOpacity>

                    {showTimePicker && (
                        <DateTimePicker
                            value={selectedTime || new Date()}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onTimeChange}
                        />
                    )}

                    <View style={styles.infoLayout}>
                        <View style={styles.infoIcon}><Icon name="payment" size={24} color="#FF9800" /></View>
                        <View style={styles.infoSubTitle}>
                            <Text style={styles.label}>Thanh toán hoá đơn</Text>
                            <Text style={styles.value}>{paymentOption}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowPaymentModal(true)} style={styles.infoEditIcon}>
                            <Icon name="edit" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
                    <Text style={styles.inviteButtonText}>Tạo đơn nhóm</Text>
                </TouchableOpacity>

                {/* Modals */}
                <Modal visible={showOptionModal} transparent animationType="fade" onRequestClose={() => setShowOptionModal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Pressable style={styles.modalOption} onPress={onSelectNoTime}>
                                <Text style={styles.modalText}>Không giới hạn</Text>
                            </Pressable>
                            <Pressable style={styles.modalOption} onPress={() => { setShowOptionModal(false); setShowTimePicker(true); }}>
                                <Text style={styles.modalText}>Chọn thời gian hết hạn</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>


                <Modal visible={showPaymentModal} transparent animationType="fade" onRequestClose={() => setShowPaymentModal(false)}>
                    <View style={styles.modalBackdrop}>
                        <View style={styles.modalContent}>
                            <Pressable style={styles.modalOption} onPress={() => { setPaymentOption('Bạn thanh toán cho mọi người'); setShowPaymentModal(false); }}>
                                <Text style={styles.modalText}>Bạn thanh toán cho mọi người</Text>
                            </Pressable>
                            <Pressable style={styles.modalOption} onPress={() => { setPaymentOption('Cá nhân tự thanh toán'); setShowPaymentModal(false); }}>
                                <Text style={styles.modalText}>Cá nhân tự thanh toán</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                <Modal visible={showCopiedModal} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.modalContent, { alignItems: 'center' }]}>
                            <Text style={styles.modalText}>✅ Đã sao chép liên kết: {link}</Text>
                            <Text style={[styles.modalText, { fontSize: 12, marginTop: 6 }]}>
                                Gửi mã này mời bạn bè tham gia nhé!
                            </Text>
                        </View>
                    </View>
                </Modal>

                <EditGroupNameModal
                    visible={isEditModalVisible}
                    initialName={groupName}
                    onCancel={() => setIsEditModalVisible(false)}
                    onSave={updateGroupName}
                />
            </ScrollView>
        </View>
    );
};

export default GroupOrder;
