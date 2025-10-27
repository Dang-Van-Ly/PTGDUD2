import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const data = await AsyncStorage.getItem("currentUser");
      if (data) setUser(JSON.parse(data));
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Chưa đăng nhập</Text>
        <TouchableOpacity onPress={() => router.push("/DangNhap")}>
          <Text style={{ color: "#00BCD4", marginTop: 5 }}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    { icon: "person-outline", title: "Thông tin cá nhân", path: "/account/profile" },
    { icon: "receipt-outline", title: "Đơn hàng của tôi", path: "/account/orders" },
    { icon: "card-outline", title: "Phương thức thanh toán", path: "/account/payment" },
    { icon: "location-outline", title: "Địa chỉ của tôi", path: "/account/address" },
    { icon: "help-circle-outline", title: "Trung tâm hỗ trợ", path: "/account/support" },
    { icon: "settings-outline", title: "Cài đặt", path: "/account/settings" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image source={user.hinhAnh} style={styles.avatar} />
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.name}>{user.hoTen}</Text>
          <Text style={styles.phone}>{user.sdt}</Text>
        </View>
      </View>

      <View style={styles.menuBox}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.path as any)}
          >
            <Ionicons name={item.icon as any} size={22} color="#00BCD4" />
            <Text style={styles.menuText}>{item.title}</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={22}
              color="#999"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.removeItem("currentUser");
          router.replace("/DangNhap");
        }}
      >
        <FontAwesome5 name="sign-out-alt" size={18} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 15,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  name: { fontSize: 20, fontWeight: "700", color: "#333" },
  phone: { fontSize: 14, color: "#666", marginTop: 3 },
  menuBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 5,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00BCD4",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 40,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});
