import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Alert } from 'react-native';
import { useCategoryStore } from '../store/store';

const useWebSocket = (userId: number) => {

    interface Notification {
        userId: number;
        shipmentId: number;
        message: string;
        time: string;
      }
      
      const [notifications, setNotifications] = useState<Notification[]>([]);      

    useEffect(() => {
        if (!userId) {
            console.warn('ID không hợp lệ.');
            return;
        }

        console.log('Connecting WebSocket with userId:', userId);

        const socket = new SockJS('http://192.168.9.195:1010/ws');
        
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {},
            debug: (str) => console.log(str),
            onConnect: () => {
                console.log('WebSocket connected');
                const topic = `/topic/shipper/${userId}`;
                console.log(`Subscribing to ${topic}`);

                stompClient.subscribe(topic, (message) => {
                    console.log('Received raw message:', message);
                    if (message.body) {
                        try {
                            const notification = JSON.parse(message.body);
                            console.log('Parsed notification:', notification);
                            setNotifications((prev) => [...prev, notification]);
                            Alert.alert('Thông báo', notification.message);
                        } catch (e) {
                            console.error('Error parsing message body:', e);
                        }
                    }
                }
            );
            },            
            onStompError: (frame) => {
                console.error(`Broker reported error: ${frame.headers['message']}`);
                console.error(`Additional details: ${frame.body}`);
            },
            onDisconnect: () => {
                console.log('WebSocket disconnected');
            },
        });

        stompClient.onWebSocketError = (error) => {
            console.error('WebSocket error:', error);
        };

        stompClient.activate();
        console.log('WebSocket is activating...');

        return () => {
            if (stompClient) stompClient.deactivate();
            console.log('WebSocket deactivated');
        };
    }, [userId]);

    return notifications;
};

export default useWebSocket;
