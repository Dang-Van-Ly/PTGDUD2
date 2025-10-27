import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    if (!emailOrPhone || !newPassword || !confirmPassword) {
      Alert.alert("⚠️ Lỗi", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("⚠️ Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("❌ Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    // Giả lập quá trình kiểm tra tài khoản (mock)
    const userFound = true; // giả lập đã tìm thấy tài khoản
    if (!userFound) {
      Alert.alert("❌ Không tìm thấy", "Không tồn tại tài khoản với thông tin này!");
      return;
    }

    Alert.alert("✅ Thành công", "Mật khẩu của bạn đã được đặt lại!");
    router.replace("/DangNhap"); // quay lại trang đăng nhập
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>
          Nhập email hoặc số điện thoại để đặt lại mật khẩu.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email hoặc Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="vd: luan.nguyen@example.com"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetText}>Đặt lại mật khẩu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff" },
  backButton: { marginBottom: 10 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#00BCD4",
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontSize: 15,
  },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 15, color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  resetButton: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#00BCD4",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  resetText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
