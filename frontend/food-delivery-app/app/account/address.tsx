// app/account/address.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Geocoder from 'react-native-geocoding';
import { users } from '../../data/mockData';

let MapView: any = null;
let Marker: any = null;
Geocoder.init('YOUR_API_KEY'); // Thay bằng Google Maps API Key của bạn

// Chỉ import react-native-maps trên mobile
if (Platform.OS !== 'web') {
  const RM = require('react-native-maps');
  MapView = RM.default;
  Marker = RM.Marker;
}

type Addr = {
  id: string;
  name: string;
  phone: string;
  addr: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

export default function AddressScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null); // ref map để animate
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Addr | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', addr: '' });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState({
    latitude: 14.0583,
    longitude: 108.2772,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });

  // Lấy vị trí hiện tại user
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }
    })();
  }, []);

  // Lấy địa chỉ của user
  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const currentUser = JSON.parse(userData);
          const user = users.find(u => u.id === currentUser.id);
          if (user) {
            const addrs = user.addrs.map(a => ({
              id: a.id,
              name: a.name,
              phone: a.phone,
              addr: a.address,
              latitude: a.latitude,
              longitude: a.longitude,
              isDefault: a.isDefault,
            }));
            setAddresses(addrs);
          }
        }
      } catch (error) {
        console.log('Lỗi khi lấy địa chỉ người dùng:', error);
      }
    };
    fetchUserAddresses();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', addr: '' });
    setMarker(null);
    setRegion({
      latitude: 14.0583,
      longitude: 108.2772,
      latitudeDelta: 5,
      longitudeDelta: 5,
    });
    setModalVisible(true);
  };

  const openEdit = (a: Addr) => {
    setEditing(a);
    setForm({ name: a.name, phone: a.phone, addr: a.addr });
    if (a.latitude && a.longitude) {
      setMarker({ latitude: a.latitude, longitude: a.longitude });
      setRegion({
        latitude: a.latitude,
        longitude: a.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    setModalVisible(true);
  };

  const save = () => {
    if (!form.name || !form.phone || !form.addr) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const lat = marker?.latitude;
    const lng = marker?.longitude;

    if (editing) {
      setAddresses(prev =>
        prev.map(p =>
          p.id === editing.id
            ? { ...p, ...form, latitude: lat, longitude: lng }
            : p
        )
      );
    } else {
      const newAddr: Addr = {
        id: Date.now().toString(),
        ...form,
        latitude: lat,
        longitude: lng,
      };
      setAddresses(prev => [newAddr, ...prev]);
    }

    setModalVisible(false);
  };

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
  };

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Địa chỉ của tôi</Text>
      </View>

      {/* Danh sách địa chỉ */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {addresses.map(a => (
          <TouchableOpacity key={a.id} onPress={() => openEdit(a)}>
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {a.name} {a.isDefault && <Text style={styles.defaultBadge}>(Mặc định)</Text>}
                </Text>
                <Text style={styles.info}>{a.phone}</Text>
                <Text style={styles.info}>{a.addr}</Text>
              </View>
            </View>
          </TouchableOpacity>
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

          <View style={{ padding: 16, flex: 1 }}>
            <Text style={styles.label}>Tên người nhận</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={t => setForm({ ...form, name: t })}
            />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={t => setForm({ ...form, phone: t })}
            />

            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ..."
              value={form.addr}
              onChangeText={t => setForm({ ...form, addr: t })}
              onEndEditing={async () => {
                if (form.addr) {
                  try {
                    const json = await Geocoder.from(form.addr);
                    if (json.results.length > 0) {
                      const loc = json.results[0].geometry.location;
                      const newRegion = {
                        latitude: loc.lat,
                        longitude: loc.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      };
                      setMarker({ latitude: loc.lat, longitude: loc.lng });
                      mapRef.current?.animateToRegion(newRegion, 500);
                    }
                  } catch (error) {
                    console.warn('Không tìm thấy địa chỉ', error);
                  }
                }
              }}
            />

            {/* Map chỉ trên mobile */}
            {Platform.OS !== 'web' && MapView && Marker && (
              <>
                <Text style={styles.label}>Chọn địa chỉ trên bản đồ</Text>
                <MapView
                  ref={mapRef}
                  style={{ flex: 1, borderRadius: 12, marginTop: 8 }}
                  initialRegion={region}
                  onPress={(e: any) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setMarker({ latitude, longitude });
                    setForm({ ...form, addr: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}` });
                  }}
                >
                  {marker && <Marker coordinate={marker} />}
                </MapView>
              </>
            )}

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
