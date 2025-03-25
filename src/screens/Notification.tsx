import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import IconM from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { RouteProp, useRoute } from "@react-navigation/native";
import axiosInstance from "../utils/axiosInstance";
import UseWebSocket from '../utils/Socket';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../navigation/RootStackParamList";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';


interface Notification {
  id: string;
  message: string;
  time: string;
  isRead: boolean;
  shipmentId: number;
}

type NotificationScreenRouteProp = RouteProp<RootStackParamList, "Notification">;

const NotificationScreen: React.FC = () => {
  const route = useRoute<NotificationScreenRouteProp>();
  const userId = route.params?.userId || 0;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const socketNotifications = UseWebSocket(userId);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(true);
  const modalRef = useRef(null);

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
  }, [userId]);

  useEffect(() => {
    if (socketNotifications.length > 0) {
      const newNotification =
        socketNotifications[socketNotifications.length - 1];
      if (
        newNotification &&
        typeof newNotification === "object" &&
        "message" in newNotification
      ) {
        fetchNotifications();
      } else {
        console.error("Dữ liệu thông báo không hợp lệ:", newNotification);
      }
    }
  }, [socketNotifications]);

  const handleNotificationClick = async (
    notificationId: string,
    shipmentId: number
  ) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axiosInstance.put(`/notifications/read/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
      fetchNotifications();
      navigation.navigate("MyOrderDetails", { shipmentId: Number(shipmentId) });
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo là đã đọc:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axiosInstance.put(`/notifications/read/all/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả thông báo là đã đọc:", error);
    }
  };
  useEffect(() => {
    console.log("📢 Notifications đã cập nhật:", notifications);
  }, [notifications]);
  console.log("📌 showNotifications:", showNotifications);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Main')}>
          <IconM name="arrow-back" size={20} color="#FF9800" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      {/* Nút đánh dấu tất cả đã đọc */}
      <TouchableOpacity
        style={[styles.markAllButton, unreadCount === 0 && styles.disabledButton]}
        onPress={handleMarkAllAsRead}
        disabled={unreadCount === 0}
      >
        <Text style={styles.markAllText}>Đánh dấu tất cả là đã đọc</Text>
      </TouchableOpacity>

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationItem, item.isRead && styles.read]}
            onPress={() => handleNotificationClick(item.id, item.shipmentId)}
          >
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có thông báo</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Màu nền cam nhạt
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  backIcon: {
    position: "absolute",
    top: 10,
    left: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  markAllButton: {
    padding: 12,
    backgroundColor: "#FFAE42", // Cam đậm hơn
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  markAllText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#FFD1A9", // Màu cam mờ khi disable
  },
  notificationItem: {
    padding: 15,
    backgroundColor: "#e0d1c3", // Nền trắng
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Hiệu ứng nổi trên Android
  },
  read: {
    backgroundColor: "#fff6ed", // Màu cam nhạt hơn cho thông báo đã đọc
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  time: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 50,
  },
});

export default NotificationScreen;
