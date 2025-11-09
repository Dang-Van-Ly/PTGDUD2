import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getOrders } from '../../data/dataService';
import { restaurantImages } from '../../data/mockData';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../(tabs)/home';
export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

useFocusEffect(
  React.useCallback(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      try {
        const allOrders: any[] = await getOrders();

        // Tìm các order rỗng để xóa
        const emptyOrders = allOrders.filter(
          o => o.userId === userId && (o.items?.length || 0) === 0
        );

        // Xóa order rỗng (nếu backend hỗ trợ)
        for (let eo of emptyOrders) {
          await fetch(`${API_URL}/orders/${eo.id}`, {
            method: "DELETE",
          });
        }

        // Lọc lại orders còn item
        const userOrders = allOrders.filter(
          o => o.userId === userId && (o.items?.length || 0) > 0 && o.status === "chua_dat"
        );

        setOrders(userOrders);
      } catch (error) {
        console.log("Lỗi lấy orders:", error);
      }
    };
    fetchOrders();
  }, [userId])
);


  // Lấy user hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const user = JSON.parse(userData);
          setUserId(user.id || user._id);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  // Lấy orders từ backend
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      try {
        const allOrders: any[] = await getOrders();
        const userOrders = allOrders.filter(
          o => o.userId === userId && o.status === "chua_dat"
        );
        setOrders(userOrders);
      } catch (error) {
        console.log("Lỗi lấy orders:", error);
      }
    };
    fetchOrders();
  }, [userId]);

  const renderOrder = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/orders/${item.id}`)}
    >
      <Image
        source={
          item.idRestaurant
            ? restaurantImages[item.idRestaurant]
            : { uri: 'https://via.placeholder.com/60' }
        }
        style={styles.thumbnail}
      />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.orderId}>Mã đơn: {item.id}</Text>
        <Text style={styles.orderDate}>Ngày tạo: {item.createdAt?.slice(0,10)}</Text>
        <Text style={styles.orderStatus}>Trạng thái: Chưa đặt</Text>
        <Text style={styles.total}>Tổng: {item.total?.toLocaleString()}₫</Text>
        <Text style={styles.itemCount}>Số món: {item.items?.length || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.page}>
     
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>Bạn chưa có đơn hàng nào</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff', paddingTop: 6, paddingHorizontal: 16 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  card: { flexDirection: 'row', padding: 12, backgroundColor:'#f7f7f7', borderRadius:10, marginBottom:12, alignItems:'center' },
  thumbnail: { width: 90, height: 90, borderRadius: 8 },
  orderId: { fontWeight: '700', color:'#333' },
  orderDate: { fontSize: 13, color:'#777', marginVertical:2 },
  orderStatus: { fontSize: 13, color:'#FF9800' },
  total: { fontWeight:'700', color:'#00BCD4', marginTop:4 },
  itemCount: { fontSize: 13, color:'#777', marginTop:2 }
});
