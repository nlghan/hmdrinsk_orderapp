import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from '../store/store';
import IconM from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { FONTFAMILY } from '../theme/theme';

interface CartItem {
  cartItemGroupId: number;
  proName: string;
  size: string;
  itemPrice: number;
  totalPrice: number;
  quantity: number;
  imageUrl: string;
}

interface Member {
  memberId: number;
  name: string;
  amount: number;
  isPaid: boolean;
  isLeader: boolean;
  status: string;
  typePayment: string;
  cartItems: CartItem[];
}

interface GroupOrder {
  groupOrderId: number;
  nameLeader: string;
  nameGroup: string;
  address: string;
  totalPrice: number;
  code: string;
  status: string;
  link: string;
}

const OrderGroupDetail = () => {
  const route = useRoute();
  const { groupOrderId } = route.params as { groupOrderId: string | number };
  const navigation = useNavigation();
  const { language } = useCategoryStore();
  const { t } = useTranslation();

  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const statusMapVN: Record<string, string> = {
    COMPLETED: 'Hoàn tất',
    SHOPPING: 'Đang mua hàng',
    CANCELLED: 'Đã hủy',
  };

  useEffect(() => {
    const fetchGroupOrderDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axiosInstance.get(
          `/group-order/detail-group/${groupOrderId}?language=${language}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        const mainInfo = data.crudGroupOrderResponse;

        setGroupOrder({
          groupOrderId: mainInfo.groupOrderId,
          nameLeader: mainInfo.nameLeader,
          address: mainInfo.address,
          totalPrice: mainInfo.totalPrice,
          nameGroup: mainInfo.nameGroup,
          code: mainInfo.code,
          status: mainInfo.status,
          link: mainInfo.link,
        });

        const memberList = data.crudGroupOrderResponseList.map((member: any) => ({
          memberId: member.memberId,
          name: member.name,
          amount: member.amount,
          isPaid: member.isPaid,
          isLeader: member.isLeader,
          status: member.status,
          typePayment: member.typePayment,
          cartItems: member.crudCartGroupResponse?.listCartItemGroup || [],
        }));
        setMembers(memberList);
      } catch (err) {
        console.error('Error fetching group order details:', err);
        setError('Không thể tải chi tiết đơn hàng nhóm.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupOrderDetails();
  }, [groupOrderId]);

  if (loading) return <ActivityIndicator size="large" color="#FF9800" />;
  if (error) return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <IconM name="arrow-back" size={24} color="#FF9800" />
        </TouchableOpacity>
        <Text style={styles.header}>{t('orderDetail')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{t('groupOrder.nameGroup')}: {groupOrder?.nameGroup}</Text>
        <Text style={styles.text}>{t('groupOrder.code')}: {groupOrder?.code}</Text>
        <Text style={styles.text}>{t('groupOrder.leader')}: {groupOrder?.nameLeader}</Text>
        <Text style={styles.text}>{t('address')}: {groupOrder?.address}</Text>
        <Text style={styles.text}>{t('orderContent.price')}: {formatPrice(groupOrder?.totalPrice ?? 0)}</Text>
        <Text style={styles.text}>
          {t('common.status')}: {language === 'VN' ? statusMapVN[groupOrder?.status || ''] || groupOrder?.status : groupOrder?.status}
        </Text>
      </View>

      {members.map((member) => (
        <View key={member.memberId} style={styles.section}>
          <Text style={styles.subTitle}>{member.name} {member.isLeader ? `(${t('groupOrder.leader')})` : ''}</Text>
          <Text style={styles.text}>{t('orderContent.price')}: {formatPrice(member.amount)}</Text>
          <Text style={styles.text}>{t('paymentMethod')}: {member.typePayment}</Text>
          <Text style={styles.text}>{t('common.status')}: {language === 'VN' ? statusMapVN[member.status] || member.status : member.status}</Text>
          {member.cartItems.map((item) => (
            <View key={item.cartItemGroupId} style={styles.itemBox}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.proName}</Text>
                <Text style={styles.itemDetail}>{t('quantity')}: {item.quantity}</Text>
                <Text style={styles.itemDetail}>{t('size')}: {item.size}</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontFamily: FONTFAMILY.lobster_regular,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_bold,
    marginBottom: 4,
    color: '#0275d8',
  },
  subTitle: {
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#5cb85c',
    marginBottom: 4,
  },
  text: {
    fontSize: 18,
    fontFamily: FONTFAMILY.dongle_light,
    color: '#555',
    marginBottom: 2,
  },
  itemBox: {
    flexDirection: 'row',
    backgroundColor: '#fdfdfd',
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#333',
  },
  itemDetail: {
    fontSize: 18,
    fontFamily: FONTFAMILY.dongle_light,
    color: '#666',
  },
  itemPrice: {
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#d9534f',
  },
});

export default OrderGroupDetail;
