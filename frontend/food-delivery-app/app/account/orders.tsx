import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRestaurantImageById } from '@/data/dataService';
import { API_URL } from '../(tabs)/home';
import { useRouter } from "expo-router";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Lấy user hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user._id || user.id);
        }
      } catch (error) {
        console.log("Lỗi khi lấy user:", error);
      }
    };
    fetchUser();
  }, []);

  // Lấy danh sách đơn hàng của user
  useEffect(() => {
    if (!userId) return;
    let interval: number;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        const userOrders = data.filter(
          (o: any) => o.userId === userId && ["dang_giao", "da_giao", "da_huy"].includes(o.status)
        );
        setOrders(userOrders);
      } catch (err) {
        console.log("Lỗi fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    interval = setInterval(fetchOrders, 5000); // mỗi 5s refresh
    return () => clearInterval(interval);
  }, [userId]);

  const openOrder = async (order: any) => {
    if (order.status === "dang_giao") {
      await AsyncStorage.setItem("currentOrderId", order.id);
      router.push("/prderTC"); // mở màn hình tracking
    } else {
      setSelectedOrder(order); // modal chi tiết
    }
  };

  const closeDetail = () => setSelectedOrder(null);

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => openOrder(item)}>
      <View style={styles.left}>
        <Image
          source={getRestaurantImageById(item.idRestaurant) || { uri: item.restaurant?.image?.image_url }}
          style={styles.thumbnail}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.orderId}>Mã đơn: {item.id}</Text>
          <Text style={styles.orderDate}>Ngày đặt: {item.createdAt?.slice(0, 10)}</Text>
          <Text style={styles.orderStatus}>
            Trạng thái:{' '}
            <Text style={{ color: item.status === 'da_giao' ? '#4CAF50' : item.status === 'dang_giao' ? '#FF9800' : '#f44336' }}>
              {item.status === 'da_giao' ? 'Đã giao' : item.status === 'dang_giao' ? 'Đang giao' : 'Đã hủy'}
            </Text>
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.total}>{item.total.toLocaleString()}₫</Text>
        <Ionicons name="chevron-forward" size={20} color="#aaa" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#00BCD4" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Đơn hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text>Không có đơn hàng nào</Text>}
      />

      {/* Modal chi tiết đơn hàng */}
      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Chi tiết đơn {selectedOrder.id}</Text>
                <Text style={styles.modalDate}>Ngày đặt: {selectedOrder.createdAt?.slice(0, 10)}</Text>
                <View style={styles.line} />

                {selectedOrder.items?.map((it: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <Image source={{ uri: it.product?.image || 'https://via.placeholder.com/50' }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{it.product?.name || 'Sản phẩm'}</Text>
                      <Text style={styles.itemQty}>x{it.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{(it.subtotal || 0).toLocaleString()}₫</Text>
                  </View>
                ))}

                <View style={styles.line} />
                <Text style={styles.totalText}>Tổng cộng: {selectedOrder.total.toLocaleString()}₫</Text>

                <TouchableOpacity style={styles.closeBtn} onPress={closeDetail}>
                  <Text style={styles.closeText}>Đóng</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f7f7f7', padding: 12, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  left: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },
  orderId: { fontWeight: '700', color: '#333' },
  orderDate: { fontSize: 13, color: '#777', marginVertical: 2 },
  orderStatus: { fontSize: 13, color: '#555' },
  total: { fontWeight: '700', color: '#00BCD4', marginBottom: 6 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, width: '90%', padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  modalDate: { fontSize: 13, color: '#666', marginTop: 4 },
  line: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fafafa', padding: 8, borderRadius: 8 },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontWeight: '600', color: '#333' },
  itemQty: { color: '#777', marginTop: 2 },
  itemPrice: { fontWeight: '600', color: '#00BCD4' },
  totalText: { fontSize: 15, fontWeight: '700', textAlign: 'right', color: '#333' },
  closeBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 10, marginTop: 10 },
  closeText: { color: '#333', fontWeight: '700', textAlign: 'center' },
});
