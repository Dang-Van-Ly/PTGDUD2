import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { loginUser } from "../data/dataService";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại và mật khẩu");
      return false;
    }
    const phoneRe = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRe.test(phone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }
    return true;
  };

const onLogin = async () => {
  if (!validate()) return;
  setLoading(true);
  try {
    const user = loginUser(phone, password);
    setTimeout(async () => {
      setLoading(false);
      if (user) {
        await AsyncStorage.setItem("currentUser", JSON.stringify(user));
        Alert.alert("Thành công", `Chào mừng ${user.hoTen}!`);

        // ✅ Điều hướng theo role
        if (user.role === "shipper") {
          router.replace("/shipper/dashboard"); // trang Shipper
        } else {
          router.replace("/(tabs)/home"); // trang Home bình thường
        }
      } else {
        Alert.alert("Lỗi", "Sai số điện thoại hoặc mật khẩu");
      }
    }, 700);
  } catch (err) {
    setLoading(false);
    Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại sau.");
  }
};


  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require("../assets/images/LogoGF.png")}
              style={styles.logo}
            />
            <Text style={styles.logoTitle}>GoFood</Text>
          </View>
          <Text style={styles.subtitle}>Chào mừng bạn quay lại!</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            returnKeyType="next"
          />

          <TextInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            returnKeyType="done"
          />

          <TouchableOpacity onPress={() => router.push("/QuenMatKhau")}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, loading ? styles.btnDisabled : null]}
            onPress={onLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => router.push("/DangKi")}>
              <Text style={styles.link}> Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 10 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginRight: 10,
    borderRadius: 12,
  },
  logoTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: "#3384af",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: { color: "#666", marginTop: 4 },
  form: { marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  forgotText: {
    color: "#1E90FF",
    alignSelf: "flex-end",
    marginBottom: 10,
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "#2f95dc",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  link: { color: "#2f95dc", fontWeight: "700" },
});
