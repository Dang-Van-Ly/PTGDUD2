import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {  getProductDetails, getProductsByRestaurantId, removeItemFromOrder, updateItemInOrder, addNewOrder } from "../../data/dataService";
import { users ,orders,restaurants } from "../../data/mockData";
import { API_URL } from '../(tabs)/home';
type PaymentMethod = { 
  id: string; 
  type: 'Card' | 'Momo' | 'VNPay'; 
  title: string; 
  last4?: string; 
  isDefault?: boolean;
};

export type User = {
  id: string;
  hoTen: string;
  sdt: string;
  matKhau: string;
  email: string;
  gioiTinh: string;
  ngaySinh: string;
  diaChi: string;
  hinhAnh: any;
  addrs: any[];
  paymentMethods: PaymentMethod[];
};
export default function OrderDetailScreen() {
const { id: orderId, discount } = useLocalSearchParams<{
  id?: string;
  discount?: string;
 
}>();
const discountValue = discount ? Number(discount) : 0;

  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [itemsWithDetails, setItemsWithDetails] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alsoOrdered, setAlsoOrdered] = useState<any[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [restaurant, setRestaurant] = useState<any>(null);

  const [promotion, setPromotion] = useState(0);

// ----------------- FETCH ORDER -----------------
const fetchOrder = async () => {
  if (!orderId) return;
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`); // dùng API_URL cho Android Emulator
    if (!response.ok) throw new Error("Không lấy được đơn hàng");
    const data = await response.json();
    setOrder(data);
    // Tính subtotal cho từng item (nếu backend chưa trả)
    const itemsWithSubtotals = data.items.map((item: any) => ({
      ...item,
      subtotal: item.subtotal || ((item.quantity || 1) * (item.product?.price || 0)),
    }));
    setItemsWithDetails(itemsWithSubtotals);
  } catch (error) {
    console.error("Lỗi fetchOrder:", error);
  }
};



// ----------------- FETCH ALSO ORDERED -----------------
const fetchAlsoOrdered = async (restaurantId: string) => {
  if (!restaurantId) return;
  try {
    const response = await fetch(`${API_URL}/products/restaurant/${restaurantId}`);
    if (!response.ok) throw new Error("Không lấy được sản phẩm của nhà hàng");
    const data = await response.json();
    setAlsoOrdered(data); // lưu vào state để hiển thị
  } catch (error) {
    console.error("Lỗi fetchAlsoOrdered:", error);
  }
};


  // ----------------- FETCH ADDRESSES -----------------
  const fetchAddresses = async () => {
    const userData = await AsyncStorage.getItem("currentUser");
    if (userData) {
      const currentUser = JSON.parse(userData);
      const user = users.find((u) => u.id === currentUser.id);
      if (user) {
        const addrs = user.addrs.map((a) => ({
          id: a.id,
          name: a.name,
          phone: a.phone,
          addr: a.address,
          latitude: a.latitude,
          longitude: a.longitude,
          isDefault: a.isDefault,
        }));
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) setSelectedAddress(def);
      }
    }
  };
  // Sau khi fetchOrder xong hoặc order thay đổi
useEffect(() => {
  if (order?.idRestaurant) {
    const r = restaurants.find(r => r.id === order.idRestaurant);
    setRestaurant(r || null);
  }
}, [order]);
  // Lấy phương thức thanh toán của user hiện tại
  useEffect(() => {
    const fetchUserPayments = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;
        const currentUser = JSON.parse(userData);
const user = users.find(u => u.id === currentUser.id) as User | undefined;
        if (user) {
          setMethods(user.paymentMethods || []);
        }
      } catch (error) {
        console.log('Lỗi lấy phương thức thanh toán:', error);
      }
    };
    fetchUserPayments();
  }, []);

  // 2. Trong useEffect sau khi lấy phương thức của user, chọn mặc định
useEffect(() => {
  if (methods.length > 0) {
    const def = methods.find(m => m.isDefault) || methods[0];
    setSelectedMethod(def);
  }
}, [methods]);

  useEffect(() => {
    fetchOrder();
    fetchAddresses();
  }, [orderId]);
useEffect(() => {
  if (discount) {
    setPromotion(Number(discount));
  }
}, [discount]);

  // ----------------- HANDLE ADDRESS -----------------
  const handleSelectAddress = (a: any) => {
    setSelectedAddress(a);
    setModalVisible(false);
  };


// ----------------- HANDLE DECREASE -----------------
const handleDecrease = async (idProduct: string) => {
  if (!order) return;
  const item = itemsWithDetails.find(it => it.idProduct === idProduct);
  if (!item) return;

  const newQty = (item.quantity || 1) - 1;

  const response = await fetch(`${API_URL}/orders/${order.id}/items/${idProduct}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty }),
  });
  if (!response.ok) return alert("Cập nhật thất bại");

  // 🔹 Gọi lại getOrderById để lấy product info
  const orderRes = await fetch(`${API_URL}/orders/${order.id}`);
  const updatedOrderWithDetails = await orderRes.json();
// Nếu order không còn item nào -> chuyển về OrdersScreen
  if (!updatedOrderWithDetails.items || updatedOrderWithDetails.items.length === 0) {
    alert("Đơn hàng đã hết món, quay về danh sách đơn hàng!");
    router.push("/(tabs)/myOrder");
    return;
  }

  setOrder(updatedOrderWithDetails);
  setItemsWithDetails(updatedOrderWithDetails.items);
};



// ----------------- HANDLE INCREASE -----------------
const handleIncrease = async (idProduct: string) => {
  if (!order) return;
  const item = itemsWithDetails.find(it => String(it.idProduct) === String(idProduct));
  if (!item) return;

  const newQty = (item.quantity || 1) + 1;

  // 🔹 Gọi PATCH để update quantity
  const response = await fetch(`${API_URL}/orders/${order.id}/items/${idProduct}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: newQty }),
  });
  if (!response.ok) return alert("Cập nhật thất bại");

  // 🔹 Gọi lại getOrderById để lấy product info
  const orderRes = await fetch(`${API_URL}/orders/${order.id}`);
  const updatedOrderWithDetails = await orderRes.json();

  setOrder(updatedOrderWithDetails);
  setItemsWithDetails(updatedOrderWithDetails.items);
};

  // ----------------- REFRESH ITEMS AFTER CHANGE -----------------
  const refreshItems = async (updatedOrder: any) => {
    setOrder(updatedOrder);
    if (updatedOrder.items?.length > 0) {
      const updatedItems = await Promise.all(
        updatedOrder.items.map(async (item: any) => {
          const product = await getProductDetails(String(item.idProduct));
          return { ...item, product, subtotal: (item.quantity || 1) * (product?.price || 0) };
        })
      );
      setItemsWithDetails(updatedItems);
    } else {
      setItemsWithDetails([]);
    }
    if (updatedOrder.idRestaurant) fetchAlsoOrdered(String(updatedOrder.idRestaurant));
  };

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Đang tải đơn hàng...</Text>
      </View>
    );
  }
  // Tạo vị trí tự động
const storeLocation = restaurant?.location || {
  latitude: 10.762622,
  longitude: 106.660172,
};

const customerLocation = selectedAddress
  ? {
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    }
  : { latitude: 10.762622, longitude: 106.660172 }; // fallback

// ----------------- HANDLE ORDER NOW -----------------
const handleOrderNow = async () => {
  try {
    // 🔹 Lấy thông tin user
    const userData = await AsyncStorage.getItem("currentUser");
    const currentUser = userData ? JSON.parse(userData) : null;

    if (!currentUser || !currentUser.id || !currentUser.hoTen || !currentUser.sdt) {
      alert("❌ Bạn cần đăng nhập và đảm bảo thông tin đầy đủ!");
      return;
    }

    // 🔹 Vị trí cửa hàng & khách hàng
    const storeLocation = restaurant?.location || { latitude: 10.762622, longitude: 106.660172 };
    const customerLocation = selectedAddress?.latitude
      ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
      : { latitude: storeLocation.latitude + Math.random() * 0.01, longitude: storeLocation.longitude + Math.random() * 0.01 };

    // 🔹 Payload chuẩn cho OrderSmock
    const newOrder = {
      idCustomer: currentUser.id,
      customer: currentUser.hoTen,
      phone: currentUser.sdt,
      address: selectedAddress?.addr || "Chưa có địa chỉ",
      addressRestaurant: restaurant?.address || "Unknown Restaurant",
      total: totalPrice + (restaurant?.delivery_fee || 0) - promotion,
      payment: selectedMethod?.type || "COD", // ✅ enum phải hợp lệ: "COD", "Momo", "BankTransfer", "Visa"
      items: itemsWithDetails.map(i => ({
        name: i.product?.name || "Unknown",
        qty: i.quantity || 1,       // ✅ dùng `qty` theo schema
        price: i.product?.price || 0
      })),
      storeLocation,
      customerLocation,
      isAccepted: false,
    };

    console.log("📦 Payload gửi lên server:", newOrder);

    // 🔹 Gọi API backend
    const response = await fetch(`${API_URL}/ordersmock`, { // đúng route `/ordersmock`
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });

    // 🔹 Parse JSON trả về
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Server trả về lỗi:", data);
      throw new Error(data.message || "Tạo đơn hàng thất bại");
    }

    console.log("✅ Đơn hàng đã lưu:", data);
    // 🔹 Cập nhật trạng thái đơn hàng thành "dang_dao"
    if (order.id) {
     const statusRes = await fetch(`${API_URL}/orders/${order.id}/status`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "dang_giao" }),
});

      if (!statusRes.ok) throw new Error("Cập nhật trạng thái thất bại");
      const statusData = await statusRes.json();
      console.log("Trạng thái đơn hàng mới:", statusData.order.status);
    }

    alert("✅ Đặt hàng thành công và đang giao!");
    router.push("/prderTC"); // chuyển trang
  } catch (error) {
    console.error("❌ Lỗi khi đặt hàng:", error);
    alert("❌ Đặt hàng thất bại, thử lại!");
  }
};




  const totalPrice = itemsWithDetails.reduce((sum, i) => sum + i.subtotal, 0) || 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={itemsWithDetails}
        keyExtractor={(item, index) => `${item.idProduct}-${index}`}
        ListHeaderComponent={() => (
          <View style={{ marginTop: 30, marginBottom: 12 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 12 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", left: 0, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontSize: 40, fontWeight: "400", color: "#14a3d6" }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "#000" }}>Order review</Text>
            </View>

            {/* Địa chỉ giao hàng */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", paddingVertical: 12, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600" }}>Delivered to</Text>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={{ color: "#14a3d6", fontWeight: "600" }}>Change address</Text>
                  </TouchableOpacity>
                </View>
                {selectedAddress ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                    <Ionicons name="location-outline" size={18} color="#14a3d6" style={{ marginRight: 4 }} />
                    <Text style={{ color: "#666" }}>{selectedAddress.addr}</Text>
                  </View>
                ) : (
                  <Text style={{ color: "#666" }}>No address selected</Text>
                )}
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>Order details</Text>
              <TouchableOpacity>
                <Text style={{ color: "#14a3d6", fontWeight: "600" }}>Add more</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={({ item }) => {
          const p = item.product;
          return (
            <View style={styles.orderItem}>
              <View style={styles.itemMainInfo}>
                <Image source={{ uri: p?.image_url }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{p?.name}</Text>
                  </View>
                  {item.note ? (
                    item.note.split(', ').map((option: string, index: number) => (
                      <Text key={index} style={styles.itemMeta}>{option}</Text>
                    ))
                  ) : (
                    <Text style={styles.itemMeta}>Chưa có tùy chọn</Text>
                  )}
                </View>
              </View>

              <View style={styles.itemControls}>
                <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
                <View style={styles.quantityControl}>
                  <TouchableOpacity style={styles.decreaseButton} onPress={() => handleDecrease(item.idProduct)}>
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.quantityText}>{item.quantity}</Text>

                  <TouchableOpacity style={styles.increaseButton} onPress={() => handleIncrease(item.idProduct)}>
                    <Text style={styles.increaseButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={() => (
          <>
            {alsoOrdered.length > 0 && (
              <View style={{ marginTop: 20, marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10, marginLeft: 10 }}>
                  Also ordered from this restaurant
                </Text>
                <FlatList
                  data={alsoOrdered}
                  horizontal
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => router.push(`/product/${item.id}`)} style={{ width: 140, marginRight: 12 }}>
                      <Image source={{ uri: item.image_url }} style={{ width: "100%", height: 100, borderRadius: 8, marginBottom: 8 }} />
                      <Text numberOfLines={1} style={{ fontWeight: "600" }}>{item.name}</Text>
                      <Text style={{ color: "#00C2CF", fontWeight: "700", marginTop: 4 }}>${item.price}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={styles.paymentCard}>
              <Text style={{ fontWeight: "700", marginBottom: 8 }}>Payment details</Text>

                        {/* Payment method */}
          <TouchableOpacity
                style={styles.selectRow}
                onPress={() => {
                  if (methods.length === 0) return;
                  // Hiển thị Alert để chọn phương thức
                  Alert.alert(
                    "Select Payment Method",
                    "",
                    methods.map((m) => ({
                      text: m.title + (m.last4 ? ` ••••${m.last4}` : ""),
                      onPress: () => setSelectedMethod(m),
                    }))
                  );
                }}
              >
              <Text>
                Payment method:{" "}
                {selectedMethod
                  ? selectedMethod.title +
                    (selectedMethod.last4 ? ` ••••${selectedMethod.last4}` : "")
                  : "Chưa có phương thức"}
              </Text>
                <Ionicons name="chevron-forward-outline" size={20} color="#14a3d6" />
              </TouchableOpacity>

              {/* Promotion */}
              <TouchableOpacity
                style={styles.selectRow}
                onPress={() => {
                  // 👇 Điều hướng sang trang chọn khuyến mãi
                  router.push({
                    pathname: "../khuyenmai", // 👈 đường dẫn đến trang khuyến mãi
                    params: {
                          orderId: order?.id,        
                      subtotal: totalPrice.toString(),
                      paymentMethod: selectedMethod?.type || "",
                      restaurantId: order?.idRestaurant || "",
                    },
                  });
                }}
              >
                <Text>Promotion: - ${promotion.toFixed(2)}</Text>
                <Ionicons name="chevron-forward-outline" size={20} color="#14a3d6" />
              </TouchableOpacity>


           <View style={styles.totalsRow}>
  <Text>Delivery fee</Text>
  <Text>{restaurant ? restaurant.delivery_fee.toLocaleString() + '₫' : '0₫'}</Text>
</View>

<View style={styles.totalRow}>
  <Text style={{ fontSize: 16, fontWeight: "700" }}>Total</Text>
  <Text style={{ fontSize: 16, fontWeight: "700" }}>
    {((totalPrice + (restaurant?.delivery_fee || 0)) - promotion).toLocaleString()}₫
  </Text>
</View>

              <TouchableOpacity style={styles.orderNowBtn} onPress={handleOrderNow}>
                <Text style={styles.orderNowText}>Order now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Modal chọn địa chỉ */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 60 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ position: "absolute", left: 10 }}>
              <Text style={{ fontSize: 30, color: "#14a3d6" }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Address</Text>
          </View>
          <ScrollView style={{ paddingHorizontal: 16 }}>
            {addresses.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={{
                  backgroundColor: selectedAddress?.id === a.id ? "#E0F7FA" : "#fff",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                }}
                onPress={() => handleSelectAddress(a)}
              >
                <Text style={{ fontWeight: "700" }}>
                  {a.name} - {a.phone} {a.isDefault && "(Mặc định)"}
                </Text>
                <Text style={{ color: "#555", marginTop: 4 }}>{a.addr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  orderItem: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 12, marginBottom: 12, borderBottomColor: "#f0f0f0", borderBottomWidth: 1 },
  itemMainInfo: { flexDirection: "row", flex: 1 },
  itemImage: { width: 72, height: 72, borderRadius: 8, backgroundColor: "#f6f6f6" },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  itemName: { fontWeight: "700", fontSize: 15, flex: 1, paddingRight: 8 },
  itemMeta: { color: "#666", marginTop: 4, fontSize: 13 },
  itemControls: { width: 90, alignItems: "flex-end", paddingLeft: 8 },
  itemPrice: { fontWeight: "700", color: "#333", fontSize: 15 },
  quantityControl: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  decreaseButton: { width: 32, height: 32, borderRadius: 6, backgroundColor: "#fafafa", borderColor: "#ddd", borderWidth: 1, justifyContent: "center", alignItems: "center" },
  buttonText: { fontSize: 18, fontWeight: "600" },
  quantityText: { marginHorizontal: 12, fontSize: 15 },
  increaseButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#00C2CF", justifyContent: "center", alignItems: "center" },
  increaseButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  paymentCard: { marginTop: 14, backgroundColor: '#fff', padding: 12, borderRadius: 10, borderColor: '#eee', borderWidth: 1 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopColor: '#f0f0f0', borderTopWidth: 1, marginTop: 8 },
  orderNowBtn: { backgroundColor: '#00C2CF', paddingVertical: 14, borderRadius: 8, marginTop: 12, alignItems: 'center' },
  orderNowText: { color: '#fff', fontWeight: '700' },
  selectRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomColor: "#eee", borderBottomWidth: 1 },
});
