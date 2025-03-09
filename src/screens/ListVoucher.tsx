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

const ListVoucher = () => {
  const {
    vouchers,
    fetchVoucher,
    selectedVoucher,
    setSelectedVoucher,
  } = useCartStore();

  const [voucherName, setVoucherName] = useState("");
  const [filteredVouchers, setFilteredVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  const handleSelectVoucher = (id: number, name: string, discountAmount: number, status: string) => {
    if (status === "USED") return;

    setSelectedVoucher({
      selectedVoucherId: id,
      selectedVoucherKey: name,
      selectedVoucherDiscountAmount: discountAmount,
    });

    setShowAutocomplete(false);
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
      <Text style={styles.title}>Chọn Voucher</Text>

      {/* Autocomplete nhập mã voucher */}
      <View style={styles.autocompleteWrapper}>
        <Autocomplete
          data={showAutocomplete ? filteredVouchers : []}
          defaultValue={voucherName}
          onChangeText={handleSearch}
          placeholder="Nhập tên voucher"
          flatListProps={{
            keyExtractor: (item) => item.voucherId.toString(),
            renderItem: ({ item }) => (
              <TouchableOpacity
                style={styles.autocompleteItem}
                onPress={() =>
                  handleSelectVoucher(item.voucherId, item.name, item.discountAmount, item.status)
                }
              >
                <Text>{item.name}</Text>
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
        <Text>❌ Không có voucher khả dụng</Text>
      ) : (
        <ScrollView style={styles.voucherList}>
          {sortedVouchers.map((voucher) => {
            const isUsed = voucher.status === "USED";
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
                  <Checkbox
                    status={isSelected ? "checked" : "unchecked"}
                    disabled={isUsed}
                  />
                  <View style={styles.voucherText}>
                    <Text style={styles.voucherTitle}>
                      Mã Voucher: {voucher.name}
                    </Text>
                    <Text
                      style={[
                        styles.voucherStatus,
                        isUsed && styles.disabledText,
                      ]}
                    >
                      Trạng thái: {voucher.status}
                    </Text>
                    <Text style={isUsed ? styles.disabledText : null}>
                      📝 {voucher.description}
                    </Text>
                    <Text style={isUsed ? styles.disabledText : null}>
                      💰 Giảm giá:{" "}
                      {voucher.discountAmount || voucher.discountPercentage + "%"}
                    </Text>
                    <Text style={isUsed ? styles.disabledText : null}>
                      📅 HSD: {voucher.expiryDate}
                    </Text>
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

      {/* Nút xác nhận */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          navigation.navigate("Cart"); // Điều hướng về trang Cart
        }}
      >
        <Text style={styles.confirmText}>Đồng ý</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListVoucher;
