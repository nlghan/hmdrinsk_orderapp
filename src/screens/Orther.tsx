import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from "../store/store";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import Notification from '../components/Notification';
import OrderCount from '../components/OrderCount';
import NotificationPopup from '../components/NotificationPopup';
import { FONTFAMILY } from "../theme/theme";

const Other = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const logout = useCategoryStore((state) => state.logout);
  const { language, userId } = useCategoryStore();
  const [orderCounts, setOrderCounts] = useState({
    confirmed: 0,
    // waiting: 0,
    cancelled: 0,
    pending: 0,
    refunded: 0,
  });
  const [notification, setNotification] = useState({ message: '', visible: false });
  const handleLogout = () => {
    logout(); // Xóa dữ liệu đăng nhập
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // Chuyển về trang đăng nhập
    });
  };
  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* <NotificationPopup userId={userId ?? 0} /> */}
      <View style={styles.container}>
        <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
        {/* Tiện ích */}
        <Text style={styles.title}>{t('information.other')}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          <View style={styles.centered}>

            <TouchableOpacity style={styles.box1} onPress={() => navigation.navigate('HistoryOrders')}>
              <MaterialIcons name="history" style={styles.iconOrange} size={30} />
              <Text style={styles.textOther}>{t('history.history')}</Text>
            </TouchableOpacity>
          </View>
          {/* Fetch số lượng đơn hàng */}
          <OrderCount onDataFetched={setOrderCounts} />
          {/* 5 trạng thái đơn hàng */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('DeliveringOrders')}>
              <MaterialIcons name="local-shipping" style={styles.iconBlue} size={30} />
              <View style={styles.badge}>
              {orderCounts ? (
                orderCounts.confirmed > 0 ? (
                  <Text style={styles.badgeText}>{orderCounts.confirmed}</Text>
                ) : null
              ) : (
                <ActivityIndicator size="small" color="#fff" />
              )}
              </View>             
              <Text style={styles.textSubOther}>{t('orderContent.status.ship')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('WaitingOrders')}>
              <MaterialIcons name="schedule" style={styles.iconYellow} size={30} />
              {/* {orderCounts.waiting > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCounts.waiting}</Text>
                </View>
              )} */}
              <Text style={styles.textSubOther}>{t('orderContent.status.wait')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('CancelledOrders')}>
              <MaterialIcons name="cancel" style={styles.iconRed} size={30} />
              <View style={styles.badge}>
                {orderCounts ? (
                  orderCounts.cancelled > 0 ? (
                    <Text style={styles.badgeText}>{orderCounts.cancelled}</Text>
                  ) : null
                ) : (
                  <ActivityIndicator size="small" color="white" />
                )}
              </View>
              <Text style={styles.textSubOther}>{t('orderContent.status.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PendingOrders')}>
              <MaterialIcons name="payment" style={styles.iconGreen} size={30} />
              <View style={styles.badge}>
                {orderCounts ? (
                  orderCounts.pending > 0 ? (
                    <Text style={styles.badgeText}>{orderCounts.pending}</Text>
                  ) : null
                ) : (
                  <ActivityIndicator size="small" color="#fff" />
                )}
              </View>
              <Text style={styles.textSubOther}>{t('orderContent.status.confirm')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('RefundOrders')}>
              <MaterialIcons name="account-balance-wallet" style={styles.iconPurple} size={30} />
              <View style={styles.badge}>
                {orderCounts ? (
                  orderCounts.refunded > 0 ? (
                    <Text style={styles.badgeText}>{orderCounts.refunded}</Text>
                  ) : null
                ) : (
                  <ActivityIndicator size="large" color="#fff" />
                )}
              </View>
              <Text style={styles.textSubOther}>{t('orderContent.status.refund')}</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features.support')}</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="star" style={styles.icon} size={24} />
              <Text style={styles.textOther}>{t('about.stat4')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Contact')}>
              <MaterialIcons name="comment" style={styles.icon} size={24} />
              <Text style={styles.textOther}>{t('contact1')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('user')}</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Info')}>
              <MaterialIcons name="person" style={styles.icon} size={24} />
              <Text style={styles.textOther}>{t('personalInfo')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('LanguageChange')}>
              <MaterialIcons name="settings" style={styles.icon} size={24} />
              <Text style={styles.textOther}>{t('language')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, styles.logout]} onPress={handleLogout}>
              <MaterialIcons name="logout" style={styles.icon} size={24} />
              <Text style={styles.textOther1}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default Other;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title:{
    textAlign:'center',
    fontFamily:FONTFAMILY.lobster_regular,
    fontSize:24
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  centered: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 5,
    backgroundColor: "red",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  iconBlue: {
    color: "#3498db",
  },
  iconYellow: {
    color: "#f1c40f",
  },
  iconRed: {
    color: "#e74c3c",
  },
  iconGreen: {
    color: "#2ecc71",
  },
  iconPurple: {
    color: "purple",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily:FONTFAMILY.lobster_regular,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  box: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    flexDirection: "column", // Chuyển sang dạng column
    height: 80, // Tăng chiều cao để đủ chỗ cho icon và text
  },
  statusText: {
    marginTop: 5,
    fontSize: 9,
    color: "#333",
    fontWeight: "500",
    marginLeft: -8,
    marginRight: -8,
  },
  box1: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: 60,
  },
  fullWidth: {
    flexBasis: "100%",
  },
  list: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logout: {
    backgroundColor: "transparent",
  },
  icon: {
    marginRight: 10,
  },
  iconrow: {
    position: "absolute",
    right: 10,
  },
  iconOrange: {
    color: "orange",
    marginRight: 10,
  },
  textOther:{
    fontFamily:FONTFAMILY.dongle_light,
    fontSize:24
  },
  textOther1:{
    fontFamily:FONTFAMILY.dongle_light,
    fontSize:24,
    color:'red'
  },
  textSubOther:{
    fontFamily:FONTFAMILY.dongle_regular,
    fontSize:14,
    color: "#333",
  }
});
