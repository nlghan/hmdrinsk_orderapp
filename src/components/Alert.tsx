import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FONTFAMILY } from '../theme/theme';

interface AlertProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    title?: string;
    onConfirm?: () => void;
}

const Alert: React.FC<AlertProps> = ({
    visible,
    message,
    onClose,
    title,
    onConfirm,
}) => {
    const { t } = useTranslation();
    const displayTitle = title ?? t('common.noti');

    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 120,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 120,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);


    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Text style={styles.title}>{displayTitle}</Text>

                    <View style={styles.notificationItem}>
                        <Text style={styles.message}>{message}</Text>
                        {/* <Text style={styles.time}>{item.time}</Text>                                     */}
                    </View>
                    <View style={styles.buttonContainer}>
                        {onConfirm ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelText}>
                                        {t('order.orderDetail.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={onConfirm}
                                >
                                    <Text style={styles.confirmText}>
                                        {t('order.orderDetail.confirm')}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.confirmText}>{t('close')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: '#FFF6EE',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontFamily: FONTFAMILY.lobster_regular,
        color: '#E35D11',
        marginBottom: 5,
        textAlign: 'center',
    },
    message: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_regular,
        color: '#333',
        textAlign: 'center',
        lineHeight:20
        
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop:12
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: 'rgba(233, 102, 20, 0.87)',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    confirmText: {
        color: 'white',
        fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 24,
    },
    cancelText: {
        color: '#333',
       fontFamily: FONTFAMILY.dongle_bold,
        fontSize: 24,
    },
    notificationItem: {
        padding: 12,
        marginVertical: 6,
        backgroundColor: 'rgba(255, 232, 218, 0.87)', //  Cam nhạt đẹp mắt
        borderRadius: 6,
        width: '100%',
    },
});

export default Alert;
