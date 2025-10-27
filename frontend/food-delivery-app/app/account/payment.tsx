// app/account/payment.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Card = { id: string; type: 'Card' | 'Momo' | 'VNPay'; title: string; last4?: string; isDefault?: boolean };

const sample: Card[] = [
  { id: 'C1', type: 'Card', title: 'Visa •••• 4242', last4: '4242', isDefault: true },
  { id: 'C2', type: 'Momo', title: 'Ví Momo •0123456789' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState<Card[]>(sample);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'Card', title: '', last4: '' });

  const add = () => {
    if (!form.title) return Alert.alert('Nhập tên phương thức');
    const newCard: Card = { id: Date.now().toString(), type: form.type as any, title: form.title, last4: form.last4 };
    setMethods((p) => [newCard, ...p]);
    setModal(false);
    setForm({ type: 'Card', title: '', last4: '' });
  };

  const setDefault = (id: string) => {
    setMethods((p) => p.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {methods.map((m) => (
          <View key={m.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.title}{m.isDefault ? <Text style={styles.default}> • Mặc định</Text> : null}</Text>
              <Text style={styles.info}>{m.type}{m.last4 ? ' · **** ' + m.last4 : ''}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => setDefault(m.id)}>
                <Text style={styles.link}>Đặt mặc định</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addTxt}>+ Thêm phương thức thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>

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
            <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />

            <Text style={styles.label}>4 số cuối thẻ (nếu là thẻ)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={form.last4} onChangeText={(t) => setForm({ ...form, last4: t })} />

            <TouchableOpacity style={styles.saveBtn} onPress={add}>
              <Text style={styles.saveTxt}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
