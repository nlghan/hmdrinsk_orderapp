import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from '../store/useCartStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

interface NotificationWS {
    userId: number;
    shipmentId?: number;       // Có thể undefined nếu là join-group
    groupOrderId?: number;     // Nếu là join-group
    message: string;
    time: string;
}

const useWebSocket = (userId: number) => {
    const [notifications, setNotifications] = useState<NotificationWS[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const { fetchCartItem, checkGroupCart } = useCartStore.getState();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        if (!userId || socketRef.current) return;
        console.log('🔗 Connecting WebSocket with userId:', userId);

        const connectWebSocket = async () => {
            try {
                if (socketRef.current) {
                    console.log('⚠️ Đóng kết nối cũ trước khi tạo mới');
                    socketRef.current.close();
                    socketRef.current = null;
                }

                const token = await AsyncStorage.getItem('access_token');
                if (!token) {
                    console.log('⚠️ Không tìm thấy token, hủy kết nối WebSocket.');
                    return;
                }
                const encodedToken = encodeURIComponent(token);
                const ws = new WebSocket(`ws://192.168.1.3:1010/ws-raw?token=${encodedToken}&userId=${userId}`);
                socketRef.current = ws;

                ws.onopen = () => {
                    console.log('✅ WebSocket connected!');
                    ws.send(JSON.stringify({ userId, token }));
                    startHeartbeat();
                };

                ws.onerror = (error) => {
                    console.log('❌ WebSocket error:', error);
                };

                ws.onclose = (event) => {
                    console.log(`⚠️ WebSocket disconnected! Code: ${event.code}, Reason: ${event.reason}`);
                    stopHeartbeat();
                    if (!event.wasClean) {
                        console.log('🔄 Đang thử kết nối lại sau 5 giây...');
                        // reconnectRef.current = setTimeout(connectWebSocket, 5000);
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log('📩 Message from server:', message);

                        // 👉 Chỉ thêm vào danh sách notification nếu KHÔNG phải là UPDATE_CART
                        if (
                            ['NEW_NOTIFICATION', 'NEW_GROUP_JOIN', 'MEMBER_LEFT_GROUP', 'MEMBER_KICKED'].includes(message.type)
                        ) {
                            setNotifications((prev) => {
                                const isDuplicate = prev.some(noti => noti.time === message.time);
                                if (isDuplicate) return prev;

                                const newNotification: NotificationWS = {
                                    userId: message.userId,
                                    shipmentId: message.shipmentId,
                                    groupOrderId: message.groupOrderId,
                                    message: message.message,
                                    time: message.time,
                                };

                                return [...prev, newNotification];
                            });
                        }

                        // 👉 Luôn fetch lại cart khi có các loại message này
                        if (
                            ['NEW_GROUP_JOIN', 'MEMBER_LEFT_GROUP', 'MEMBER_KICKED', 'UPDATE_CART'].includes(message.type)
                        ) {
                            try {
                                fetchCartItem?.();
                            } catch (error) {
                                console.error('Lỗi khi fetch cart từ WebSocket:', error);
                            }
                        }

                        // 👉 Navigate nếu bị kick
                        if (message.type === 'MEMBER_KICKED') {
                            navigation.navigate('GroupOrderList');
                        }

                    } catch (error) {
                        console.log('❌ JSON parse error:', error);
                    }
                };

            } catch (error) {
                console.log('🚨 Lỗi khi lấy token:', error);
            }
        };

        const startHeartbeat = () => {
            stopHeartbeat();
            heartbeatRef.current = setInterval(() => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ type: 'PING' }));
                }
            }, 10000); // Mỗi 10s
        };

        const stopHeartbeat = () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };

        connectWebSocket();

        return () => {
            console.log('🔌 Đóng kết nối WebSocket...');
            stopHeartbeat();
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
        };
    }, [userId]);

    return notifications;
};

export default useWebSocket;
