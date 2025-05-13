import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ImageBackground,
    ScrollView, Modal, Pressable
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
import Clipboard from '@react-native-clipboard/clipboard';

type NavigationProp = StackNavigationProp<RootStackParamList, 'GroupOrder'>;

const GroupOrder: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentOption, setPaymentOption] = useState('Bạn thanh toán cho mọi người');
    const [showCopiedModal, setShowCopiedModal] = useState(false);

    const groupCartData = useCartStore(state => state.groupCartData);

    const inviteCode = groupCartData?.crudGroupOrderResponse?.code ?? '';

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) setSelectedTime(selectedDate);
    };

    const formatTime = (date: Date | null): string => {
        if (!date) return 'Không đặt thời hạn';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleInvite = () => {
        Clipboard.setString(inviteCode);
        setShowCopiedModal(true);

        setTimeout(() => {
            setShowCopiedModal(false);
            navigation.navigate('Main');
        }, 2500);
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
                        <Text style={styles.discountTitle}>Được giảm giá đến 10%, không cần mức chi tiêu tối thiểu!</Text>
                        <Text style={styles.discountSubtitle}>Mời thêm thành viên để hưởng mức giảm giá hấp dẫn hơn.</Text>
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

                {/* Info block */}
                <View style={styles.infoBlock}>
                    <View style={styles.infoLayout}>
                        <View style={styles.infoIcon}><Icon name="home" size={24} color="#FF9800" /></View>
                        <View style={styles.infoSubTitle}><Text style={styles.label}>HMDRINKS - Số 1 Võ Văn Ngân</Text></View>
                    </View>

                    <View style={styles.infoLayout}>
                        <View style={styles.infoIcon}><Icon name="group" size={24} color="#FF9800" /></View>
                        <View style={styles.infoSubTitle}>
                            <Text style={styles.label}>Tên nhóm</Text>
                            <Text style={styles.value}>
                                {groupCartData?.crudGroupOrderResponse?.nameGroup || 'Tên nhóm chưa có'}
                            </Text>
                        </View>
                        <View style={styles.infoEditIcon}><Icon name="edit" size={24} color="black" /></View>
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

                {/* Mời thêm thành viên */}
                <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
                    <Text style={styles.inviteButtonText}>Mời thêm thành viên</Text>
                </TouchableOpacity>

                {/* Modal: Hạn thêm món */}
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

                {/* Modal: Hình thức thanh toán */}
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

                {/* Modal: Đã sao chép mã */}
                <Modal visible={showCopiedModal} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.modalContent, { alignItems: 'center' }]}>
                            <Text style={styles.modalText}>✅ Đã sao chép mã: {inviteCode}</Text>
                            <Text style={[styles.modalText, { fontSize: 12, marginTop: 6 }]}>
                                Gửi mã này mời bạn bè tham gia nhé!
                            </Text>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

export default GroupOrder;
