import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from "../store/store";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { useOrderStore, useOrderStorePending, useOrderStoreCancelled, useOrderStoreWaiting, useOrderStoreRefund } from "../store/countStore";

const Other = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const logout = useCategoryStore((state) => state.logout);
  const { orderCount } = useOrderStore();
  const { orderCountPending } = useOrderStorePending();
  const { orderCountCancelled } = useOrderStoreCancelled();
  const { orderCountWaiting } = useOrderStoreWaiting();
  const { orderCountRefund } = useOrderStoreRefund();
  const handleLogout = () => {
    logout(); // Xóa dữ liệu đăng nhập
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // Chuyển về trang đăng nhập
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Tiện ích */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features')}</Text>
          <View style={styles.centered}>

            <TouchableOpacity style={styles.box1} onPress={() => navigation.navigate('HistoryOrders')}>
              <MaterialIcons name="history" style={styles.iconOrange} size={24} />
              <Text>{t('history.history')}</Text>
            </TouchableOpacity>
          </View>

          {/* 5 trạng thái đơn hàng */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('DeliveringOrders')}>
              <MaterialIcons name="local-shipping" style={styles.iconBlue} size={30} />
              {orderCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCount}</Text>
                </View>
              )}
              <Text style={styles.statusText}>Đang giao</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('WaitingOrders')}>
              <MaterialIcons name="schedule" style={styles.iconYellow} size={30} />
              {orderCountWaiting > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCountWaiting}</Text>
                </View>
              )}
              <Text style={styles.statusText}>Chờ giao</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('CancelledOrders')}>
              <MaterialIcons name="cancel" style={styles.iconRed} size={30} />
              {orderCountCancelled > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCountCancelled}</Text>
                </View>
              )}
              <Text style={styles.statusText}>Đã hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('PendingOrders')}>
              <MaterialIcons name="payment" style={styles.iconGreen} size={30} />
              {orderCountPending > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCountPending}</Text>
                </View>
              )}
              <Text style={styles.statusText}>Xác nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('RefundOrders')}>
              <MaterialIcons name="account-balance-wallet" style={styles.iconPurple} size={30} />
              {orderCountRefund > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{orderCountRefund}</Text>
                </View>
              )}
              <Text style={styles.statusText}>Hoàn tiền</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('features.support')}</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="star" style={styles.icon} size={24} />
              <Text>{t('about.stat4')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="comment" style={styles.icon} size={24} />
              <Text>{t('contact1')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="receipt" style={styles.icon} size={24} />
              <Text>Hướng dẫn xuất hóa đơn GTGT</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('user')}</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Info')}>
              <MaterialIcons name="person" style={styles.icon} size={24} />
              <Text>{t('personalInfo')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="bookmark" style={styles.icon} size={24} />
              <Text>Địa chỉ đã lưu</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('LanguageChange')}>
              <MaterialIcons name="settings" style={styles.icon} size={24} />
              <Text>{t('language')}</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, styles.logout]} onPress={handleLogout}>
              <MaterialIcons name="logout" style={styles.icon} size={24} />
              <Text style={{ color: "red" }}>{t('logout')}</Text>
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
    fontSize: 10,
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    justifyContent: "center",
    flexDirection: "column", // Chuyển sang dạng column
    height: 80, // Tăng chiều cao để đủ chỗ cho icon và text
  },
  statusText: {
    marginTop: 5,
    fontSize: 9,
    color: "#333",
    fontWeight: "500",
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
  iconPurple: {
    color: "purple",
    marginRight: 10,
  },
});
