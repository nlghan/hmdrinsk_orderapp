import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image, Alert } from 'react-native';
import homeStyles from '../styles/home';
import { COLORS } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/store';
import useWebSocket from '../utils/Socket';
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const { userId } = useCategoryStore();
    const socketNotifications = useWebSocket(userId ?? 0);
    const { t } = useTranslation();

    const hasGroupCart = useCartStore((state) => state.hasGroupCart);
    const hasRejectedGroupCart = useCartStore((state) => state.hasRejectedGroupCart);
    const cartTotal = useCartStore((state) => state.cartTotal);
    const groupOrderCount = useCartStore((state) => state.groupOrderCount);
    const groupCartId = useCartStore((state) => state.groupCartId);
    const setHasRejectedGroupCart = useCartStore((state) => state.setHasRejectedGroupCart);
    const checkGroupCart = useCartStore((state) => state.checkGroupCart);
    const ensureActiveCart = useCartStore((state) => state.ensureActiveCart);

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

    const handleCartPress = async () => {
        if (groupCartId && !hasRejectedGroupCart) {
            Alert.alert(
                "Thông báo",
                "Bạn sẽ chuyển sang giỏ hàng cá nhân. Có muốn tiếp tục không?",
                [
                    { text: "Không", style: "cancel" },
                    {
                        text: "Có",
                        onPress: async () => {
                            await ensureActiveCart();
                            setHasRejectedGroupCart(true);
                            navigation.navigate('Cart');
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            navigation.navigate('Cart');
        }
    };

    return (
        <View style={[homeStyles.header, style]}>
            <View style={homeStyles.logoContainer}>
                <Image source={require('../assets/app_images/logomini.png')} style={homeStyles.logo} />
                <Text style={homeStyles.greeting}>{t('common.greet') ?? 'Hello'}</Text>
            </View>

            <View style={homeStyles.headerIcons}>
                <TouchableOpacity
                    style={[
                        homeStyles.iconButton,
                        (!hasGroupCart || hasRejectedGroupCart) && { backgroundColor: '#e8e8e8c9' }
                    ]}
                    onPress={async () => {
                        if (!hasGroupCart || hasRejectedGroupCart) {
                            setHasRejectedGroupCart(false);
                            await checkGroupCart();
                            navigation.navigate("GroupOrderList");
                        } else {
                            navigation.navigate("GroupOrderList");
                        }
                    }}
                >
                    <Icon
                        name="groups"
                        size={15}
                        color={(hasGroupCart && !hasRejectedGroupCart) ? COLORS.primaryGreenHex : 'gray'}
                    />
                    <View style={homeStyles.notificationCount}>
                        <Text style={homeStyles.notificationText}>{groupOrderCount}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        homeStyles.iconButton,
                        (hasGroupCart && !hasRejectedGroupCart) && { backgroundColor: '#e8e8e8c9' }
                    ]}
                    onPress={handleCartPress}
                >
                    <Icon
                        name="shopping-cart"
                        size={15}
                        color={(hasGroupCart && !hasRejectedGroupCart) ? 'gray' : COLORS.primaryGreenHex}
                    />
                    <View style={homeStyles.notificationCount}>
                        <Text style={homeStyles.notificationText}>{cartTotal}</Text>
                    </View>
                </TouchableOpacity>


                <TouchableOpacity
                    style={homeStyles.iconButton}
                    onPress={() => navigation.navigate("Notification", { userId: userId ?? 0 })}
                >
                    <Icon name="notifications" size={15} color={COLORS.blackAlpha} />
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
