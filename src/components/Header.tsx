import React from 'react'
import { TouchableOpacity, View, Text, Image } from 'react-native';
import homeStyles from '../styles/home';
import { COLORS } from '../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { useCartStore } from '../store/useCartStore';

const Header = ({ style }: { style?: object }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { cartTotal } = useCartStore();
    const { t } = useTranslation();
    return (
        <View style={[homeStyles.header, style]}>
            <View style={homeStyles.logoContainer}>
                <Image source={require('../assets/app_images/logomini.png')} style={homeStyles.logo} />
                <Text style={homeStyles.greeting}>{t('common.greet') ?? 'Hello'}</Text>
            </View>

            <View style={homeStyles.headerIcons}>
                <TouchableOpacity style={homeStyles.iconButton} onPress={() => {
                     // ✅ Hủy chọn khi chuyển trang
                    navigation.navigate('Cart');
                }}>
                    <Icon name="shopping-cart" size={20} color={COLORS.primaryGreenHex} />
                    <Text style={homeStyles.iconText}>{cartTotal}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={homeStyles.iconButton}>
                    <Text>
                        <Icon name="notifications" size={20} color={COLORS.blackAlpha} />
                    </Text>
                    <View style={homeStyles.notificationDot} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Header;
