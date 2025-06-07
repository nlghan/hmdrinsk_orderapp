import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axiosInstance from '../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCategoryStore } from '../store/store';
import IconM from 'react-native-vector-icons/MaterialIcons';
import { FONTFAMILY } from '../theme/theme';
import { useAlertStore } from '../store/alertStore';
import { useTranslation } from 'react-i18next';
import EmptyListAnimation from '../components/EmptyListAnimation';

interface Member {
    memberId: number;
    name: string;
    userId: number;
    dateDeleted: string;
}

const BlackList = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { groupOrderId } = route.params;
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, userId } = useCategoryStore();
     const { t } = useTranslation();

    const fetchBlackList = async () => {
        const token = await AsyncStorage.getItem('access_token');
        try {
            const res = await axiosInstance.get(`/group-order/blacklist`, {
                params: {
                    groupOrderId,
                    language,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: '*/*',
                },
            });

            const list = res.data.crudGroupOrderMemberDetailResponseList || [];
            const deletedMembers = list.filter((member: any) => member.isDeleted);
            setMembers(deletedMembers);
        } catch (error) {
            console.error('Error fetching blacklist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlackList();
    }, []);


    const handleUnblock = async (member: Member) => {
        const token = await AsyncStorage.getItem('access_token');
        const leaderId = userId; // Đảm bảo lấy đúng ID từ user hiện tại

        if (!leaderId || !groupOrderId || !member.userId || !token) {
            useAlertStore.getState().showAlert(
                t('common.error'),
                t('group.missingInfoToUnblock')
            );
            return;
        }

        useAlertStore.getState().showAlert(
            t('common.confirm'),
            t('android.group.confirmRestoreBlock', { name: member.name }), // ví dụ: "Bạn có chắc muốn bỏ chặn {name} không?"
            async () => {
                try {
                    await axiosInstance.put(
                        `/group-order/restore-blacklist`,
                        {
                            groupOrderId,
                            leaderId: Number(leaderId),
                            userId: member.userId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    useAlertStore.getState().showAlert(
                        t('common.noti'),
                        t('android.group.restoreBlacklistSuccess') // "Đã bỏ chặn thành viên."
                    );

                    fetchBlackList();
                } catch (error) {
                    console.error('Lỗi khi bỏ chặn:', error);
                    useAlertStore.getState().showAlert(
                        t('common.error'),
                        t('android.group.restoreBlacklistFailed') // "Bỏ chặn thất bại."
                    );
                }
            },
            () => { }
        );
    };



    const renderItem = ({ item }: { item: Member }) => (
        <View style={styles.notificationItem}>
            <View style={styles.notificationContent}>
                <Image
                    source={require("../assets/app_images/block.png")}
                    style={styles.avatar}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.date}>{t('android.group.blockAt')}: {item.dateDeleted}</Text>
                </View>
                <TouchableOpacity style={styles.unblockButton} onPress={() => handleUnblock(item)}>
                    <Text style={styles.unblockText}>{t('android.group.unblock')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <IconM name="arrow-back" size={20} color="#FF9800" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('android.group.blacklist')}</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : members.length === 0 ? (
                 <EmptyListAnimation title={t('history.empty_list')} />
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => item.memberId.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default BlackList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        paddingHorizontal: 12,
        paddingTop: 20,
    },
    list: {
        paddingBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    backIcon: {
        position: "absolute",
        left: 5,
        padding: 8,
        borderRadius: 10,
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: FONTFAMILY.lobster_regular,
        color: "#333",
    },
    notificationItem: {
        padding: 15,
        backgroundColor: "#fdfcf0",
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: "#FF9800",
    },
    notificationContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 50,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontFamily: FONTFAMILY.dongle_regular,
        color: "#424242",
    },
    date: {
        fontSize: 20,
        fontFamily: FONTFAMILY.dongle_light,
        color: "#757575",
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: "center",
        fontSize: 26,
        color: "#9E9E9E",
        fontFamily: FONTFAMILY.dongle_regular,
    },
    unblockButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'center',
    },
    unblockText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: FONTFAMILY.dongle_regular,
    },

});
