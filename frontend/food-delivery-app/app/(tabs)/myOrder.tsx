import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { getCartByUser, getRestaurantImageById } from "../../data/dataService";

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      const userData = await AsyncStorage.getItem("currentUser");
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const data = await getCartByUser(parsedUser.id);
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }

      await AsyncStorage.removeItem("cartUpdated");
    } catch (error) {
      console.error("Lỗi khi lấy orders:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkAndReload = async () => {
        const updated = await AsyncStorage.getItem("cartUpdated");
        if (updated === "true" || orders.length === 0) {
          await fetchOrders();
        }
      };
      checkAndReload();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        🛒 {user?.hoTen ? `${user.hoTen}'s Cart` : "My Cart"}
      </Text>

      {orders.length === 0 ? (
        <Text style={styles.empty}>Bạn chưa có đơn hàng nào</Text>
      ) : (
        orders.map((order, i) => {
          const restaurant = order.restaurant || {};
          const restaurantImg =
            getRestaurantImageById(restaurant.id) || restaurant.image_url;

          return (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => router.push(`/orders/${order.id}`)} // Chỉ truyền id
            >
              <Image
                source={
                  typeof restaurantImg === "number"
                    ? restaurantImg
                    : { uri: restaurantImg }
                }
                style={styles.cardImg}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {restaurant.name || "Chưa chọn nhà hàng"}
                </Text>
                <Text style={styles.cardSub}>
                  🛍 {order.items?.length || 0} món • 💰{" "}
                  {order.total?.toLocaleString() || 0} đ
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: "bold", color: "#333", marginTop: 20, marginBottom: 10 },
  empty: { fontSize: 16, color: "#888", textAlign: "center", marginTop: 50 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  cardImg: { width: 90, height: 90, borderRadius: 10, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  cardSub: { fontSize: 14, color: "#555", marginVertical: 2 },
});
