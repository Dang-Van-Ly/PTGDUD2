import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "../app/(tabs)/home"; // sửa đường dẫn theo project

export default function OrderTrackingScreen() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const statuses = ["Confirm order", "Look for driver", "Prepare food", "Deliver", "Arrived"];

  // Lấy orderId từ AsyncStorage và fetch order từ backend
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderId = await AsyncStorage.getItem("currentOrderId");
        if (!orderId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  // Timeline tự động tăng trạng thái mỗi 30 giây
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      setStatusIndex(prev => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 30000);

    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return <ActivityIndicator size="large" color="#00C2CF" style={{ flex: 1, justifyContent: "center" }} />;
  }

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No order found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>

      {/* Thông tin đơn hàng */}
      <View style={styles.infoBox}>
        {order._id && <Text><Text style={styles.label}>Order ID:</Text> {order._id}</Text>}
        {order.customer && <Text><Text style={styles.label}>Customer:</Text> {order.customer}</Text>}
        {order.phone && <Text><Text style={styles.label}>Phone:</Text> {order.phone}</Text>}
        {order.address && <Text><Text style={styles.label}>Address:</Text> {order.address}</Text>}
        {order.addressRestaurant && <Text><Text style={styles.label}>Restaurant Address:</Text> {order.addressRestaurant}</Text>}
        {order.total && <Text><Text style={styles.label}>Total:</Text> {order.total.toLocaleString()}₫</Text>}
        {order.payment && <Text><Text style={styles.label}>Payment:</Text> {order.payment}</Text>}
      </View>

      {/* Danh sách sản phẩm */}
      {order.items?.length > 0 && (
        <View style={styles.itemsBox}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((it: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              {it.product?.image && (
                <Image source={{ uri: it.product.image }} style={styles.itemImage} />
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.itemName}>{it.product?.name || "Sản phẩm"}</Text>
                <Text style={styles.itemQty}>x{it.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{(it.subtotal || 0).toLocaleString()}₫</Text>
            </View>
          ))}
        </View>
      )}

      {/* Timeline trạng thái */}
      <Text style={[styles.subtitle, { marginTop: 20 }]}>Status: {statuses[statusIndex]}</Text>
      <View style={styles.progressContainer}>
        {statuses.map((status, i) => (
          <View key={i} style={styles.progressStep}>
            <View style={[styles.circle, { backgroundColor: i <= statusIndex ? "#00C2CF" : "#eee" }]} />
            <Text style={[styles.progressText, { color: i <= statusIndex ? "#00C2CF" : "#aaa" }]}>{status}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.push("/")}>
        <Text style={styles.cancelText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  label: { fontWeight: "700" },
  infoBox: { backgroundColor: "#fafafa", padding: 12, borderRadius: 8 },
  itemsBox: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 10 },
  sectionTitle: { fontWeight: "700", marginBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemImage: { width: 50, height: 50, borderRadius: 6 },
  itemName: { fontWeight: "600", color: "#333" },
  itemQty: { color: "#777", marginTop: 2 },
  itemPrice: { fontWeight: "600", color: "#00C2CF" },
  progressContainer: { marginTop: 10 },
  progressStep: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  circle: { width: 20, height: 20, borderRadius: 10, marginRight: 10 },
  progressText: { fontSize: 14 },
  cancelButton: { marginTop: 20, padding: 12, borderWidth: 1, borderColor: "#00C2CF", borderRadius: 8, alignItems: "center" },
  cancelText: { color: "#00C2CF", fontWeight: "600" },
});
