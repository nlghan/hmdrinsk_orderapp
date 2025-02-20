import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LanguageSwitcher = () => {
  const [language, setLanguage] = useState("VN");

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem("language");
      if (savedLang) {
        setLanguage(savedLang);
      }
      console.log("🔹 Loaded language from AsyncStorage:", savedLang); // Log ra để kiểm tra
    };
    loadLanguage();
  }, []);

  const toggleLanguage = async () => {
    const newLang = language === "VN" ? "EN" : "VN";
    setLanguage(newLang);
    await AsyncStorage.setItem("language", newLang);
    console.log("🔄 Switched language to:", newLang); // Log khi đổi ngôn ngữ
  };

  return (
    <TouchableOpacity onPress={toggleLanguage} style={styles.button}>
      <Text style={styles.text}>{language === "VN" ? "🇻🇳 Tiếng Việt" : "🇺🇸 English"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FFA07A",
    alignSelf: "center",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default LanguageSwitcher;
