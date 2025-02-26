import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';

type NavigationProps = {
  navigate: (screen: string) => void;
};
const Other = () => {
  const navigation = useNavigation<NavigationProps>();
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Tiện ích */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.box}>
              <MaterialIcons name="history" style={styles.iconOrange} size={24} />
              <Text>Lịch sử đơn hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.box}>
              <MaterialIcons name="description" style={styles.iconPurple} size={24} />
              <Text>Điều khoản</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.box, styles.fullWidth]}>
              <MaterialIcons name="description" style={styles.iconPurple} size={24} />
              <Text>Điều khoản VNPAY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hỗ trợ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="star" style={styles.icon} size={24} />
              <Text>Đánh giá đơn hàng</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="comment" style={styles.icon} size={24} />
              <Text>Liên hệ và góp ý</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="receipt" style={styles.icon} size={24} />
              <Text>Hướng dẫn xuất hóa đơn GTGT</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tài khoản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Info')}>
              <MaterialIcons name="person" style={styles.icon} size={24} />
              <Text>Thông tin cá nhân</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem}>
              <MaterialIcons name="bookmark" style={styles.icon} size={24} />
              <Text>Địa chỉ đã lưu</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('LanguageChange')}>
              <MaterialIcons name="settings" style={styles.icon} size={24} />
              <Text>Ngôn ngữ</Text>
              <MaterialIcons name="arrow-forward-ios" style={styles.iconrow} size={18} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.listItem, styles.logout]}>
              <MaterialIcons name="logout" style={styles.icon} size={24} />
              <Text style={{ color: "red" }}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
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

export default Other;