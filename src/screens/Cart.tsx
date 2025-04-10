import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCartStore } from '../store/useCartStore';  // Import your store here
import { BORDERRADIUS, COLORS, FONTFAMILY, SPACING } from '../theme/theme';
import EmptyListAnimation from '../components/EmptyListAnimation';
import { useCategoryStore } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import styles from '../styles/cartStyles';
import { Swipeable } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import Notification from '../components/Notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/axiosInstance';

interface CartItem {
    cartItemId: number;
    cartId: number;
    proId: number;
    proName: string;
    size: string;
    quantity: number;
    totalPrice: number;
    total: number;
    imageUrl?: string;
    selected: boolean;
}

const groupCartItems = (cart: CartItem[]) => {
    const groupedItems: { [key: number]: CartItem[] } = {};
    cart.forEach((item) => {
        if (!groupedItems[item.proId]) {
            groupedItems[item.proId] = [];
        }
        groupedItems[item.proId].push(item);
    });
    return Object.values(groupedItems);
};

const Cart = () => {
    const { cart, fetchCartItem, setCoin, createOrder, idCartPause, idOrderPause, currentCartId } = useCartStore();  // Add createOrder from store
    const [useShopeeXu, setUseShopeeXu] = useState(false);
    const { data, userId } = useCategoryStore();
    const { userCoin } = data;
    const shopeeXuAmount = userCoin ?? 0;
    const halfShopeeXuAmount = shopeeXuAmount * 0.5;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { selectedVoucher } = useCartStore();
    const { selectedVoucherKey, selectedVoucherDiscountAmount } = selectedVoucher;

    const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
    const [note, setNote] = useState('');  // State for note input
    const { t } = useTranslation();
    const { cartTotal } = useCartStore();
    const [inputCoin, setInputCoin] = useState<string>('');  // state riêng cho giá trị xu nhập vào

    const [notification, setNotification] = useState({ message: '', visible: false });
    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
        // Ẩn thông báo sau 3 giây
        setTimeout(() => setNotification({ ...notification, visible: false }), 4000);
    };


    console.log("Id cart pause:" + idCartPause);

    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    useEffect(() => {
        fetchCartItem();
    }, []);

    const updateQuantity = async (cartItemId: number, type: 'increase' | 'decrease') => {
        try {
            const { increaseQuantity, decreaseQuantity } = useCartStore.getState();
            if (type === 'increase') {
                await increaseQuantity(cartItemId);
            } else {
                await decreaseQuantity(cartItemId);
            }
        } catch (error) {
            console.error("❌ Error updating quantity:", error);
        }
    };

    const updateQuantityManual = async (cartItemId: number, newQuantity: number) => {
        try {
            const { updateQuantity } = useCartStore.getState();
            await updateQuantity(cartItemId, newQuantity);
        } catch (error) {
            console.error("❌ Error updating quantity:", error);
        }
    };

    const handleInputChange = (cartItemId: number, value: string) => {
        setInputValues((prev) => ({
            ...prev,
            [cartItemId]: value,
        }));
    };

    const handleSubmit = (cartItemId: number) => {
        const newQuantity = parseInt(inputValues[cartItemId] || '1');
        updateQuantityManual(cartItemId, newQuantity);
        setInputValues((prev) => ({ ...prev, [cartItemId]: '' }));
    };


    const handleInputShopeeXu = (value: string) => {
        const numericValue = parseInt(value, 10);

        // Nếu người dùng nhập vào một giá trị hợp lệ hoặc chuỗi rỗng
        if (value === '') {
            setInputCoin('');  // Đặt lại giá trị xu về chuỗi rỗng khi xóa hết
        } else if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= halfShopeeXuAmount) {
            setInputCoin(value);  // Cập nhật giá trị xu nhập vào nếu hợp lệ
        } else if (numericValue > halfShopeeXuAmount) {
            setInputCoin('');  // Đặt lại giá trị khi nhập vượt quá giới hạn
            showNotification(`Số xu bạn nhập vượt quá 50% số xu tích lũy`);
        }
    };



    const handleSubmitCoin = async () => {
        const numericCoin = parseInt(inputCoin, 10);
        if (isNaN(numericCoin) || numericCoin < 0 || numericCoin > shopeeXuAmount) {
            setCoin(0);
            setUseShopeeXu(false);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            if (currentCartId === idCartPause) {
                const orderId = idOrderPause;

                console.log('📦 Gửi yêu cầu add xu vào đơn hàng tạm dừng...');
                console.log('🧾 orderId:', orderId);
                console.log('🪙 pointCoinUse:', numericCoin);

                const response = await axiosInstance.post(
                    '/orders/order_pause/add_coin',
                    {
                        userId,               // Đảm bảo biến userId đã khai báo đúng ở ngoài
                        orderId,
                        pointCoinUse: numericCoin,
                    },
                    { headers }
                );

                console.log('✅ Phản hồi từ API:', response.data);

                if (response.status !== 200) {
                    throw new Error('Lỗi khi áp dụng xu cho đơn hàng tạm dừng');
                }

                setUseShopeeXu(true);
                showNotification('Đã áp dụng xu cho đơn hàng!');
            } else {
                setCoin(numericCoin);
                setUseShopeeXu(true);
            }
        } catch (error) {
            console.error("❌ Error applying coin:", error);
            showNotification('Có lỗi khi áp dụng xu!');
        }
    };


    const groupedCart = groupCartItems(cart);
    const totalCartPrice = groupedCart.reduce(
        (sum, group) =>
            sum + group.reduce((groupSum, item) => groupSum + item.totalPrice, 0),
        0
    );

    const finalTotal = useShopeeXu
        ? Math.max(0, totalCartPrice - (selectedVoucherDiscountAmount || 0) - parseInt(inputCoin || '0'))
        : Math.max(0, totalCartPrice - (selectedVoucherDiscountAmount || 0));


    const renderItem = ({ item }: { item: CartItem[] }) => {
        const totalPrice = item.reduce((sum, i) => sum + i.totalPrice, 0);

        return (
            <Swipeable
                renderRightActions={() => (
                    <View style={styles.swipeActions}>
                        {item.map((sizeItem) => (
                            <View key={sizeItem.size} style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    style={styles.selectButton}
                                    onPress={async () => {
                                        sizeItem.selected = !sizeItem.selected;
                                        if (sizeItem.selected) {
                                            await useCartStore.getState().deleteCartItem(sizeItem.cartItemId);
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>
                                        <Icon name="delete" size={20} color="black" />
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            >
                <View style={styles.cartItem}>
                    <View style={styles.productContainer}>
                        <Image
                            source={{ uri: item[0].imageUrl }}
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: BORDERRADIUS.radius_15,
                                marginRight: 10,
                            }}
                        />

                        <View style={styles.productInfo}>
                            <Text numberOfLines={2} style={styles.productName}>
                                {item[0].proName}
                            </Text>
                            {item.map((sizeItem) => (
                                <View key={sizeItem.size} style={styles.sizeContainer}>
                                    <Text style={styles.sizeText}>{t('size')}: {sizeItem.size}</Text>

                                    {/* Picker to allow the user to select a new size */}
                                    <Picker
                                        selectedValue={sizeItem.size}
                                        style={styles.picker}
                                        onValueChange={async (itemValue) => {
                                            // Update selected size for the cart item
                                            sizeItem.size = itemValue;
                                            await useCartStore.getState().changeSize(sizeItem.cartItemId, itemValue);
                                        }}
                                    >
                                        <Picker.Item label="S" value="S" />
                                        <Picker.Item label="M" value="M" />
                                        <Picker.Item label="L" value="L" />
                                    </Picker>

                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(sizeItem.cartItemId, 'decrease')}
                                            style={styles.quantityButton}
                                        >
                                            <Icon name="remove" size={18} color="#000" />
                                        </TouchableOpacity>

                                        <TextInput
                                            style={styles.quantityInput}
                                            keyboardType="numeric"
                                            value={inputValues[sizeItem.cartItemId] || String(sizeItem.quantity)}
                                            onFocus={() => handleInputChange(sizeItem.cartItemId, '')}  // Clear input value when clicked
                                            onChangeText={(text) => handleInputChange(sizeItem.cartItemId, text)}  // Handle input changes
                                            onSubmitEditing={() => handleSubmit(sizeItem.cartItemId)}  // Submit editing and update quantity
                                        />

                                        <TouchableOpacity
                                            onPress={() => updateQuantity(sizeItem.cartItemId, 'increase')}
                                            style={styles.quantityButton}
                                        >
                                            <Icon name="add" size={18} color="#000" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            <Text style={styles.discountPrice}>{formatPrice(totalPrice)}đ</Text>
                        </View>
                    </View>
                </View>
            </Swipeable>
        );
    };

    const handleCreateOrder = async () => {
        try {
            // Nếu đã có đơn hàng đang bị pause thì dùng luôn
            if (idOrderPause && idCartPause) {
                console.log("🔁 Điều hướng tới đơn hàng đã tồn tại với orderId:", idOrderPause);
                navigation.navigate('Payment', { orderId: idOrderPause });
                return;
            }

            // Ngược lại, tạo đơn hàng mới
            const orderId = await createOrder(note);  // Nhận orderId từ API

            if (!orderId) {
                throw new Error("❌ orderId không hợp lệ.");
            }

            const orderIdNumber = Number(orderId); // Ép kiểu orderId thành number
            if (isNaN(orderIdNumber)) {
                throw new Error("❌ orderId không phải là số hợp lệ.");
            }

            await fetchCartItem();  // Cập nhật giỏ hàng sau khi đặt hàng
            console.log("✅ Tạo đơn hàng thành công với orderId:", orderIdNumber);

            // Chuyển sang màn hình Payment và truyền orderId dạng số
            navigation.navigate('Payment', { orderId: orderIdNumber });

        } catch (error) {
            console.error("❌ Lỗi khi tạo đơn hàng:", error);
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // Cho iOS và Android
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Cần chỉnh nếu bạn có header
        >
            <View style={styles.container}>
                <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ ...notification, visible: false })} />
                {(!cart || cart.length === 0) ? (
                    <EmptyListAnimation title={t('cart.empty')} />
                ) : (
                    <>
                        <View style={styles.flatlistContainer}>
                            <View style={styles.headerContainer}>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Icon name="arrow-back" size={24} color={COLORS.primaryGreenHex} />
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>{t('cart.title')}</Text>
                                <TouchableOpacity onPress={async () => await useCartStore.getState().deleteAllCartItems()}>
                                    <Icon name="delete" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={groupedCart}
                                renderItem={renderItem}
                                keyExtractor={(item) => item[0].proId.toString()}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                        <View style={styles.footer}>
                            <View style={styles.voucherContainer}>
                                <TouchableOpacity
                                    style={styles.voucherButton}
                                    onPress={() => navigation.navigate("ListVoucher")}
                                >
                                    <View style={styles.voucherLabel}>
                                        <Icon name="local-offer" size={20} color={COLORS.primaryGreenHex} />
                                        <Text style={styles.voucherText}>{t('cart.voucher')}</Text>
                                    </View>

                                    <View style={styles.voucherRight}>
                                        <Text style={styles.voucherChooseText}>
                                            {selectedVoucherKey ? selectedVoucherKey : t('products.select')}
                                        </Text>
                                        {selectedVoucherKey && (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    if (idCartPause === currentCartId) {
                                                        // Nếu là đơn đang tạm dừng, gọi API xoá voucher
                                                        try {
                                                            const token = await AsyncStorage.getItem("access_token");

                                                            const response = await axiosInstance.post(
                                                                `/orders/order_pause/add_voucher`,
                                                                {
                                                                    userId: userId,
                                                                    orderId: idOrderPause,
                                                                    voucherId: -1,
                                                                },
                                                                {
                                                                    headers: {
                                                                        Authorization: `Bearer ${token}`,
                                                                    },
                                                                }
                                                            );
                                                            useCartStore.setState({
                                                                selectedVoucher: {
                                                                    selectedVoucherId: null,
                                                                    selectedVoucherKey: null,
                                                                    selectedVoucherDiscountAmount: 0,
                                                                },
                                                            });
                                                            console.log("🗑️ Xoá voucher thành công:", response.data);
                                                        } catch (error) {
                                                            console.error("❌ Lỗi khi xoá voucher khỏi đơn tạm:", error);
                                                        }
                                                    } else {
                                                        // Nếu không phải đơn tạm, xử lý như bình thường
                                                        useCartStore.setState({
                                                            selectedVoucher: {
                                                                selectedVoucherId: null,
                                                                selectedVoucherKey: null,
                                                                selectedVoucherDiscountAmount: 0,
                                                            },
                                                        });
                                                    }
                                                }}
                                            >
                                                <Icon name="close" size={18} color="gray" style={styles.closeIcon} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.coinContainer}>
                                <View style={styles.coinLeft}>
                                    <Icon name="stars" size={22} color="#FFAA00" />
                                    <Text style={styles.coinText}>{t('cart.coin')} ({shopeeXuAmount} {t('cart.coinname')})</Text>
                                </View>

                                <TextInput
                                    style={styles.coinInput}
                                    keyboardType="numeric"
                                    placeholder={halfShopeeXuAmount ? halfShopeeXuAmount.toString() : 'Nhập số xu'} // Chuyển số thành chuỗi hoặc sử dụng giá trị mặc định
                                    value={inputCoin}
                                    onChangeText={handleInputShopeeXu}
                                    onSubmitEditing={handleSubmitCoin}
                                    returnKeyType="done"
                                />

                            </View>

                            {/* Note input */}
                            <View style={styles.noteContainer}>
                                <TextInput
                                    style={styles.noteInput}
                                    placeholder={t('takeNote')}
                                    value={note}
                                    onChangeText={setNote}
                                />
                            </View>

                            <View style={styles.paymentContainer}>
                                <Text style={styles.totalText}>
                                    {t('order.orderDetail.sum')}: <Text style={styles.totalAmount}>{formatPrice(finalTotal)}đ </Text>
                                </Text>

                                <TouchableOpacity style={styles.checkoutButton} onPress={handleCreateOrder}>
                                    <Text style={styles.checkoutText}>{t('buy')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default Cart;
