import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getOrderById, getProductDetails, removeItemFromOrder } from "../../data/dataService";

export default function OrderDetailScreen() {
  const { id: orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [itemsWithDetails, setItemsWithDetails] = useState<any[]>([]);

  const fetchOrder = async () => {
    if (!orderId) return;

    const data = await getOrderById(orderId as string);
    setOrder(data);

    if (data?.items?.length > 0) {
      const detailedItems = data.items.map((item: any) => {
        const product = getProductDetails(String(item.idProduct));
        return { ...item, product };
      });
      setItemsWithDetails(detailedItems);
    } else {
      setItemsWithDetails([]);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleDelete = async (productId: string) => {
    if (!order) return;

    Alert.alert("Xác nhận", "Bạn có muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const updatedOrder = await removeItemFromOrder(order.userId, order.id, productId);
          if (updatedOrder) {
            setOrder(updatedOrder);
            const updatedItems = updatedOrder.items.map((item: any) => ({
              ...item,
              product: getProductDetails(String(item.idProduct)),
            }));
            setItemsWithDetails(updatedItems);
          }
        },
      },
    ]);
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  const totalPrice = itemsWithDetails.reduce((sum, i) => sum + i.subtotal, 0) || 0;

  return (
    <FlatList
      data={itemsWithDetails}
      keyExtractor={(item, index) => `${item.idProduct}-${index}`}
      ListHeaderComponent={() => (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>🧾 Order ID: {order.id}</Text>
          <Text style={styles.subHeader}>Nhà hàng: {order.restaurant?.name}</Text>
        </View>
      )}
      renderItem={({ item }) => {
        const p = item.product;
        return (
          <View style={styles.itemCard}>
            {p?.image_url && (
              <Image source={{ uri: p.image_url }} style={styles.itemImg} />
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemName}>{p?.name}</Text>
              {p?.description && <Text style={styles.itemDesc}>{p.description}</Text>}
              <Text>Số lượng: {item.quantity}</Text>
              <Text>Subtotal: {item.subtotal?.toLocaleString()} đ</Text>

              {p?.options?.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  {p.options.map((opt: any, idx: number) => (
                    <Text key={idx} style={styles.optionText}>
                      {opt.name}: {opt.choices.map((c: any) => c.name).join(", ")}
                    </Text>
                  ))}
                </View>
              )}

              {p?.addons?.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.optionText}>
                    Addons: {p.addons.map((a: any) => a.name).join(", ")}
                  </Text>
                </View>
              )}
            </View>

            {/* Nút Xóa */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleDelete(item.idProduct)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        );
      }}
      ListFooterComponent={() => (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.total}>Tổng tiền: {totalPrice.toLocaleString()} đ</Text>
          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: { marginBottom: 16 },
  header: { fontSize: 20, fontWeight: "bold" },
  subHeader: { fontSize: 16, marginTop: 4, marginBottom: 8 },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemImg: { width: 80, height: 80, borderRadius: 8 },
  itemName: { fontWeight: "bold", fontSize: 16 },
  itemDesc: { color: "#555", fontSize: 13, marginVertical: 2 },
  optionText: { color: "#777", fontSize: 12 },
  total: { fontSize: 18, fontWeight: "700", marginVertical: 16 },
  payButton: {
    backgroundColor: "#38E2FF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  payButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  removeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#FF3B30",
    width: 25,
    height: 25,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
