import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import useWebSocket from '../utils/Socket';
import { useTranslation } from 'react-i18next';
import { useCountStore } from '../store/countStore';
import { useCategoryStore } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

type NotificationWS = {
    userId: number;
   shipmentId?: number | undefined;
    groupOrderId?: number;
    message: string;
    time: string;
    type?: string;
    id: number;
};

interface NotificationPopupProps {
    userId: number;
}

const getTranslatedMessage = (message: string, language: string) => {
    if (language !== 'EN') return message;

    const prefix1 = 'Leader đã cập nhật địa chỉ giao hàng nhóm thành: ';
    if (message.startsWith(prefix1)) {
        const address = message.slice(prefix1.length);
        return `Leader has updated the group shipping address to: ${address}`;
    }

    const suffix2 = ' đã rời nhóm đặt hàng';
    if (message.endsWith(suffix2)) {
        const name = message.slice(0, -suffix2.length);
        return `${name} has left the order group`;
    }

    const prefix3 = 'Bạn không còn là thành viên của nhóm ';
    if (message.startsWith(prefix3)) {
        const groupName = message.slice(prefix3.length);
        return `You are no longer a member of group ${groupName}`;
    }

    const suffix4 = ' đã tham gia nhóm đặt hàng';
    if (message.endsWith(suffix4)) {
        const name = message.slice(0, -suffix4.length);
        return `${name} has joined the order group`;
    }

    if (message === 'Đơn hàng của bạn đã được giao thành công') {
        return 'Your order has been delivered successfully';
    }

    if (message === 'Đơn hàng của bạn đã bị hủy') {
        return 'Your order has been canceled';
    }

    if (message === 'Tài khoản của bạn đã đăng nhập ở nơi khác') {
        return 'Your account has been logged in from another device';
    }

    return message;
};

const NotificationPopup: React.FC<NotificationPopupProps> = ({ userId }) => {
  
    const socketNotifications = useWebSocket(userId);
    const { setSocketNotifications, triggerRefresh } = useCountStore();
    const [notifications, setNotifications] = useState<NotificationWS[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const { t } = useTranslation();
    const { language, logout } = useCategoryStore();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const isModalOpen = useRef(false);
    const lastNotificationTime = useRef<number | null>(null);

    useEffect(() => {
        if (socketNotifications.length === 0) return;

        const newNotification = socketNotifications[socketNotifications.length - 1];

        if (
            newNotification &&
            !notifications.some(noti => noti.id === newNotification.id)
        ) {
            const updatedNotifications = [...notifications, newNotification];
            setNotifications(updatedNotifications);
            setSocketNotifications(updatedNotifications);
            triggerRefresh();

            if (!isModalOpen.current) {
                setModalVisible(true);
                isModalOpen.current = true;
            }
        }
    }, [socketNotifications, setSocketNotifications]);


    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const closeModal = () => {
        setModalVisible(false);
        isModalOpen.current = false;

        const hasConflictLogin = notifications.some(
            n => n.message === 'Tài khoản của bạn đã đăng nhập ở nơi khác'
        );

        if (hasConflictLogin) {
            handleLogout();
        }
    };

    return (
        <View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{t('common.noti')}</Text>
                        <FlatList
                            data={notifications}
                           keyExtractor={(item, index) => (item?.id ? item.id.toString() : `notification-${index}`)}
                            renderItem={({ item }) => (
                                <View style={styles.notificationItem}>
                                    <Text style={styles.message}>
                                        {getTranslatedMessage(item.message, language)}
                                    </Text>
                                </View>
                            )}
                        />

                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.closeButtonText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 320,
        backgroundColor: '#FFF6EE',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E35D11',
        marginBottom: 10,
    },
    notificationItem: {
        padding: 12,
        marginVertical: 6,
        backgroundColor: 'rgba(255, 232, 218, 0.87)',
        borderRadius: 6,
        width: '100%',
    },
    message: {
        fontSize: 16,
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'right',
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: 'rgba(233, 102, 20, 0.87)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default NotificationPopup;