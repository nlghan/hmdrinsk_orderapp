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
  note: string;
  orderDate: string;
  deadlinePayment: string;
  typeGroupOrder: string;
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
  const [shipmentDetail, setShipmentDetail] = useState<any>(null);
  const [paymentDetail, setPaymentDetail] = useState<any>(null);

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== 'number' || isNaN(price)) return '0đ';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  };

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
          `/group-order/fetch-all/${groupOrderId}?language=${language}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data;
        const mainInfo = data.groupOrderDetail;

        setGroupOrder({
          groupOrderId: mainInfo.groupOrderId,
          nameLeader: mainInfo.nameLeader,
          address: mainInfo.address,
          totalPrice: mainInfo.totalPrice,
          nameGroup: mainInfo.nameGroup,
          code: mainInfo.code,
          status: mainInfo.status,
          link: mainInfo.link,
          note: mainInfo.note,
          orderDate: mainInfo.orderDate,
          deadlinePayment: mainInfo.deadlinePayment,
          typeGroupOrder: mainInfo.typeGroupOrder,
        });

        setShipmentDetail(data.shipmentGroupDetail || null);
        setPaymentDetail(data.paymentDetail || null);

        const memberList = data.listMemberDetail.map((member: any) => ({
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
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <IconM name="arrow-back" size={20} color="#FF9800" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('orderDetail')}</Text>
        </View>
      </View>

      {/* Group Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('android.detail.infoGroup')}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('android.detail.nameGroup')}:</Text>
          <Text style={styles.value}>{groupOrder?.nameGroup}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('android.status_label.leader')}:</Text>
          <Text style={styles.value}>{groupOrder?.nameLeader}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('android.detail.typeGroup')}:</Text>
          <Text style={styles.value}>{groupOrder?.typeGroupOrder}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('note')}:</Text>
          <Text style={styles.value}>{groupOrder?.note || 'Không có ghi chú'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('deadlinePayment')}:</Text>
          <Text style={styles.value}>{groupOrder?.deadlinePayment}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('common.status')}:</Text>
          <Text style={styles.value}>
            {language === 'VN' ? statusMapVN[groupOrder?.status || ''] || groupOrder?.status : groupOrder?.status}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('address')}:</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.value}>{groupOrder?.address || 'Không có địa chỉ'}</Text>
        </View>
      </View>

      {/* Shipment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('orderContent.deliveryInfo')}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('history.shipper')}</Text>
          <Text style={styles.value}>{shipmentDetail?.nameShipper || 'Không có'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('phone')}</Text>
          <Text style={styles.value}>{shipmentDetail?.phoneNumber || 'Không có'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('history.delivery_date')}</Text>
          <Text style={styles.value}>{shipmentDetail?.dateShipped || 'Không có'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('common.status')}</Text>
          <Text style={styles.value}>{shipmentDetail?.status || 'Không có'}</Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('infoPayment')}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('history.total_price')}</Text>
          <Text style={styles.value}>{formatPrice(paymentDetail?.amount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('paymentMethod')}:</Text>
          <Text style={styles.value}>{paymentDetail?.paymentMethod || 'Không có'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('common.status')}:</Text>
          <Text style={styles.value}>{paymentDetail?.statusPayment || 'Không có'}</Text>
        </View>
      </View>

      {/* Member Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.proList')}</Text>
        {members.map((member) => (
          <View key={member.memberId} style={styles.section}>
            <Text style={styles.subTitle}>
              {member.name} {member.isLeader ? `(${t('android.status_label.leader')})` : ''}
            </Text>
            <Text style={styles.text}>{t('orderContent.price')}: {formatPrice(member.amount)}</Text>
            {member.cartItems.length === 0 ? (
              <Text style={{ fontStyle: 'italic', marginLeft: 10, color: 'gray' }}>
                {t('history.empty_list')}
              </Text>
            ) : (
              member.cartItems.map((item) => (
                <View key={item.cartItemGroupId} style={styles.itemBox}>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.proName}</Text>
                    <Text style={styles.itemDetail}>{t('quantity')}: {item.quantity}</Text>
                    <Text style={styles.itemDetail}>{t('size')}: {item.size}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}
      </View>
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
    fontSize: 24,
    fontFamily: FONTFAMILY.lobster_regular,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  backIcon: {
    marginRight: 10,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
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
    fontSize: 24,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#5cb85c',
    marginBottom: 4,
  },
  text: {
    fontSize: 24,
    fontFamily: FONTFAMILY.dongle_regular,
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
    fontSize: 22,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#333',
  },
  itemDetail: {
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_light,
    color: '#666',
  },
  itemPrice: {
    fontSize: 20,
    fontFamily: FONTFAMILY.dongle_bold,
    color: '#d9534f',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginBottom: 16,
    position: 'relative',
  },

  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTFAMILY.lobster_regular,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontFamily: FONTFAMILY.dongle_regular,
    fontSize: 26,
    lineHeight: 18,
    color: '#444',
  },
  value: {
    fontFamily: FONTFAMILY.dongle_light,
    fontSize: 26,
    lineHeight: 18,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTFAMILY.lobster_regular,
    marginBottom: 5,
    color: '#0275d8',
  },
   subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#5cb85c',
    },

});

export default OrderGroupDetail;
