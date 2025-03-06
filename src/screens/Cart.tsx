import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
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
    const { cart, fetchCartItem, setCoin, createOrder } = useCartStore();  // Add createOrder from store
    const [useShopeeXu, setUseShopeeXu] = useState(false);
    const { data } = useCategoryStore();
    const { userCoin } = data;
    const shopeeXuAmount = userCoin ?? 0;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { selectedVoucher } = useCartStore();
    const { selectedVoucherKey, selectedVoucherDiscountAmount } = selectedVoucher;

    const [inputValues, setInputValues] = useState<{ [key: number]: string }>({});
    const [note, setNote] = useState('');  // State for note input

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

    const handleToggleShopeeXu = () => {
        setUseShopeeXu(prevState => {
            const newUseShopeeXu = !prevState; // Đảo trạng thái
            // Cập nhật số xu đã sử dụng vào store khi toggle
            if (newUseShopeeXu) {
                setCoin(shopeeXuAmount); // Dùng hết số xu nếu bật
            } else {
                setCoin(0); // Không dùng xu khi tắt
            }
            return newUseShopeeXu;
        });
    };

    const groupedCart = groupCartItems(cart);
    const totalCartPrice = groupedCart.reduce(
        (sum, group) =>
            sum + group.reduce((groupSum, item) => groupSum + item.totalPrice, 0),
        0
    );

    const finalTotal = useShopeeXu
        ? Math.max(0, totalCartPrice - (selectedVoucherDiscountAmount || 0) - shopeeXuAmount)
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
                                    <Text style={styles.sizeText}>Size: {sizeItem.size}</Text>

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
                            <Text style={styles.discountPrice}>{totalPrice} VND</Text>
                        </View>
                    </View>
                </View>
            </Swipeable>
        );
    };

    const handleCreateOrder = async () => {
        try {
            const order = await createOrder(note);  // Gọi API tạo đơn hàng
    
            await fetchCartItem();  // Cập nhật giỏ hàng sau khi đặt hàng
            console.log("✅ Đặt hàng thành công:", order);
    
            // Chuyển sang màn hình Payment và truyền thông tin order
            navigation.navigate('Payment');
        } catch (error) {
            console.error("❌ Lỗi khi tạo đơn hàng:", error);
        }
    };
    

    return (
        <View style={styles.container}>
            {(!cart || cart.length === 0) ? (
                <EmptyListAnimation title={'Danh sách trống'} />
            ) : (
                <>
                    <View style={styles.flatlistContainer}>
                        <View style={styles.headerContainer}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Icon name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Giỏ hàng</Text>
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
                                    <Text style={styles.voucherText}>Voucher</Text>
                                </View>

                                <View style={styles.voucherRight}>
                                    <Text style={styles.voucherChooseText}>
                                        {selectedVoucherKey ? selectedVoucherKey : "Chọn hoặc nhập mã"}
                                    </Text>
                                    {selectedVoucherKey && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                useCartStore.setState({
                                                    selectedVoucher: {
                                                        selectedVoucherId: null,
                                                        selectedVoucherKey: null,
                                                        selectedVoucherDiscountAmount: 0,
                                                    },
                                                });
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
                                <Icon name="stars" size={24} color="#FFAA00" />
                                <Text style={styles.coinText}>Xu ({shopeeXuAmount} Xu)</Text>
                            </View>

                            <TouchableOpacity onPress={handleToggleShopeeXu}>
                                <Icon
                                    name={useShopeeXu ? "toggle-on" : "toggle-off"}
                                    size={30}
                                    color={useShopeeXu ? COLORS.primaryDarkHex : "#ccc"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Note input */}
                        <View style={styles.noteContainer}>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Nhập ghi chú..."
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>

                        <View style={styles.paymentContainer}>
                            <Text style={styles.totalText}>
                                Tổng: <Text style={styles.totalAmount}>{finalTotal} VND</Text>
                            </Text>

                            <TouchableOpacity style={styles.checkoutButton} onPress={handleCreateOrder}>
                                <Text style={styles.checkoutText}>Mua hàng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

export default Cart;
