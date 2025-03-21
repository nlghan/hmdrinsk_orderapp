// import React, { useEffect } from "react";
// import { PermissionsAndroid, Platform } from "react-native";
// import notifee from "@notifee/react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useCategoryStore } from '../store/store';
// import useWebSocket from '../utils/Socket'; 

// const NotificationHandler = () => {
//   const { language, userId } = useCategoryStore();
//   const socketNotifications = useWebSocket(userId ?? 0);

//   // Hàm hiển thị thông báo trên thanh trạng thái
//   const showSystemNotification = async (title:any, body:any) => {
//     await notifee.requestPermission(); // Xin quyền thông báo nếu chưa có

//     await notifee.displayNotification({
//       title,
//       body,
//       android: {
//         channelId: "default",
//         pressAction: { id: "default" },
//       },
//       ios: {
//         foregroundPresentationOptions: {
//           banner: true,
//           sound: true,
//         },
//       },
//     });
//   };

//   useEffect(() => {
//     const requestPermissions = async () => {
//       await notifee.requestPermission();

//       if (Platform.OS === "android") {
//         await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
//         );
//       }
//     };

//     requestPermissions();

//     if (socketNotifications.length > 0) {
//       const newNotification =
//         socketNotifications[socketNotifications.length - 1];

//       if (
//         newNotification &&
//         typeof newNotification === "object" &&
//         "message" in newNotification
//       ) {
//         showSystemNotification("Thông báo", newNotification.message);
//       } else {
//         console.error("Dữ liệu thông báo không hợp lệ:", newNotification);
//       }
//     }
//   }, [socketNotifications]);

//   return null; // Không cần render UI, chỉ cần xử lý thông báo
// };

// export default NotificationHandler;
