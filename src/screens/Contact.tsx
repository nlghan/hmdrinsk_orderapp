import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useCategoryStore } from "../store/store";
import IconM from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from 'react-i18next';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../navigation/RootStackParamList";


const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language, userId } = useCategoryStore();
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleChange = (key: string, value: string) => {
    setFormData(prevState => ({ ...prevState, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!userId) {
      setIsLoading(false);
      setShowLoginPrompt(true);
      return;
    }

    const contactData = {
      userId: userId,
      email: formData.email,
      phone: formData.phone,
      fullName: formData.name,
      description: formData.message
    };

    try {
      const token = await AsyncStorage.getItem('access_token');
      await axiosInstance.post(`/contact/create`, contactData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setIsLoading(false);
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setIsLoading(false);
      setShowError(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <IconM name="arrow-back" size={20} color="#FF9800" />
      </TouchableOpacity>
      {/* Thông tin liên hệ cửa hàng */}
      <Text style={styles.sectionTitle}>{t('infoContact')}</Text>

      <View style={styles.infoItem}>
        <Text style={styles.infoTitle}>{t('phoneNow')}</Text>
        <Text style={styles.infoText}>{t('notice')}</Text>
        <Text style={styles.infoText}>{t('phone')}: +84 123 456 789</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoTitle}>{t('sendContact')}</Text>
        <Text style={styles.infoText}>{t('solve')}</Text>
        <Text style={styles.infoText}>{t('email')}: contact@example.com</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoTitle}>{t('hours')}</Text>
        <Text style={styles.infoText}>{t('from')}</Text>
        <Text style={styles.infoText}>{t('from2')}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoTitle}>{t('address')}</Text>
        <Text style={styles.infoText}>{t('add')}</Text>
      </View>

      {/* Biểu mẫu liên hệ */}
      <Text style={styles.sectionTitle}>{t('contactUs')}</Text>

      <TextInput style={styles.input} placeholder={t('fullName')} placeholderTextColor="gray"
        value={formData.name} onChangeText={text => handleChange('name', text)} />
      <TextInput style={styles.input} placeholder={t('email')} placeholderTextColor="gray"
        keyboardType="email-address" value={formData.email} onChangeText={text => handleChange('email', text)} />
      <TextInput style={styles.input} placeholder={t('phone')} placeholderTextColor="gray"
        keyboardType="phone-pad" value={formData.phone} onChangeText={text => handleChange('phone', text)} />
      <TextInput style={[styles.input, styles.textArea]} placeholder={t('message')} placeholderTextColor="gray"
        multiline numberOfLines={4} value={formData.message} onChangeText={text => handleChange('message', text)} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('send')}</Text>}
      </TouchableOpacity>

      {/* Các modal thông báo */}
      <Modal visible={showSuccess} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{t('sendSuccess')}</Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)}>
              <Text style={styles.modalButton}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showError} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTextred}>{t('sendFail')}</Text>
            <TouchableOpacity onPress={() => setShowError(false)}>
              <Text style={styles.modalButton}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showLoginPrompt} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{t('messLogin')}</Text>
            <TouchableOpacity onPress={() => setShowLoginPrompt(false)}>
              <Text style={styles.modalButton}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  backIcon: {
    position: "absolute",
    top: 25,
    left: 10,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e67e22',
textAlign: 'center',
  },
  infoItem: {
    backgroundColor: '#fef5ec',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#f39c12',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d35400',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff8f3',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    color:'green'
  },
  modalTextred: {
    fontSize: 18,
    marginBottom: 10,
    color:'redred'
  },
  modalButton: {
    color: '#e67e22',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Contact;