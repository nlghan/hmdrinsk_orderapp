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

    const contactData = { userId, description: formData.message };

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
      <Text style={styles.title}>{t('contactUs')}</Text>

      <TextInput 
        style={styles.input} placeholder={t('fullName')} 
        value={formData.name} onChangeText={text => handleChange('name', text)} 
        placeholderTextColor="#999"
      />
      <TextInput 
        style={styles.input} placeholder={t('email')} keyboardType="email-address"
        value={formData.email} onChangeText={text => handleChange('email', text)}
        placeholderTextColor="#999"
      />
      <TextInput 
        style={styles.input} placeholder={t('phone')} keyboardType="phone-pad"
        value={formData.phone} onChangeText={text => handleChange('phone', text)}
        placeholderTextColor="#999"
      />
      <TextInput 
        style={[styles.input, styles.textArea]} placeholder={t('message')} multiline numberOfLines={4}
        value={formData.message} onChangeText={text => handleChange('message', text)}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('send')}</Text>}
      </TouchableOpacity>

      {/* Modal Success */}
      <Modal visible={showSuccess} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, { color: '#4CAF50' }]}>✅ {t('sendSuccess')}</Text>
            <TouchableOpacity onPress={() => setShowSuccess(false)}>
              <Text style={styles.modalButton}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Error */}
      <Modal visible={showError} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, { color: '#E53935' }]}>❌ {t('sendFail')}</Text>
            <TouchableOpacity onPress={() => setShowError(false)}>
              <Text style={styles.modalButton}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Login Prompt */}
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
  container: { flexGrow: 1, padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#FB8C00' },
  input: { 
    borderWidth: 1, borderColor: '#FFA726', padding: 12, borderRadius: 8, 
    marginBottom: 12, color: '#333', backgroundColor: '#FFF' 
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { 
    backgroundColor: '#FB8C00', padding: 15, borderRadius: 8, 
    alignItems: 'center', opacity: 0.9 
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 18, marginBottom: 10 },
  modalButton: { color: '#FB8C00', fontSize: 16, fontWeight: 'bold' }
});

export default Contact;