import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from "../store/store";
import { useTranslation } from 'react-i18next';

interface OrderCountProps {
  onDataFetched: (counts: OrderCounts) => void;
}

interface OrderCounts {
  confirmed: number;
//   waiting: number;
  cancelled: number;
  pending: number;
  refunded: number;
}

const OrderCount: React.FC<OrderCountProps> = ({onDataFetched }) => {
  const { language, userId } = useCategoryStore();
  const [orderCounts, setOrderCounts] = useState<OrderCounts>({
    confirmed: 0,
    // waiting: 0,
    cancelled: 0,
    pending: 0,
    refunded: 0,
  });

  useEffect(() => {
    const fetchOrderCounts = async () => {
        const token = await AsyncStorage.getItem('access_token');
      try {
        const [confirmedRes, cancelledRes, pendingRes, refundedRes] = await Promise.all([
          axiosInstance.get(`/orders/view/confirmed/${userId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        //   axiosInstance.get(`/orders/list-waiting/${userId}`, {
        //     headers: { 
        //       Authorization: `Bearer ${token}`,
        //       Accept: 'application/json',
        //       'Content-Type': 'application/json',
        //     },
        //   }),
          axiosInstance.get(`/orders/view/order-cancel/payment-have/${userId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
          }),
          axiosInstance.get(`/orders/view/fetchOrdersAwaiting/${userId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axiosInstance.get(`/orders/view/order-cancel/payment-refund-user/${userId}?language=${language}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: '*/*' },
          }),
        ]);

        const newOrderCounts = {
          confirmed: confirmedRes.data.total || 0,
        //   waiting: waitingRes.data.total || 0,
          cancelled: cancelledRes.data.total || 0,
          pending: pendingRes.data.total || 0,
          refunded: refundedRes.data.total || 0,
        };

        setOrderCounts(newOrderCounts);
        onDataFetched(newOrderCounts);
      } catch (error) {
        console.error('Lỗi khi fetch số lượng đơn hàng:', error);
      }
    };

    fetchOrderCounts();
  }, [userId, language]);

  return null; // Không cần render gì cả, chỉ cần gọi API và truyền dữ liệu lên component cha
};

export default OrderCount;
