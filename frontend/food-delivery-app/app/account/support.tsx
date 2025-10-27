import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SupportScreen() {
  const supportOptions = [
    { title: "Gọi tổng đài", icon: "call-outline", action: () => Linking.openURL("tel:19001009") },
    { title: "Gửi email hỗ trợ", icon: "mail-outline", action: () => Linking.openURL("mailto:support@foodapp.vn") },
    { title: "Câu hỏi thường gặp (FAQ)", icon: "help-circle-outline", action: () => {} },
    { title: "Báo lỗi ứng dụng", icon: "alert-circle-outline", action: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Trung tâm hỗ trợ</Text>

      {supportOptions.map((item, index) => (
        <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
          <Ionicons name={item.icon as any} size={24} color="#00BCD4" />
          <Text style={styles.optionText}>{item.title}</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>
      ))}

      <Text style={styles.footer}>Phiên bản ứng dụng: 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 20 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: { fontSize: 16, color: "#333", marginLeft: 10, fontWeight: "500" },
  footer: { textAlign: "center", color: "#999", marginTop: 20 },
});
