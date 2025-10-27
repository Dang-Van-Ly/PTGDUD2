import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 🧾 Dữ liệu FastFood
  const orders = [
    {
      id: 'DH001',
      date: '25/10/2025',
      total: 185000,
      status: 'Đã giao',
      items: [
        {
          name: 'Combo Burger Bò Phô Mai',
          qty: 1,
          price: 85000,
          image: 'https://images.unsplash.com/photo-1606755962773-0e91c04b7d4f?w=800',
        },
        {
          name: 'Khoai Tây Chiên Lớn',
          qty: 1,
          price: 45000,
          image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
        },
        {
          name: 'Coca-Cola Lon 330ml',
          qty: 2,
          price: 27500,
          image: 'https://images.unsplash.com/photo-1585238341986-c0522d9b9e83?w=800',
        },
      ],
    },
    {
      id: 'DH002',
      date: '23/10/2025',
      total: 220000,
      status: 'Đang giao',
      items: [
        {
          name: 'Gà Rán Giòn Cay (2 Miếng)',
          qty: 1,
          price: 95000,
          image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800',
        },
        {
          name: 'Burger Gà Sốt BBQ',
          qty: 1,
          price: 85000,
          image: 'https://images.unsplash.com/photo-1601050690597-df4cc2c2ef13?w=800',
        },
        {
          name: 'Pepsi Lon 330ml',
          qty: 1,
          price: 40000,
          image: 'https://images.unsplash.com/photo-1613470208143-b2e60c7e8594?w=800',
        },
      ],
    },
    {
      id: 'DH003',
      date: '21/10/2025',
      total: 98000,
      status: 'Đã hủy',
      items: [
        {
          name: 'Burger Tôm Tempura',
          qty: 1,
          price: 68000,
          image: 'https://images.unsplash.com/photo-1601050690597-df4cc2c2ef13?w=800',
        },
        {
          name: 'Trà Đào Cam Sả',
          qty: 1,
          price: 30000,
          image: 'https://images.unsplash.com/photo-1577801596084-58e69e8e5f61?w=800',
        },
      ],
    },
  ];

  const openDetail = (order: any) => {
    setSelectedOrder(order);
  };

  const closeDetail = () => {
    setSelectedOrder(null);
  };

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => openDetail(item)}>
      <View style={styles.left}>
        <Image source={{ uri: item.items[0].image }} style={styles.thumbnail} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.orderId}>Mã đơn: {item.id}</Text>
          <Text style={styles.orderDate}>Ngày đặt: {item.date}</Text>
          <Text style={styles.orderStatus}>
            Trạng thái:{" "}
            <Text
              style={{
                color:
                  item.status === 'Đã giao'
                    ? '#4CAF50'
                    : item.status === 'Đang giao'
                    ? '#FF9800'
                    : '#f44336',
              }}
            >
              {item.status}
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

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng</Text>
      </View>

      {/* Danh sách đơn hàng */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal chi tiết */}
      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Chi tiết đơn hàng {selectedOrder.id}</Text>
                <Text style={styles.modalDate}>Ngày đặt: {selectedOrder.date}</Text>
                <View style={styles.line} />

                {selectedOrder.items.map((it: any, index: number) => (
                  <View key={index} style={styles.itemRow}>
                    <Image source={{ uri: it.image }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{it.name}</Text>
                      <Text style={styles.itemQty}>x{it.qty}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {(it.qty * it.price).toLocaleString()}₫
                    </Text>
                  </View>
                ))}

                <View style={styles.line} />
                <Text style={styles.totalText}>
                  Tổng cộng: {selectedOrder.total.toLocaleString()}₫
                </Text>

                <TouchableOpacity style={styles.reorderBtn}>
                  <Ionicons name="repeat" size={18} color="#fff" />
                  <Text style={styles.reorderText}>Đặt lại đơn này</Text>
                </TouchableOpacity>

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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 12, color: '#333' },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  thumbnail: { width: 60, height: 60, borderRadius: 8 },
  orderId: { fontWeight: '700', color: '#333' },
  orderDate: { fontSize: 13, color: '#777', marginVertical: 2 },
  orderStatus: { fontSize: 13, color: '#555' },
  total: { fontWeight: '700', color: '#00BCD4', marginBottom: 6 },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  modalDate: { fontSize: 13, color: '#666', marginTop: 4 },
  line: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fafafa',
    padding: 8,
    borderRadius: 8,
  },
  itemImage: { width: 50, height: 50, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemName: { fontWeight: '600', color: '#333' },
  itemQty: { color: '#777', marginTop: 2 },
  itemPrice: { fontWeight: '600', color: '#00BCD4' },
  totalText: { fontSize: 15, fontWeight: '700', textAlign: 'right', color: '#333' },
  reorderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  reorderText: { color: '#fff', fontWeight: '700', marginLeft: 6 },
  closeBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  closeText: { color: '#333', fontWeight: '700', textAlign: 'center' },
});
