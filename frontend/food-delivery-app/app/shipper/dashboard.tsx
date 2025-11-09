import React, { useState, useEffect ,useCallback} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUnacceptedOrders } from "../../data/dataService"; // 🔹 Import hàm bạn đã viết
import { useFocusEffect } from "@react-navigation/native";
import { ordersMock } from "@/data/mockData";
export default function ShipperDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  // 📦 Khi vào màn hình thì load các đơn chưa được shipper nhận
useFocusEffect(
  useCallback(() => {
    const loadOrders = async () => {
      // Nếu chưa có dữ liệu ordersMock trong AsyncStorage thì khởi tạo
      const stored = await AsyncStorage.getItem("ordersMock");
      if (!stored) {
        await AsyncStorage.setItem("ordersMock", JSON.stringify(ordersMock));
      }

      // Gọi hàm lấy danh sách chưa nhận
      const data = await getUnacceptedOrders();
      setOrders(data);
    };

    loadOrders();
  }, [])
);


  // 👉 Khi shipper bấm xem/nhận đơn
  const handleViewOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      await AsyncStorage.setItem("currentOrder", JSON.stringify(order));
      router.push(`/shipper/order/${orderId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>SHIPPER DASHBOARD</Text>

      {orders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          🚫 Không có đơn hàng mới.
        </Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.customer}>{item.customer}</Text>
              <Text>{item.address}</Text>
              <Text style={styles.total}>
                Tổng: {item.total.toLocaleString()}đ
              </Text>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => handleViewOrder(item.id)}
              >
                <Text style={styles.btnText}>chi tiết đơn hàng </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  orderCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  customer: { fontSize: 18, fontWeight: "600" },
  total: { marginTop: 4, fontWeight: "600" },
  btn: {
    marginTop: 8,
    backgroundColor: "#2f95dc",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
