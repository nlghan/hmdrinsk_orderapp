import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from '../store/useCartStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';

interface NotificationWS {
    userId: number;
    shipmentId?: number;
    groupOrderId?: number;
    message: string;
    time: string;
    type?: string;
    id: number;
}

const useWebSocket = (userId: number) => {
    const [notifications, setNotifications] = useState<NotificationWS[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const fetchCartItem = useCartStore(state => state.fetchCartItem);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const {groupOrderCount} = useCartStore();
     const setGroupOrderCount = useCartStore((state) => state.setGroupOrderCount);


    // Ref giữ debounce timer
    const fetchCartItemDebounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!userId || socketRef.current) return;
        console.log('🔗 Connecting WebSocket with userId:', userId);

        const connectWebSocket = async () => {
            try {
                if (socketRef.current) {
                    console.log('⚠️ Closing old socket before new connection');
                    socketRef.current.close();
                    socketRef.current = null;
                }

                const token = await AsyncStorage.getItem('access_token');
                if (!token) {
                    console.log('⚠️ No token found, abort WebSocket connection');
                    return;
                }
                const encodedToken = encodeURIComponent(token);
                const ws = new WebSocket(`ws://192.168.102.192:1010/ws-raw?token=${encodedToken}&userId=${userId}`);
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
                        console.log('🔄 Reconnecting in 5 seconds...');
                        // reconnectRef.current = setTimeout(connectWebSocket, 5000);
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        console.log('📩 Message from server:', message);

                        if (
                            ['NEW_NOTIFICATION', 'UPDATE_CART_LEADER', 'NEW_GROUP_JOIN', 'MEMBER_LEFT_GROUP', 'MEMBER_KICKED'].includes(message.type)
                        ) {
                            setNotifications(prev => {
                                const isDuplicate = prev.some(noti => noti.time === message.time);
                                if (isDuplicate) return prev;
                                return [...prev, {
                                    id: message.id,
                                    userId: message.userId,
                                    shipmentId: message.shipmentId,
                                    groupOrderId: message.groupOrderId,
                                    message: message.message,
                                    time: message.time,
                                }];
                            });
                        }

                        if (
                            ['NEW_GROUP_JOIN', 'UPDATE_CART_LEADER', 'MEMBER_LEFT_GROUP', 'MEMBER_KICKED', 'UPDATE_CART', 'CHECKOUT'].includes(message.type)
                        ) {
                            // debounce gọi fetchCartItem
                            if (fetchCartItemDebounceRef.current) {
                                clearTimeout(fetchCartItemDebounceRef.current);
                            }
                            fetchCartItemDebounceRef.current = setTimeout(() => {
                                fetchCartItem?.();
                            }, 500);
                        }

                        if (message.type === 'MEMBER_KICKED') {
                            setGroupOrderCount(Math.max(0, groupOrderCount - 1));
                            navigation.goBack();
                        }

                        if (message.type === 'CHECKOUT') {
                             setGroupOrderCount(Math.max(0, groupOrderCount - 1));
                            navigation.navigate('Main');
                        }


                      

                    } catch (error) {
                        console.log('❌ JSON parse error:', error);
                    }
                };

            } catch (error) {
                console.log('🚨 Error getting token:', error);
            }
        };

        const startHeartbeat = () => {
            stopHeartbeat();
            heartbeatRef.current = setInterval(() => {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ type: 'PING' }));
                }
            }, 10000);
        };

        const stopHeartbeat = () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };

        connectWebSocket();

        return () => {
            console.log('🔌 Closing WebSocket connection...');
            stopHeartbeat();
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
                reconnectRef.current = null;
            }
            if (fetchCartItemDebounceRef.current) {
                clearTimeout(fetchCartItemDebounceRef.current);
                fetchCartItemDebounceRef.current = null;
            }
        };
    }, [userId, fetchCartItem, navigation]);

    return notifications;
};

export default useWebSocket;