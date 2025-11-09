import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import haversine from "haversine-distance";

export default function OrderDetail() {
  const [order, setOrder] = useState<any>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const router = useRouter();
const [userId, setUserId] = useState<string | null>(null);
useEffect(() => {
  const fetchUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("currentUser");
      if (userData) {
        const user = JSON.parse(userData);
        // Chỉ lấy id user
        setUserId(user._id || user.id || null);
      }
    } catch (error) {
      console.log("Lỗi khi lấy id user:", error);
    }
  };

  fetchUserId();
}, []);
useEffect(() => {
  const fetchOrder = async () => {
    const stored = await AsyncStorage.getItem("currentOrder");
    if (stored) {
      const ord = JSON.parse(stored);

      // 🔄 Chuyển đổi nếu có lat/lng thay vì latitude/longitude
      if (ord.storeLocation?.lat && !ord.storeLocation.latitude) {
        ord.storeLocation = {
          latitude: ord.storeLocation.lat,
          longitude: ord.storeLocation.lng,
        };
      }
      if (ord.customerLocation?.lat && !ord.customerLocation.latitude) {
        ord.customerLocation = {
          latitude: ord.customerLocation.lat,
          longitude: ord.customerLocation.lng,
        };
      }

      setOrder(ord);
      if (ord.storeLocation && ord.customerLocation) {
        const dist = haversine(ord.storeLocation, ord.customerLocation) / 1000;
        setDistanceKm(parseFloat(dist.toFixed(2)));
      }
    }
  };
  fetchOrder();
}, []);


  const handleAcceptOrder = async () => {
    try {
      if (!order) return;

      const updatedOrder = { ...order, isAccepted: true };
      const stored = await AsyncStorage.getItem("ordersMock");
      const allOrders = stored ? JSON.parse(stored) : [];

      const updatedOrders = allOrders.map((o: any) =>
        o.id === updatedOrder.id ? updatedOrder : o
      );

      await AsyncStorage.setItem("ordersMock", JSON.stringify(updatedOrders));
      await AsyncStorage.setItem("currentOrder", JSON.stringify(updatedOrder));

router.push(`/shipper/track/${order.id}?userId=${userId}&idCustomer=${order.idCustomer}`);
    } catch (error) {
      console.error("❌ Lỗi khi nhận đơn:", error);
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CHI TIẾT ĐƠN HÀNG</Text>

      {order.customer && <Text>Khách hàng: {order.customer}</Text>}
      {order.phone && <Text>SĐT: {order.phone}</Text>}
      {order.address && <Text>Địa chỉ khách: {order.address}</Text>}
      {order.addressRestaurant && (
        <Text>Địa chỉ cửa hàng: {order.addressRestaurant}</Text>
      )}
      {order.total !== undefined && (
        <Text>Tổng tiền: {order.total?.toLocaleString() || 0}đ</Text>
      )}
      {order.payment && <Text>Phương thức: {order.payment}</Text>}
      {distanceKm > 0 && <Text>Khoảng cách: {distanceKm} km</Text>}

      {/* Chỉ hiển thị bản đồ khi có đủ tọa độ */}
      {order.storeLocation?.latitude !== undefined &&
        order.customerLocation?.latitude !== undefined && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude:
                (order.storeLocation.latitude + order.customerLocation.latitude) /
                2,
              longitude:
                (order.storeLocation.longitude + order.customerLocation.longitude) /
                2,
              latitudeDelta:
                Math.abs(
                  order.storeLocation.latitude - order.customerLocation.latitude
                ) * 2,
              longitudeDelta:
                Math.abs(
                  order.storeLocation.longitude - order.customerLocation.longitude
                ) * 2,
            }}
          >
            <Marker coordinate={order.storeLocation} title="Cửa hàng" />
            <Marker coordinate={order.customerLocation} title="Khách hàng" />
            <Polyline
              coordinates={[order.storeLocation, order.customerLocation]}
              strokeColor="#2f95dc"
              strokeWidth={3}
            />
          </MapView>
        )}

      <TouchableOpacity style={styles.btn} onPress={handleAcceptOrder}>
        <Text style={styles.btnText}>Nhận đơn</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  map: { width: "100%", height: 250, borderRadius: 12, marginVertical: 12 },
  btn: {
    marginTop: 8,
    backgroundColor: "#2f95dc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#555",
  },
});
