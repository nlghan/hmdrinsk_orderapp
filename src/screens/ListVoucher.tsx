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
