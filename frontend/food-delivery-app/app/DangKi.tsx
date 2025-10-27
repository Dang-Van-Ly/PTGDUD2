import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { users } from "./data/mockData";

export default function RegisterScreen() {
  const router = useRouter();

  const [hoTen, setHoTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [email, setEmail] = useState("");
  const [gioiTinh, setGioiTinh] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [diaChi, setDiaChi] = useState("");

  const handleRegister = () => {
    if (!hoTen || !sdt || !matKhau) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    // Kiểm tra trùng số điện thoại
    const existingUser = users.find((u) => u.sdt === sdt);
    if (existingUser) {
      Alert.alert("Lỗi", "Số điện thoại đã được đăng ký!");
      return;
    }

    // Thêm người dùng mới vào mảng mock
    const newUser = {
      id: users.length + 1,
      hoTen,
      sdt,
      matKhau,
      email,
      gioiTinh,
      ngaySinh,
      diaChi,
      hinhAnh: require("../assets/images/avatar.png"),
    };

    users.push(newUser);
    Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
    router.push("/DangNhap"); // Quay về trang đăng nhập
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Đăng ký tài khoản</Text>
      </View>

      <Image source={require("../assets/images/avatar.png")} style={styles.avatar} />

      <TextInput
        placeholder="Họ và tên"
        value={hoTen}
        onChangeText={setHoTen}
        style={styles.input}
      />
      <TextInput
        placeholder="Số điện thoại"
        value={sdt}
        onChangeText={setSdt}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Mật khẩu"
        value={matKhau}
        onChangeText={setMatKhau}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Email (không bắt buộc)"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Giới tính"
        value={gioiTinh}
        onChangeText={setGioiTinh}
        style={styles.input}
      />
      <TextInput
        placeholder="Ngày sinh (yyyy-mm-dd)"
        value={ngaySinh}
        onChangeText={setNgaySinh}
        style={styles.input}
      />
      <TextInput
        placeholder="Địa chỉ"
        value={diaChi}
        onChangeText={setDiaChi}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/DangNhap")}>
        <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  button: {
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginText: {
    color: "#6C63FF",
    marginTop: 15,
    fontSize: 14,
  },
});
