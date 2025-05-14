import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from '../styles/editGroupAddress';
import NotificationPopup from '../components/NotificationPopup';
import { useCategoryStore } from '../store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from '../store/useCartStore';

type EditGroupAddressRouteProp = RouteProp<RootStackParamList, 'EditGroupAddress'>;

const EditGroupAddress = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditGroupAddressRouteProp>();
  const { language, userId, checkShipment } = useCategoryStore();

  const [locationDetail, setLocationDetail] = useState('');
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [ward, setWard] = useState<string | null>(null);

  const [provinceOpen, setProvinceOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [wardOpen, setWardOpen] = useState(false);

  const [provinceItems, setProvinceItems] = useState<{ label: string; value: string }[]>([]);
  const [districtItems, setDistrictItems] = useState<{ label: string; value: string }[]>([]);
  const [wardItems, setWardItems] = useState<{ label: string; value: string }[]>([]);


  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);
  const [selectedWardName, setSelectedWardName] = useState<string | null>(null);


  const fetchProvinces = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axiosInstance.get('/province/listAll', {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data?.responseList) {
        const items = data.responseList.map((item: any) => ({
          label: item.provinceName,
          value: item.provinceId.toString(),
        }));
        setProvinceItems(items);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy tỉnh:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh.');
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axiosInstance.get(`/province/list-district?provinceId=${provinceId}`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data?.districtResponseList) {
        const items = data.districtResponseList.map((item: any) => ({
          label: item.districtName,
          value: item.districtId.toString(),
        }));
        setDistrictItems(items);
        setDistrict(null);
        setWard(null);
        setWardItems([]);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy huyện:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện.');
    }
  };

  const fetchWards = async (districtId: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const response = await axiosInstance.get(`/province/list-ward?districtId=${districtId}`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      if (data?.responseList) {
        const items = data.responseList.map((item: any) => ({
          label: item.wardName,
          value: item.wardId.toString(),
        }));
        setWardItems(items);
        setWard(null);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy phường:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã.');
    }
  };

  const handleProvinceChange = async (selectedProvince: string | null) => {
    setProvince(selectedProvince);
    setDistrict(null);
    setWard(null);
    setDistrictItems([]);
    setWardItems([]);
    if (selectedProvince) {
      await fetchDistricts(selectedProvince);
    }
  };

  const handleDistrictChange = async (selectedDistrict: string | null) => {
    setDistrict(selectedDistrict);
    setWard(null);
    setWardItems([]);
    if (selectedDistrict) {
      await fetchWards(selectedDistrict);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fullAddress = route.params?.currentAddress ?? '';
    if (fullAddress && provinceItems.length > 0) {
      const parts = fullAddress.split(',').map((p) => p.trim());
      if (parts.length === 4) {
        const location = parts[0];
        const wardName = parts[1];
        const districtName = parts[2];
        const provinceName = parts[3];

        const provinceItem = provinceItems.find((item) => item.label === provinceName);
        if (provinceItem) {
          const provinceId = provinceItem.value;
          setProvince(provinceId);
          setLocationDetail(location);
          setSelectedDistrictName(districtName);
          setSelectedWardName(wardName); // 👈 Thêm dòng này
        }
      }
    }
  }, [provinceItems]);


  useEffect(() => {
    if (province) {
      fetchDistricts(province);
    }
  }, [province]);

  useEffect(() => {
    if (selectedDistrictName && districtItems.length > 0) {
      const districtItem = districtItems.find((item) => item.label === selectedDistrictName);
      if (districtItem) {
        setDistrict(districtItem.value);
        fetchWards(districtItem.value); // thêm dòng này để load ward khi setDistrict từ route
      }
    }
  }, [districtItems]);

  useEffect(() => {
    if (selectedWardName && wardItems.length > 0) {
      const wardItem = wardItems.find((item) => item.label === selectedWardName);
      if (wardItem) {
        setWard(wardItem.value);
      }
    }
  }, [wardItems]);


  const getLabelFromValue = (items: { label: string; value: string }[], value: string | null) => {
    const found = items.find((item) => item.value === value);
    return found ? found.label : '';
  };

  const { groupCartData, fetchCartItem, checkGroupCart } = useCartStore();

  const handleSave = async () => {
    if (!locationDetail || !province || !district || !ward) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ địa chỉ.');
      return;
    }

    const fullAddress = `${locationDetail}, ${getLabelFromValue(
      wardItems,
      ward
    ) || ward}, ${getLabelFromValue(districtItems, district)}, ${getLabelFromValue(
      provinceItems,
      province
    )}`;

    try {
      const token = await AsyncStorage.getItem('access_token');
      const groupId = route.params?.groupOrderId; // đảm bảo bạn truyền groupId qua route
      const leaderId = userId;

      if (!groupId || !leaderId) {
        Alert.alert('Thiếu dữ liệu', 'Không tìm thấy groupId hoặc leaderId.');
        return;
      }

      await axiosInstance.put(
        '/group-order/update-address',
        {
          address: fullAddress,
          groupId: groupId,
          leaderId: leaderId,
        },
        {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Thành công', 'Địa chỉ đã được cập nhật.');
      fetchCartItem();
      navigation.goBack();
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ.');
    }
  };


  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>
      <NotificationPopup userId={userId ?? 0} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={handleCancel}>
          <Icon name="arrow-back" size={20} color="#FF9800" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('android.groupOrderList')}</Text>
      </View>

      <Text style={styles.label}>Tỉnh / Thành phố</Text>
      <DropDownPicker
        open={provinceOpen}
        value={province}
        items={provinceItems}
        setOpen={setProvinceOpen}
        setValue={(callback) => {
          const selectedValue = callback(province);
          handleProvinceChange(selectedValue);
          return selectedValue;
        }}
        setItems={setProvinceItems}
        zIndex={3000}
        zIndexInverse={1000}
        containerStyle={styles.dropDownContainer}
      />

      <Text style={styles.label}>Quận / Huyện</Text>
      <DropDownPicker
        open={districtOpen}
        value={district}
        items={districtItems}
        setOpen={setDistrictOpen}
        setValue={(callback) => {
          const selectedValue = callback(district);
          handleDistrictChange(selectedValue);
          return selectedValue;
        }}
        setItems={setDistrictItems}
        zIndex={2000}
        zIndexInverse={2000}
        containerStyle={styles.dropDownContainer}
      />

      <Text style={styles.label}>Phường / Xã</Text>
      <DropDownPicker
        open={wardOpen}
        value={ward}
        items={wardItems}
        setOpen={setWardOpen}
        setValue={setWard}
        setItems={setWardItems}
        zIndex={1000}
        zIndexInverse={3000}
        containerStyle={styles.dropDownContainer}
        placeholder="Nhập phường hoặc điền tay"
      />


      <Text style={styles.label}>Vị trí chi tiết</Text>
      <TextInput
        placeholder="Nhập số nhà, tên đường..."
        style={styles.input}
        value={locationDetail}
        onChangeText={setLocationDetail}
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditGroupAddress;
