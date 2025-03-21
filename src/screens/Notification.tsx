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
import { useNavigation } from "@react-navigation/native";
import { RouteProp, useRoute } from "@react-navigation/native";
import axiosInstance from "../utils/axiosInstance";
import UseWebSocket from '../utils/Socket';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../navigation/RootStackParamList";


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
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const modalRef = useRef(null);

  const fetchNotifications = async () => {
    if (!userId) return;
    console.log("userId Noti", userId);
    console.log("userId Noti", typeof userId, userId); // Kiểm tra kiểu dữ liệu userId
    try {
      const response = await axiosInstance.get(`/notifications/user/${userId}`);
      const data: Notification[] = response.data;
      setNotifications(data);
      setUnreadCount(data.filter((noti) => !noti.isRead).length);
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
      await axiosInstance.put(`/notifications/read/${notificationId}`);
      fetchNotifications();
      navigation.navigate("MyOrderDetails", { shipmentId: Number(shipmentId) });
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo là đã đọc:", error);
    }
  };
  

  return (
    <View>
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Thông báo</Text>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.notificationItem, item.isRead && styles.read]}
                  onPress={() => handleNotificationClick(item.id, item.shipmentId)}
                >
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.time}>{
                    new Date(item.time).toLocaleString()
                  }</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text>Không có thông báo</Text>}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    position: "relative",
    padding: 10,
  },
  notificationDot: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dotText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notificationItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  read: {
    backgroundColor: "#e0e0e0",
  },
  message: {
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: "gray",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
  },
  closeText: {
    color: "white",
    textAlign: "center",
  },
});

export default NotificationScreen;
