import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Checkbox } from "react-native-paper";
import Autocomplete from "react-native-autocomplete-input";
import { useCartStore } from "../store/useCartStore";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/listVoucher";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStackParamList";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../theme/theme";
import { Image } from "react-native";
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/axiosInstance";
import Notification from '../components/Notification';
import { useCategoryStore } from "../store/store";


const ListVoucher = () => {
  const {
    vouchers,
    fetchVoucher,
    selectedVoucher,
    setSelectedVoucher,
    currentCartId,
    idCartPause,
    idOrderPause
  } = useCartStore();

  const { userId } = useCategoryStore();
  const [voucherName, setVoucherName] = useState("");
  const [filteredVouchers, setFilteredVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    // Ẩn thông báo sau 3 giây
    setTimeout(() => setNotification({ ...notification, visible: false }), 4000);
  };

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation()

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        await fetchVoucher();
      } catch (error) {
        console.error("Lỗi khi tải voucher:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, [fetchVoucher]);


  const handleSelectVoucher = async (
    id: number,
    name: string,
    discountAmount: number,
    status: string
  ) => {
    if (status === "USED" || status === "EXPIRED") return;

    try {
      if (currentCartId === idCartPause) {
        const token = await AsyncStorage.getItem("access_token");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const payload = {
          userId,
          orderId: idOrderPause,
          voucherId: id,
        };

        console.log("🔁 Gửi yêu cầu apply voucher cho đơn tạm dừng...", payload);

        const response = await axiosInstance.post(
          "/orders/order_pause/add_voucher",
          payload,
          { headers }
        );

        console.log("✅ Apply voucher response:", response.data);

        if (response.status !== 200) {
          throw new Error("Lỗi khi áp dụng voucher cho đơn hàng tạm dừng");
        }

        // showNotification("🎉 Đã áp dụng mã giảm giá cho đơn hàng tạm dừng!");
      }

      // Cập nhật trạng thái local cho cả hai trường hợp
      setSelectedVoucher({
        selectedVoucherId: id,
        selectedVoucherKey: name,
        selectedVoucherDiscountAmount: discountAmount,
      });

      setShowAutocomplete(false);
    } catch (error) {
      console.error("❌ Lỗi khi áp dụng voucher:", error);
      showNotification("Có lỗi khi áp dụng mã giảm giá!");
    }
  };



  const handleDeselectVoucher = () => {
    setSelectedVoucher({
      selectedVoucherId: null,
      selectedVoucherKey: null,
      selectedVoucherDiscountAmount: 0,
    });
  };


  const handleSearch = (text: string) => {
    setVoucherName(text);
    if (text.length > 0) {
      const filtered = vouchers.filter((voucher) =>
        voucher.name?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredVouchers(filtered);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  // Sắp xếp voucher: INACTIVE trước, sau đó là ACTIVE, cuối cùng là USED
  const sortedVouchers = [...vouchers].sort((a, b) => {
    if (a.status === "INACTIVE" && b.status !== "INACTIVE") return -1;
    if (a.status !== "INACTIVE" && b.status === "INACTIVE") return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.primaryGreenHex} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('information.voucherList')}</Text>

      </View>

      {/* Autocomplete nhập mã voucher */}
      <View style={styles.autocompleteWrapper}>
        <Autocomplete
          data={showAutocomplete ? filteredVouchers : []}
          defaultValue={voucherName}
          onChangeText={handleSearch}
          placeholder={t('getVoucher')}
          placeholderTextColor={'#999'}
          flatListProps={{
            keyExtractor: (item) => item.voucherId.toString(),
            renderItem: ({ item }) => (
              <TouchableOpacity
                style={styles.autocompleteItem}
                onPress={() =>
                  handleSelectVoucher(item.voucherId, item.name, item.discountAmount, item.status)
                }
              >
                <Text style={styles.textName}>{item.name}</Text>
              </TouchableOpacity>
            ),
          }}
          containerStyle={styles.autocompleteContainer}
          inputContainerStyle={styles.inputContainer}
          listContainerStyle={styles.listContainer}
        />
      </View>

      {/* Danh sách voucher */}
      {loading ? (
        <ActivityIndicator size="large" color="#ff0000" />
      ) : sortedVouchers.length === 0 ? (
        <Text>{t('information.noVoucher')}</Text>
      ) : (
        <ScrollView style={styles.voucherList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} >
          {sortedVouchers.map((voucher) => {
            const isUsed = voucher.status === "USED" || voucher.status === "EXPIRED";
            const isSelected = selectedVoucher.selectedVoucherId === voucher.voucherId;

            return (
              <View key={voucher.voucherId} style={styles.voucherWrapper}>
                <TouchableOpacity
                  style={[
                    styles.voucherItem,
                    isSelected && styles.selectedVoucher,
                    isUsed && styles.disabledVoucher,
                  ]}
                  onPress={() =>
                    handleSelectVoucher(voucher.voucherId, voucher.name, voucher.discountAmount, voucher.status)
                  }

                  disabled={isUsed}
                >
                  <Image source={require("../assets/app_images/vc-b.png")} style={styles.voucherImage} />
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherCode}>{voucher.name}</Text>
                    <Text style={styles.voucherAmount}>{t('order.discount')}: {voucher.discountAmount}đ</Text>
                    <Text style={styles.voucherDate}>{t('postContent.endDate')}: {voucher.expiryDate}</Text>
                    <Text style={styles.voucherDate}>{t('information.useStatus')}: <Text style={styles.claimButtonText}>
                      {voucher.status === "INACTIVE" ? t('information.inactive') :
                        voucher.status === "USED" ? t('information.used') :
                          voucher.status === "EXPIRED" ? t('information.expired') : voucher.status}
                    </Text> </Text>

                  </View>
                </TouchableOpacity>

                {/* Dấu ❌ để bỏ chọn */}
                {isSelected && (
                  <TouchableOpacity style={styles.removeButton} onPress={handleDeselectVoucher}>
                    <Text style={styles.removeButtonText}>x</Text>
                  </TouchableOpacity>
                )}

              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default ListVoucher;
