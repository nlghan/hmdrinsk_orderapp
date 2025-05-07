import React, { useState } from 'react';
import {
    View, Text, ImageBackground, TouchableOpacity,
    ScrollView, StyleSheet, Modal, Pressable, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/groupOrderDetail';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import Header from '../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCartStore } from '../store/useCartStore';

const GroupOrderDetail = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { groupCartData } = useCartStore();
    const groupInfo = groupCartData?.crudGroupOrderResponse;
    const members = groupCartData?.crudGroupOrderResponseList || [];

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
                            {selectedTime ? selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Bất cứ lúc'}
                        </Text>
                        <Icon name="edit" size={20} color="black" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionBox}>
                        <Icon name="group" size={20} color="black" />
                        <Text style={styles.optionText}>{members.length}</Text>
                        <Icon name="add" size={20} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Thông báo chưa thêm món */}
                <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>Còn {members.length} người chưa thêm món</Text>
                    <Text style={styles.noticeSubText}>
                        Sau khi họ thêm món, chúng tôi sẽ <Text style={{ color: '#FF5722' }}>mở khóa mức giảm giá 2%</Text>
                    </Text>
                </View>

                {/* Chi tiết */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết</Text>
                    <TouchableOpacity style={styles.detailRow}>
                        <Icon name="receipt" size={20} color="black" />
                        <Text style={styles.detailText}>Bạn thanh toán cho mọi người</Text>
                        <Icon name="chevron-right" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Danh sách thành viên */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thành viên</Text>
                    {members.map((member: {
                        name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; isLeader: any; crudCartGroupResponse: {
                            totalPrice: number; listCartItemGroup: any;
                        };
                    }, index: React.Key | null | undefined) => (
                        <View key={index} style={{ marginBottom: 12, }}>
                            <View  style={{ display:'flex', flexDirection:'row', justifyContent:'space-between' }}>
                                <Text style={styles.boldText}>
                                    {member.name} {member.isLeader && '(Trưởng nhóm)'}
                                </Text>
                                <Text style={styles.boldText}>
                                    {formatPrice(member.crudCartGroupResponse?.totalPrice || 0)}đ
                                </Text>

                            </View>



                            {(member.crudCartGroupResponse?.listCartItemGroup || []).map((item: { imageUrl: any; quantity: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; proName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; size: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; totalPrice: number; }, idx: React.Key | null | undefined) => (
                                <View key={idx} style={styles.orderItem}>
                                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                                    <Text style={styles.itemText}>
                                        {item.quantity}x {item.proName} ({item.size})
                                    </Text>
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}đ</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Tổng cộng */}
                <View style={styles.totalRow}>
                    <Text style={styles.sectionTitle}>Tổng tạm tính</Text>
                    <Text style={styles.price}>{formatPrice(groupInfo?.totalPrice || 0)}đ</Text>
                </View>

                <TouchableOpacity style={styles.nextButton}>
                    <Text style={styles.nextText}>Tiếp theo</Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
};

export default GroupOrderDetail;
