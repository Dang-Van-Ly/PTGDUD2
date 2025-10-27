import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("currentUser");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const handleChange = (key: string, value: string) => {
    setUser((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
    Alert.alert("Thành công", "Thông tin của bạn đã được lưu!");
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không có thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Ảnh đại diện */}
      <View style={styles.avatarBox}>
        <Image source={user.hinhAnh} style={styles.avatar} />
        <TouchableOpacity>
          <Text style={styles.changeAvatar}>Thay đổi ảnh</Text>
        </TouchableOpacity>
      </View>

      {/* Các ô nhập thông tin */}
      <View style={styles.formBox}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={user.hoTen}
          onChangeText={(text) => handleChange("hoTen", text)}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={user.sdt}
          keyboardType="phone-pad"
          onChangeText={(text) => handleChange("sdt", text)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={user.email}
          keyboardType="email-address"
          onChangeText={(text) => handleChange("email", text)}
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={user.diaChi}
          onChangeText={(text) => handleChange("diaChi", text)}
        />

        <Text style={styles.label}>Giới tính</Text>
        <TextInput
          style={styles.input}
          value={user.gioiTinh}
          onChangeText={(text) => handleChange("gioiTinh", text)}
        />

        <Text style={styles.label}>Ngày sinh</Text>
        <TextInput
          style={styles.input}
          value={user.ngaySinh}
          onChangeText={(text) => handleChange("ngaySinh", text)}
        />
      </View>

      {/* Nút hành động */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00BCD4" }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>💾 Lưu thay đổi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#ccc" }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: "#333" }]}>↩ Quay lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  avatarBox: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatar: {
    color: "#00BCD4",
    fontWeight: "600",
    marginTop: 8,
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 30,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
