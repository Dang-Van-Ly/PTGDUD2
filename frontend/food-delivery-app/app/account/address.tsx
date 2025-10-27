// app/account/address.tsx
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

type Addr = { id: string; name: string; phone: string; addr: string; isDefault?: boolean };

const sample: Addr[] = [
  { id: 'A1', name: 'Nguyễn Luân', phone: '0123456789', addr: '123 Đường ABC, Quận 1', isDefault: true },
  { id: 'A2', name: 'Nhà hàng', phone: '0987654321', addr: '45 Đường XYZ, Quận 3' },
];

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Addr[]>(sample);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Addr | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', addr: '' });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', addr: '' });
    setModalVisible(true);
  };

  const openEdit = (a: Addr) => {
    setEditing(a);
    setForm({ name: a.name, phone: a.phone, addr: a.addr });
    setModalVisible(true);
  };

  const save = () => {
    if (!form.name || !form.phone || !form.addr) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (editing) {
      setAddresses((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)));
    } else {
      const newAddr: Addr = { id: Date.now().toString(), ...form };
      setAddresses((prev) => [newAddr, ...prev]);
    }
    setModalVisible(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Địa chỉ của tôi</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {addresses.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{a.name} {a.isDefault ? <Text style={styles.defaultBadge}> (Mặc định)</Text> : null}</Text>
              <Text style={styles.info}>{a.phone}</Text>
              <Text style={styles.info}>{a.addr}</Text>
            </View>

            <View style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => openEdit(a)}>
                <Text style={styles.link}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDefault(a.id)}>
                <Text style={styles.link}>Đặt mặc định</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addTxt}>+ Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Thêm/Sửa */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</Text>
          </View>

          <View style={{ padding: 16 }}>
            <Text style={styles.label}>Tên người nhận</Text>
            <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} keyboardType="phone-pad" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} />

            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput style={[styles.input, { height: 80 }]} multiline value={form.addr} onChangeText={(t) => setForm({ ...form, addr: t })} />

            <TouchableOpacity style={styles.saveBtn} onPress={save}>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 16, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', marginLeft: 12, color: '#333' },

  card: { flexDirection: 'row', padding: 12, backgroundColor: '#f7f7f7', borderRadius: 12, marginBottom: 12 },
  name: { fontWeight: '700', fontSize: 15 },
  defaultBadge: { color: '#00BCD4', fontWeight: '700' },
  info: { color: '#666', marginTop: 4 },

  link: { color: '#007AFF', marginTop: 6 },

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
