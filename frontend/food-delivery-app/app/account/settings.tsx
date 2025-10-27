import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("🚪 Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: () => console.log("Đã đăng xuất") },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cài đặt tài khoản</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option} onPress={() => router.push("/DoiMatKhau")}>
          <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" />
          <Text style={styles.optionText}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, { borderBottomWidth: 0 }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#f44336" />
          <Text style={[styles.optionText, { color: "#f44336" }]}>Đăng xuất</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 20 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 0.6,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 16, color: "#333", marginLeft: 10, flex: 1, fontWeight: "500" },
});
