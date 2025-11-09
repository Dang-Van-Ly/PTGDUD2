import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { users } from '../../data/mockData';

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

export default function PaymentScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'Card', title: '', last4: '' });

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

  // Thêm phương thức thanh toán mới
  const add = async () => {
    if (!form.title) return Alert.alert('Nhập tên phương thức');
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: form.type as any,
      title: form.title,
      last4: form.last4,
    };
    const updatedMethods = [newCard, ...methods];
    setMethods(updatedMethods);
    setForm({ type: 'Card', title: '', last4: '' });
    setModal(false);

    // Lưu lại vào AsyncStorage
    await saveMethods(updatedMethods);
  };

  // Đặt phương thức mặc định
  const setDefault = async (id: string) => {
    const updatedMethods = methods.map(m => ({ ...m, isDefault: m.id === id }));
    setMethods(updatedMethods);
    await saveMethods(updatedMethods);
  };

  // Lưu vào AsyncStorage và cập nhật user mockData
  const saveMethods = async (updatedMethods: PaymentMethod[]) => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (!userData) return;
      const currentUser = JSON.parse(userData);
      // Cập nhật user trong mockData
    const userIndex = users.findIndex(u => u.id === currentUser.id);
if (userIndex >= 0) {
  (users[userIndex] as User).paymentMethods = updatedMethods;
}

      // Lưu lại vào AsyncStorage
      const updatedUser = { ...currentUser, paymentMethods: updatedMethods };
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.log('Lỗi lưu phương thức thanh toán:', error);
    }
  };

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán</Text>
      </View>

      {/* Danh sách phương thức */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {methods.map(m => (
          <View key={m.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {m.title} {m.isDefault && <Text style={styles.default}>• Mặc định</Text>}
              </Text>
              <Text style={styles.info}>
                {m.type} {m.last4 ? ' · **** ' + m.last4 : ''}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              {!m.isDefault && (
                <TouchableOpacity onPress={() => setDefault(m.id)}>
                  <Text style={styles.link}>Đặt mặc định</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addTxt}>+ Thêm phương thức thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Thêm */}
      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Thêm phương thức thanh toán</Text>
          </View>

          <View style={{ padding: 16 }}>
            <Text style={styles.label}>Tên (Ví dụ: Visa, Momo)</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={t => setForm({ ...form, title: t })}
            />

            <Text style={styles.label}>4 số cuối thẻ (nếu là thẻ)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.last4}
              onChangeText={t => setForm({ ...form, last4: t })}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={add}>
              <Text style={styles.saveTxt}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles giữ nguyên
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 12, color: '#333' },

  card: { flexDirection: 'row', padding: 12, backgroundColor: '#f7f7f7', borderRadius: 12, marginBottom: 12 },
  name: { fontWeight: '700' },
  default: { color: '#00BCD4', fontWeight: '700' },
  info: { color: '#666', marginTop: 6 },

  link: { color: '#007AFF' },

  addBtn: { backgroundColor: '#00BCD4', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  addTxt: { color: '#fff', fontWeight: '700' },

  modalWrap: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12 },

  label: { marginTop: 8, color: '#444' },
  input: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginTop: 6, backgroundColor: '#fff' },

  saveBtn: { marginTop: 16, backgroundColor: '#00BCD4', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveTxt: { color: '#fff', fontWeight: '700' },
});
