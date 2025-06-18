import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    LogBox
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
import Loading from '../components/DotLoading';
import { useAlertStore } from '../store/alertStore';
import { scale, verticalScale, moderateScale, moderateVerticalScale } from 'react-native-size-matters';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs();

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
    const { data, userId, fetchUserCoin } = useCategoryStore();
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
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);


    const [notification, setNotification] = useState({ message: '', visible: false });
    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
        // Ẩn thông báo sau 3 giây
        setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    };


    console.log("Id cart pause:" + idCartPause);

    const formatPrice = (price: number) => {
        return (price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + 'đ';
    };

    useEffect(() => {
        fetchCartItem();
    }, []);

    const updateQuantity = async (cartItemId: number, type: 'increase' | 'decrease') => {
        setLoading(true); // Bắt đầu quá trình tăng giảm
        try {
            const { increaseQuantity, decreaseQuantity } = useCartStore.getState();

            // Gọi phương thức tương ứng để tăng hoặc giảm số lượng
            if (type === 'increase') {
                // Nếu increaseQuantity là một thao tác bất đồng bộ, bạn nên chờ nó hoàn thành
                await increaseQuantity(cartItemId);  // Nếu tăng số lượng
            } else {
                // Nếu decreaseQuantity là một thao tác bất đồng bộ, bạn nên chờ nó hoàn thành
                await decreaseQuantity(cartItemId);  // Nếu giảm số lượng
            }
        } catch (error) {
            console.error("❌ Error updating quantity:", error);
        } finally {
            setLoading(false); // Đảm bảo rằng setLoading(false) chỉ được gọi sau khi thao tác đã hoàn tất
        }
    };


    const updateQuantityManual = async (cartItemId: number, newQuantity: number) => {
        const { updateQuantity } = useCartStore.getState();
        await updateQuantity(cartItemId, newQuantity); // Nếu lỗi sẽ tự throw lên
    };


    const handleInputChange = (cartItemId: number, value: string) => {
        setInputValues((prev) => ({
            ...prev,
            [cartItemId]: value,
        }));
    };
    const inputRefs = useRef<{ [key: number]: TextInput | null }>({});


    const handleSubmit = async (cartItemId: number) => {
        setLoading(true); // Start the processing

        // Save the initial value of the input before update
        const previousQuantity = inputValues[cartItemId] || '1'; // Default to '1' if no value

        try {
            // Get the new quantity value, defaulting to 1 if not provided
            const newQuantity = parseInt(inputValues[cartItemId] || '1', 10);

            // Check if the value is valid (not a number or less than 1)
            if (isNaN(newQuantity) || newQuantity <= 0) {
                throw new Error("Invalid value");
            }

            // Update the quantity
            await updateQuantityManual(cartItemId, newQuantity);

            // Update the input values with the new quantity
            setInputValues((prev) => ({ ...prev, [cartItemId]: String(newQuantity) }));
        } catch (error: unknown) {
            console.error("❌ Error updating quantity:", error);

            let errorMessage = 'Có lỗi xảy ra. Bạn muốn quay lại giá trị cũ?';

            // Kiểm tra nếu error là instance của Error
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            useAlertStore.getState().showAlert(
                t('android.mess.title7'),
                errorMessage,
                () => {
                    setInputValues((prev) => ({
                        ...prev,
                        [cartItemId]: previousQuantity,
                    }));
                    setTimeout(() => {
                        inputRefs.current[cartItemId]?.focus();
                    }, 100);
                },
                () => { } // Không làm gì khi hủy (nếu không có nút hủy, bạn có thể bỏ qua hoặc để trống)
            );

        }
        finally {
            setLoading(false); // End the processing
        }
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
            showNotification(t('cart.userCoinExceed'));
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
                                    onPress={() => {
                                        useAlertStore.getState().showAlert(
                                            t('cart.deletedOne'),
                                            t('android.mess.check8'),
                                            () => {
                                                sizeItem.selected = !sizeItem.selected;

                                                if (sizeItem.selected) {
                                                    void useCartStore.getState().deleteCartItem(sizeItem.cartItemId);
                                                }
                                            },
                                            undefined, // Không xử lý gì nếu hủy
                                        );

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
                                            ref={(ref) => (inputRefs.current[sizeItem.cartItemId] = ref)}
                                            style={styles.quantityInput}
                                            keyboardType="numeric"
                                            value={inputValues[sizeItem.cartItemId] || String(sizeItem.quantity)}
                                            onFocus={() => handleInputChange(sizeItem.cartItemId, '')}
                                            onChangeText={(text) => handleInputChange(sizeItem.cartItemId, text)}
                                            onSubmitEditing={() => handleSubmit(sizeItem.cartItemId)}
                                            selectTextOnFocus
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
                            <Text style={styles.discountPrice}>
                                {loading ? '...' : formatPrice(totalPrice)}
                            </Text>
                        </View>
                    </View>
                </View>
            </Swipeable>
        );
    };

    const handleCreateOrder = async () => {
        try {
            setIsLoading(true);

            if (idOrderPause && idCartPause) {
                console.log("🔁 Resume paused order:", idOrderPause);
                useCartStore.getState().cart = [];
                useCartStore.getState().cartTotal = 0;
                fetchUserCoin();
                navigation.navigate('Payment', { orderId: idOrderPause });
                return;
            }

            const result = await createOrder(note);
            console.log("📦 createOrder result:", result);

            if (!result.orderId) {
                const { errorCode, errorData } = result;
                console.error("❌ Error creating order:", errorCode, " - ", errorData);
                switch (errorCode) {
                    case 'STOCK_ERROR':
                        showNotification(
                            t('cart.notEnoughProduct', {
                                product: errorData.product,
                                size: errorData.size,
                                requested: errorData.requested,
                                available: errorData.available
                            })
                        );
                        break;
                    case 'Distance exceeded, please update address':
                        showNotification(t('cart.distanceExceeded'));
                        navigation.navigate('Info');
                        break;
                    case 'User coin exceed':
                        showNotification(t('cart.userCoinExceed'));
                        break;
                    case 'Voucher already in use':
                        showNotification(t('cart.voucherInUse'));
                        break;
                    case 'Voucher expired':
                        showNotification(t('cart.voucherExpired'));
                        break;
                    case 'Voucher is deleted':
                        showNotification(t('cart.voucherDeleted'));
                        break;
                    case 'Please no enter point coin':
                        showNotification(t('cart.noPointCoin'));
                        break;
                    case 'Please do not enter a coin amount less than 0. ':
                        showNotification(t('cart.negativeCoin'));
                        break;
                    case 'OUTSIDE_WORKING_HOURS':
                        showNotification(t('cart.outsideWorkingHours'));
                        break;
                    case 'MISSING_USER_OR_CART':
                    case 'MISSING_TOKEN':
                    case 'INVALID_ORDER_ID':
                    default:
                        showNotification(t('cart.generalError'));
                }

                return;
            }

            // Thành công
            const orderIdNumber = Number(result.orderId);
            fetchUserCoin();
            navigation.navigate('Payment', { orderId: orderIdNumber });

        } catch (error) {
            console.error("❌ Error creating order:", error);
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // Cho iOS và Android
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Cần chỉnh nếu bạn có header

        >
            {isLoading &&
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Overlay tối mờ
                    justifyContent: 'center',
                    zIndex: 999,  // Đảm bảo overlay nằm trên tất cả
                }}>
                    <Loading title={''} />
                </View>
            }
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
                                    placeholder={halfShopeeXuAmount ? halfShopeeXuAmount.toString() : t('cart.enterCoins')} // Chuyển số thành chuỗi hoặc sử dụng giá trị mặc định
                                    value={inputCoin}
                                    placeholderTextColor={'#999'}
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
                                    placeholderTextColor={'#999'}
                                    value={note}
                                    onChangeText={setNote}
                                />
                            </View>

                            <View style={styles.paymentContainer}>
                                <Text style={styles.totalText}>
                                    {t('order.orderDetail.sum')}:
                                    <Text style={styles.totalAmount}>
                                        {loading ? '...' : formatPrice(finalTotal)}
                                    </Text>
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
