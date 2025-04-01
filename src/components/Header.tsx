import React, { useState, useEffect, useRef } from "react";
import { TouchableOpacity, View, Text, Image } from 'react-native';
import homeStyles from '../styles/home';
import { COLORS } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/store';
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';
import useWebSocket from '../utils/Socket';

interface Notification {
    id: string;
    message: string;
    time: string;
    isRead: boolean;
    shipmentId: number;
    total: number;
}
const Header = ({ style }: { style?: object }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();    
    const { cartTotal } = useCartStore();
    const { userId } = useCategoryStore();
    const socketNotifications = useWebSocket(userId ?? 0);
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    const fetchNotifications = async () => {
        if (!userId) return;
        const token = await AsyncStorage.getItem('access_token');
        try {
            const response = await axiosInstance.get(`/notifications/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            });
            const data: Notification[] = response.data.body?.notifications;
            setNotifications(data);
            setUnreadCount(data?.filter((noti) => !noti.isRead).length);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thông báo:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId, socketNotifications]);

    useEffect(() => {
        if (socketNotifications) {
            fetchNotifications();
        }
    }, [socketNotifications]);
    return (
        <View style={[homeStyles.header, style]}>
            <View style={homeStyles.logoContainer}>
                <Image source={require('../assets/app_images/logomini.png')} style={homeStyles.logo} />
                <Text style={homeStyles.greeting}>{t('common.greet') ?? 'Hello'}</Text>
            </View>

            <View style={homeStyles.headerIcons}>
                <TouchableOpacity style={homeStyles.iconButton} onPress={() => {
                    // ✅ Hủy chọn khi chuyển trang
                    navigation.navigate('Cart');
                }}>
                    <Icon name="shopping-cart" size={20} color={COLORS.primaryGreenHex} />
                    <Text style={homeStyles.iconText}>{cartTotal}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={homeStyles.iconButton}
                    onPress={() => navigation.navigate("Notification", { userId: userId ?? 0 })}
                >
                    <Icon name="notifications" size={20} color={COLORS.blackAlpha} />

                    {/* Hiển thị số lượng thông báo chưa đọc nếu có, ngược lại chỉ hiển thị icon chuông */}
                    {unreadCount > 0 && (
                        <View style={homeStyles.notificationCount}>
                            <Text style={homeStyles.notificationText}>{unreadCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default Header;
