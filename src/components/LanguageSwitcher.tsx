import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useCategoryStore } from "../store/store";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useCategoryStore();

  const toggleLanguage = async () => {
    const newLang = language === "VN" ? "EN" : "VN";
    console.log("🛠 Đang chuyển đổi ngôn ngữ sang:", newLang);
  
    await setLanguage(newLang);
  
    console.log("✅ Đã chuyển đổi ngôn ngữ sang:", newLang);
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
