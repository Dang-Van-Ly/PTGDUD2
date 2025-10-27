import React from "react";
import Swiper from "react-native-swiper";
import { ImageBackground } from "react-native";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAllRestaurants, getRestaurantImageById } from "../data/dataService";
import { Stack } from "expo-router";
import RestaurantList from "@/components/restaurant/RestauerantList";
export default function CategoryDetailScreen() {
  // id có thể là string | string[] | undefined
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  // đảm bảo là mảng để tránh lỗi .filter trên undefined
  const restaurantList = getAllRestaurants();

  // ánh xạ id -> loại món ăn (object, không phải array)
  const categoryMap: Record<string, string> = {
    "1": "Rice",
    "2": "Healthy",
    "3": "Drink",
    "4": "Fastfood",
    "5": "Snack",
  };

  // Lấy categoryKey an toàn (nếu id là mảng, lấy phần tử đầu)
  const categoryKey = Array.isArray(id) ? id[0] : (id ?? "");
  const categoryName = categoryMap[categoryKey] || "";

  // Lọc an toàn: kiểm tra restaurantList là mảng, kiểm tra cuisine_type
  const filteredRestaurants =
    Array.isArray(restaurantList) && categoryName
      ? [...restaurantList].filter((r) => {
          if (!r) return false;

          const ct = r.cuisine_type;
          if (Array.isArray(ct)) {
            return ct.includes(categoryName);
          }
           if (typeof ct === "string") {
          return String(ct)
            .split(",")
            .map((s) => s.trim())
            .includes(categoryName);
        }
          return false;
        })
      : [];
  //
  const topRestaurants = [...filteredRestaurants]
  .sort((a, b) => {
    if (b.rating === a.rating) {
      return a.estimated_delivery_time - b.estimated_delivery_time;
    }
    return b.rating - a.rating;
  })
  .slice(0, 3);

  // Debug (bỏ nếu muốn)
  // console.warn("categoryKey", categoryKey, "categoryName", categoryName, "found", filteredRestaurants.length);

  return (
    <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#7a7a7aff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName || "Category"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SORT / FILTER */}
      <View style={styles.sortBar}>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>Sort by ▼</Text>
        </TouchableOpacity>
        {["Freeship", "Favorite", "Near you"].map((label, i) => (
          <TouchableOpacity key={i} style={styles.filterTag}>
            <Text style={styles.filterText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RESTAURANT LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredRestaurants.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Không có nhà hàng cho mục {categoryName || categoryKey}.
            </Text>
          </View>
        ) : (<View style={{paddingHorizontal:15}}> 
          <RestaurantList restaurants={filteredRestaurants}  />
          </View>
        )}

        {/* SEE ALL */}
        <TouchableOpacity style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>

     {/* BANNER SLIDER */}
 <View style={styles.bannerContainer}>
      <Swiper
        autoplay
        autoplayTimeout={3}
        showsPagination
        dotColor="#ccc"
        activeDotColor="#00BCD4"
        style={styles.swiper}
      >
        {/* Slide 1 */}
        <View style={styles.slide}>
          <ImageBackground
            source={require("../../assets/images/br2.jpg")}
            style={styles.bannerImg}
            imageStyle={styles.imageStyle}
            resizeMode="contain"
          >
            <Text style={styles.bannerText}>Tasty{'\n'}Dishes</Text>
          </ImageBackground>
        </View>

        {/* Slide 2 */}
        <View style={styles.slide}>
          <ImageBackground
            source={require("../../assets/images/br3.png")}
            style={styles.bannerImg}
            imageStyle={styles.imageStyle}
            resizeMode="contain"
          >
            <Text style={styles.bannerText}>Delicious{'\n'}Food</Text>
          </ImageBackground>
        </View>

        {/* Slide 3 */}
        <View style={styles.slide}>
          <ImageBackground
            source={require("../../assets/images/br1.jpg")}
            style={styles.bannerImg}
            imageStyle={styles.imageStyle}
            resizeMode="contain"
          >
            <Text style={styles.bannerText}>Fresh{'\n'}Meals</Text>
          </ImageBackground>
        </View>
      </Swiper>
    </View>
  
        {/* RECOMMENDED */}
        <View style={styles.recommendSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>

        <RestaurantList restaurants={topRestaurants}  />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },

  header: {

    flexDirection: "row",
    alignItems: "center",
    
    padding: 10,
    backgroundColor: "#fff",
    marginTop:50
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" , marginLeft:10},

  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 8,
 
   
    borderColor: "#eee",
    paddingBottom:45,
    paddingTop:15
  },
  sortButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    marginRight: 10,
  },
  sortText: { color: "#00BCD4", fontWeight: "600" },
  filterTag: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: { fontSize: 13, color: "#555" },

  restaurantCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  restaurantImg: { width: 80, height: 80, borderRadius: 10 },
  restaurantName: { fontSize: 16, fontWeight: "600", color: "#222" },
  restaurantDesc: { fontSize: 13, color: "gray" },
  restaurantMeta: { fontSize: 13, color: "#777", marginTop: 2 },
  badgeContainer: { flexDirection: "row", marginTop: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },

  seeAllBtn: {
    backgroundColor: "#CFF8FF",
    marginHorizontal: 20,
    borderRadius: 7,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  seeAllText: { color: "#00BCD4", fontWeight: "600" },

bannerContainer: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 10,
  },
  swiper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  imageStyle: {
    borderRadius: 15,
  },
  bannerText: {
    position: "absolute",
    left: 25,
    top: 50,
    fontSize: 24,
    fontWeight: "bold",
    color: "#00BCD4",
  },
  recommendSection: { marginHorizontal: 15, marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  viewAll: { color: "#00BCD4", fontSize: 13 },

  recommendCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  recommendImg: { width: 90, height: 90, borderRadius: 10 },

  emptyWrap: { padding: 20, alignItems: "center" },
  emptyText: { color: "#666" },
});
