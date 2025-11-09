import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FactoriesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const router = useRouter();

  const fetchFavorites = async () => {
    try {
      const favData = await AsyncStorage.getItem("favorites");
      setFavorites(favData ? JSON.parse(favData) : []);
    } catch (error) {
      console.error("Lỗi khi tải favorites:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const removeFavorite = async (id: number) => {
    Alert.alert(
      "Xóa sản phẩm",
      "Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const updated = favorites.filter(item => item.id !== id);
            setFavorites(updated);
            await AsyncStorage.setItem("favorites", JSON.stringify(updated));
          },
        },
      ]
    );
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>💔 Chưa có sản phẩm yêu thích nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>❤️ Danh sách yêu thích</Text>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
            </View>
            {/* Actions: heart + delete */}
            <View style={styles.actions}>
              <Ionicons name="heart" size={24} color="#FF4D6D" style={{ marginRight: 12 }} />
              <Pressable onPress={() => removeFavorite(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', padding: 16., marginTop:60 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 14, color: '#38E2FF', fontWeight: '500', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
