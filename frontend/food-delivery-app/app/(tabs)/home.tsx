import React, { useState, useEffect } from "react";
import RestaurantList from "../../components/restaurant/RestauerantList";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {getRestaurantImageById,} from "../../data/dataService";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = "http://10.79.255.95:5000/api"; // Android Emulator


export default function TabOneScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [restaurantList, setRestaurantList] = useState<any[]>([]); // thêm state

  // 🔹 Lấy thông tin user từ AsyncStorage (nếu đã đăng nhập)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("currentUser");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.hoTen || "");
        }
      } catch (error) {
        console.log("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };
    fetchUser();
  }, []);
// 🔹 Lấy restaurant trực tiếp từ API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${API_URL}/restaurants`, { timeout: 5000 });
        setRestaurantList(res.data || []);
      } catch (error: any) {
        if (error.response) {
          console.error("Server error:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
        setRestaurantList([]); // fallback
      }
    };
    fetchRestaurants();
  }, []);

  const banners = [
    {
      id: 1,
      title: "Join Party",
      price: "$1",
      color: "#A78BFA",
      colorButton: "#38E2FF",
      image: require("../../assets/images/hamburger.png"),
    },
    {
      id: 2,
      title: "Big Sale",
      price: "Up to 50%",
      color: "#FBBF24",
      colorButton: "#FF6B00",
      image: require("../../assets/images/hamburger.png"),
    },
    {
      id: 3,
      title: "New Drinks",
      price: "Buy 1 Get 1",
      color: "#34D399",
      colorButton: "#00796B",
      image: require("../../assets/images/hamburger.png"),
    },
  ];

  const categories = [
    { id: 1, title: "Rice", color: "#a6f6fe", img: require("../../assets/images/rice.png") },
    { id: 2, title: "Healthy", color: "#dbcaf7", img: require("../../assets/images/ht.png") },
    { id: 3, title: "Drink", color: "#c5d1f7", img: require("../../assets/images/drink.png") },
    { id: 4, title: "Fastfood", color: "#f7d9c1", img: require("../../assets/images/healthy.png") },
    { id: 5, title: "Snack", color: "#f5cbcc", img: require("../../assets/images/snack.png") },
  ];



  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="location-outline" size={22} color="#fff" />
          <Text style={styles.homeText}>Home</Text>
        </View>

        {/* 👇 Nếu có user đã đăng nhập, hiển thị lời chào */}
        {userName ? (
          <Text style={styles.userGreeting}>Xin chào, {userName} 👋</Text>
        ) : null}

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>
      </View>

      {/* MAIN SCROLL AREA */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* BANNER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginVertical: 15 }}
        >
          {banners.map((item) => (
            <View
              key={item.id}
              style={[styles.bannerCard, { backgroundColor: item.color }]}
            >
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerPrice}>{item.price}</Text>
                <TouchableOpacity
                  style={[styles.bannerButton, { backgroundColor: item.colorButton }]}
                >
                  <Text style={styles.bannerButtonText}>SEE MORE</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bannerRight}>
                <Image source={item.image} style={styles.bannerImg} resizeMode="contain" />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryItem}
              onPress={() =>
                router.push({
                  pathname: "/categoryDetail/[id]",
                  params: { id: String(item.id) },
                })
              }
            >
              <View style={[styles.categoryIconWrapper, { backgroundColor: item.color }]}>
                <Image source={item.img} style={styles.categoryIcon} />
              </View>
              <Text style={styles.categoryText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* VOUCHER */}
   {/* VOUCHER */}
<TouchableOpacity
  style={styles.voucherBox}
  onPress={() => router.push("/khuyenmai")} // 👈 chuyển sang trang khuyến mãi
>
  <FontAwesome
    name="gift"
    size={20}
    color="#00796b"
    style={{ marginRight: 4, marginTop: 2 }}
  />
  <Text style={styles.voucherText}>You have 5 vouchers here</Text>
</TouchableOpacity>

        {/* COLLECTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <View style={styles.collectionList}>
            {[
              { title: "FREESHIP", img: require("../../assets/images/collection1.png") },
              { title: "DEAL $1", img: require("../../assets/images/collection2.png") },
              { title: "NEAR YOU", img: require("../../assets/images/collection3.png") },
              { title: "POPULAR", img: require("../../assets/images/collection4.png") },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.collectionRow}>
                <View style={styles.imageWrapper}>
                  <Image source={item.img} style={styles.collectionImg} />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.collectionText}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECOMMENDED */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {restaurantList
              .sort((a, b) => {
                if (a.estimated_delivery_time !== b.estimated_delivery_time)
                  return a.estimated_delivery_time - b.estimated_delivery_time;
                if (a.rating !== b.rating) return b.rating - a.rating;
                return a.delivery_fee - b.delivery_fee;
              })
              .slice(0, 10)
              .map((restaurant, i) => (
                <View key={i} style={[styles.card, { justifyContent: "space-between", marginBottom: 2 }]}>
                  <Image
                    source={getRestaurantImageById(restaurant.id) || { uri: restaurant.image_url }}
                    style={styles.cardImg}
                  />
                  <View style={{ flex: 1, justifyContent: "space-between", marginTop: 6 }}>
                    <View>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {restaurant.name}
                      </Text>
                      <Text style={styles.cardSub}>
                        ⏱ {restaurant.estimated_delivery_time} mins • ⭐ {restaurant.rating.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.badgeContainer}>
                      {restaurant.delivery_fee < 10000 && (
                        <View style={[styles.badge, { backgroundColor: "#ff9800" }]}>
                          <Text style={styles.badgeText}>Free ship</Text>
                        </View>
                      )}
                      {restaurant.estimated_delivery_time < 20 && (
                        <View style={[styles.badge, { backgroundColor: "#00bcd4" }]}>
                          <Text style={styles.badgeText}>Near you</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>

        {/* ALL RESTAURANTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Restaurants</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>

          <RestaurantList restaurants={restaurantList} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** ============ Layout chung ============ */
  safeArea: { flex: 1, backgroundColor: "#00BCD4" },
  scrollArea: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: -10,
    padding: 10,
    paddingBottom: 90,
  },
  header: { backgroundColor: "#00BCD4", paddingHorizontal: 15, paddingBottom: 25, paddingTop: 60 },
  headerContent: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  homeText: { fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 6 },
  userGreeting: { color: "#fff", fontSize: 16, fontWeight: "500", marginBottom: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 7,
    paddingHorizontal: 10,
    height: 40,
  },
  input: { flex: 1, paddingHorizontal: 8, color: "#000" },
  bannerCard: {
    width: 290,
    height: 140,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerLeft: { flex: 0.5, justifyContent: "center", alignItems: "flex-start" },
  bannerRight: { flex: 0.5, alignItems: "center", justifyContent: "center" },
  bannerTitle: { fontSize: 20, fontWeight: "bold", color: "#000" },
  bannerPrice: { fontSize: 26, fontWeight: "bold", color: "#2e3e6dff", marginBottom: 5 },
  bannerButton: { borderRadius: 5, paddingVertical: 6, paddingHorizontal: 12 },
  bannerButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  bannerImg: { width: 200, height: 120, marginTop: 5 },
  categories: { flexDirection: "row", marginBottom: 10 },
  categoryItem: { alignItems: "center", marginRight: 10 },
  categoryIconWrapper: { borderRadius: 28, margin: 5 },
  categoryIcon: { width: 43, height: 43, margin: 7 },
  categoryText: { fontSize: 12 },
  voucherBox: {
    flexDirection: "row",
    backgroundColor: "#e0f7fa",
    borderRadius: 5,
    padding: 10,
    marginVertical: 20,
  },
  voucherText: { color: "#00796b", fontWeight: "500", marginLeft: 5, marginVertical: 4 },
  collectionList: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 10 },
  collectionRow: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 12,
    width: "48%",
    height: 70,
    elevation: 3,
  },
  imageWrapper: { flex: 0.4, height: "100%" },
  textWrapper: { flex: 0.6, justifyContent: "center", alignItems: "center" },
  collectionImg: { width: "100%", height: "100%", resizeMode: "cover" },
  collectionText: { fontSize: 13, fontWeight: "600", color: "#333", textAlign: "center" },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  viewAll: { fontSize: 13, color: "#00bcd4", fontWeight: "500" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 10,
  },
  cardImg: { width: 130, height: 130, borderRadius: 10 },
  cardTitle: { fontWeight: "600", marginTop: 5, flexWrap: "wrap", width: 120 },
  cardSub: { fontSize: 12, color: "#555" },
  badgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
});
