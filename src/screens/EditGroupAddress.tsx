import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
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
import Notification from '../components/Notification';

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

  const [notification, setNotification] = useState({ message: '', visible: false });
  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    // Ẩn thông báo sau 3 giây
    setTimeout(() => setNotification({ ...notification, visible: false }), 4000);
  };

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
      showNotification(t('android.mess.error5'));
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
      showNotification(t('android.mess.error6'))
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
      showNotification(t('android.mess.error7'))
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

      // Xử lý chỉ khi đủ 4 phần: street, ward, district, city
      if (parts.length === 4) {
        const [street, wardName, districtName, cityName] = parts;

        setLocationDetail(street);
        setSelectedWardName(wardName);
        setSelectedDistrictName(districtName);

        const provinceItem = provinceItems.find((item) => item.label === cityName);
        if (provinceItem) {
          setProvince(provinceItem.value);
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
    let finalProvince = province;
    let finalDistrict = district;
    let finalWard = ward;

    // nếu province/district/ward chưa có value, cố gắng tìm từ tên đã chọn sẵn
    if (!finalProvince && selectedDistrictName) {
      const item = provinceItems.find((item) => item.label === route.params?.currentAddress?.split(',').pop()?.trim());
      if (item) finalProvince = item.value;
    }

    if (!finalDistrict && selectedDistrictName) {
      const item = districtItems.find((item) => item.label === selectedDistrictName);
      if (item) finalDistrict = item.value;
    }

    if (!finalWard && selectedWardName) {
      const item = wardItems.find((item) => item.label === selectedWardName);
      if (item) finalWard = item.value;
    }

    if (!locationDetail || !finalProvince || !finalDistrict || !finalWard) {
      showNotification(t('android.mess.check6'));
      return;
    }

    const fullAddress = `${locationDetail}, ${getLabelFromValue(
      wardItems,
      finalWard
    )}, ${getLabelFromValue(
      districtItems,
      finalDistrict
    )}, ${getLabelFromValue(provinceItems, finalProvince)}`;

    try {
      const token = await AsyncStorage.getItem('access_token');
      const groupId = route.params?.groupOrderId; // đảm bảo bạn truyền groupId qua route
      const leaderId = userId;

      if (!groupId || !leaderId) {
        console.error('Thiếu dữ liệu', 'Không tìm thấy groupId hoặc leaderId.');
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
      showNotification(t('adroid.mess.sucess5'));
      fetchCartItem();
      if (route.params?.onGoBack) {
        route.params.onGoBack(); // gọi hàm callback cập nhật
      }
      navigation.goBack();
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật địa chỉ:', error);
      showNotification(t('adroid.mess.error8'));
    }
  };

  useEffect(() => {
    if (route.params?.autoSave) {
      // Gọi handleSave tự động nếu có yêu cầu từ GroupDetails
      handleSave();
    }
  }, []);


  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
            <NotificationPopup userId={userId ?? 0} />

            <View style={styles.header}>
              <TouchableOpacity style={styles.backIcon} onPress={handleCancel}>
                <Icon name="arrow-back" size={20} color="#FF9800" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('android.groupOrderList')}</Text>
            </View>

            {/* Các dropdown giữ nguyên như cũ */}
            <Text style={styles.label}>{t('information.city')}</Text>
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

            <Text style={styles.label}>{t('information.district')}</Text>
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

            <Text style={styles.label}>{t('information.ward')}</Text>
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
            />

            <Text style={styles.label}>{t('information.detailAddress')}</Text>
            <TextInput
              placeholder={t('information.detailAddress')}
              placeholderTextColor="#999"
              style={styles.input}
              value={locationDetail}
              onChangeText={setLocationDetail}
            />

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>{t('order.orderDetail.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('android.saveBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
};

export default EditGroupAddress;
