import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getRestaurantImageById,
  getAverageRatingByRestaurantId,

} from "../../data/dataService";

import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "../(tabs)/home";
export const options = {
  headerShown: false,
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
    const [restaurantList, setRestaurantList] = useState<any[]>([]); // thêm state
  
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
useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews?restaurantId=${id}`);
      setReviewList(res.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewList([]);
    }
  };

  fetchReviews();
}, [id]);

  const restaurant = restaurantList.find((r) => String(r.id) === String(id));
  const rating = getAverageRatingByRestaurantId(String(id));
const [reviewList, setReviewList] = useState<any[]>([]);
  const reviewsCount = reviewList.length;
const [producList, setProductList] = useState<any[]>([]);
  const [showAllForYou, setShowAllForYou] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products?restaurant_id=${id}`);
      setProductList(res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductList([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  fetchProducts();
}, [id]);
  // Sắp xếp theo rating (giảm dần) rồi theo purchase_count (giảm dần)
const sortedProducts = [...producList].sort((a, b) => {
  if (b.rating === a.rating) {
    return (b.purchase_count || 0) - (a.purchase_count || 0);
  }
  return (b.rating || 0) - (a.rating || 0);
});
 const [showAllMenu, setShowAllMenu] = useState(false);

  const displayedMenu = showAllMenu ? producList : producList.slice(0, 2);


  return (
    <FlatList
     style={{ backgroundColor: '#fff' }}
      data={[]} // không cần dữ liệu chính
      renderItem={null}
      ListHeaderComponent={
        <>
          {/* Banner */}
          <Image
            source={
              restaurant
                ? getRestaurantImageById(restaurant.id) || { uri: restaurant.image_url }
                : require("../../assets/images/br1.png")
            }
            style={styles.banner}
          />

          {/* Header Info */}
          <View style={styles.header}>
            <View style={[styles.tagContainer, { marginLeft: 80 }]}>
              <Text style={styles.tag}>Deal $1</Text>
              <Text style={styles.tag}>Near you</Text>
            </View>

            <Text style={styles.name}>{restaurant?.name ?? "Hana Chicken"}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#70dbfcff" />
                <Text style={styles.infoText}>6am - 9pm</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={16} color="#70dbfcff" />
                <Text style={styles.infoText}>2 km</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="pricetag-outline" size={16} color="#70dbfcff" />
                <Text style={styles.infoText}>$5 - $50</Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow2}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.infoLabel}>{rating}</Text>
              <Text style={styles.infoSubLabel}>({reviewsCount})</Text>
              <Ionicons name="chevron-forward" size={20} color="#474646ff" style={{ marginLeft: "auto" }} />
            </View>

            <View style={styles.infoRow2}>
              <Ionicons name="pricetags-outline" size={18} color="#00BCD4" />
              <Text style={styles.infoLabel}>2 vouchers</Text>
              <Text style={styles.infoSubLabel}> available</Text>
              <Ionicons name="chevron-forward" size={20} color="#474646ff" style={{ marginLeft: "auto" }} />
            </View>

            <View style={styles.infoRow2}>
              <Ionicons name="bicycle-outline" size={18} color="#00BCD4" />
              <Text style={styles.infoLabel}>Delivery</Text>
              <Text style={styles.infoSubLabel}> {restaurant?.estimated_delivery_time} mins</Text>
              <Ionicons name="chevron-forward" size={20} color="#474646ff" style={{ marginLeft: "auto" }} />
            </View>
          </View>

        {/* For You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>For You</Text>
            <Text
              style={styles.viewAll}
              onPress={() => setShowAllForYou(!showAllForYou)}
            >
              {showAllForYou ? "Show less" : "View all"}
            </Text>
          </View>

              <FlatList
            data={showAllForYou ? sortedProducts : sortedProducts.slice(0, 4)}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 15 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => (router as any).push(`/product/${item.id}`)}
              >
                <Image source={{ uri: item.image_url }} style={styles.foodImg} />
                <Text style={styles.foodName}>{item.name}</Text>
                <View style={styles.foodInfoRow}>
                  <Text style={styles.foodRating}>
                    <Ionicons name="star" size={14} color="#FFD700" /> {item.rating} 
                  </Text>
                  <Text style={{fontSize:12, color:"gray",marginRight:20}}>({item.purchase_count})</Text>
                  <Text style={styles.foodPrice}>${item.price}</Text>
                </View>
              </Pressable>
            )}
          />

        </View>


        {/* Menu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Menu</Text>
            <FlatList
              data={showAllMenu ? producList : producList.slice(0, 2)} 
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => (router as any).push(`/product/${item.id}`)}
                  >
                    <Image source={{ uri: item.image_url }} style={styles.menuImg} />
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.description}</Text>
                      <View style={styles.menuFooter}>
                        <Text style={styles.menuPrice}>${item.price}</Text>
                        <View style={styles.menuRating}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={{ marginLeft: 4 }}>{item.rating} (99)</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                )}
            />

            {/* ✅ Nút See all / Show less */}
            <View style={styles.seeAllBtn}>
              <Text
                style={styles.seeAllText}
                onPress={() => setShowAllMenu(!showAllMenu)} // toggle
              >
                {showAllMenu ? "Show less" : "See all"}
              </Text>
            </View>
          </View>


          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.viewAll}>View all</Text>
            </View>

            <FlatList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={reviewList}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <View style={styles.reviewCard}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
  source={{ uri: item.user_avatar || "https://i.pravatar.cc/35" }}
  style={styles.reviewAvatar}
/>

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.reviewName}>{item.user_name || "Anonymous"}</Text>
          <Text style={styles.reviewTime}>A day ago</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < Math.floor(item.rating) ? "star" : "star-outline"}
            size={14}
            color="#FFD700"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
      <Text style={styles.reviewText}>{item.comment}</Text>
    </View>
  )}
/>

          </View>

          {/* Combo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Combo</Text>
            {producList
             .filter((combo) => combo.category?.toLowerCase() === "combo")
            .map((combo, index) => (
              <Pressable
                key={index}
                style={styles.menuItem}
                onPress={() => (router as any).push(`/product/${combo.id}`)}
              >
                <Image
                  source={{
                    uri:combo.image_url
                  }}
                  style={styles.menuImg}
                />
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{combo.name}</Text>
                  <Text style={styles.menuDesc}>{combo.description}</Text>
                  <View style={styles.menuFooter}>
                    <Text style={styles.menuPrice}>${combo.price}</Text>
                    <View style={styles.menuRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={{ marginLeft: 4 }}>{combo.rating} ({combo.purchase_count})</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      }
    />
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop:40,
    backgroundColor: "#fff",

  },
  header: {
    position: "absolute",
    top: 170,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  tagContainer: {
    textAlign: "center",
    flexDirection: "row",
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  tag: {
 
    color: "#69d5f0ff",
    fontSize: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    marginTop:10,
  },
  info: {
    color: "#666",
    textAlign: "center",
    marginVertical: 6,
        marginTop:15,

  },
    /* new styles for icon + text row */
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  infoText: {
    color: "#666",
    marginLeft: 6,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  subInfo: {
    color: "#333",
  },
 
  section: { marginVertical: 15, paddingHorizontal: 15,backgroundColor: "#fff", },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  card: {
    marginRight: 15,
      width: '47%',
    backgroundColor: "#fff",
   borderRadius: 5,       // giảm từ 10 xuống 5
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
    paddingBottom: 8,
  },
  foodImg: { width: "100%", height: 115, borderTopLeftRadius: 5, borderTopRightRadius: 5},
  foodName: { fontWeight: "600", marginTop: 10, textAlign: "center" ,marginRight:"auto",marginLeft: 10, color:"#8a8787ff"},
  foodPrice: { textAlign: "center", color: "#131414ff", marginTop: 2,marginRight:5,fontWeight:"bold" },
  foodRating: { textAlign: "center", color: "#0a0a0aff", fontSize: 12, marginLeft:5 ,fontWeight:"bold"},





  infoCard: {
  backgroundColor: "#fff",
  borderRadius: 12,
 paddingHorizontal: 20,
  marginTop: 80, // đẩy xuống dưới banner và header

  
},

infoRow2: {
  flexDirection: "row",
 
 
  marginVertical: 10,

  borderBottomColor: '#e2dfdfff',
  borderBottomWidth: 2,
  paddingBottom:15,
  
  
},

infoLabel: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  marginLeft: 6,
},

infoSubLabel: {
  fontSize: 13,
  color: "#777",
  marginLeft: 2,
},
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},
viewAll: {
  color: '#70dbfcff',
  fontSize: 14,
},
foodInfoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between', // đẩy rating sang trái, price sang phải
  alignItems: 'center',
  paddingTop:15,
  marginTop: "auto",
  paddingHorizontal: 5,
},
menuItem: {
  flexDirection: 'row',
  
  marginBottom: 15,
},
menuImg: {
  width: 100,
  height: 100,
  borderRadius: 8,
},
menuInfo: {
  flex: 1,
  marginLeft: 10,
},
menuName: {
  color: '#333',
  fontSize: 16,
},
menuDesc: {
  color: '#777',
  fontSize: 13,
  marginVertical: 4,
},
menuFooter: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
   marginTop: 'auto',
},
menuPrice: {
  fontWeight: 'bold',
  color: '#131414',
},
menuRating: {
  flexDirection: 'row',
  alignItems: 'center',
  color: '#888',
},
seeAllBtn: {
  backgroundColor: '#CCF8FF',
  borderRadius: 6,
  paddingVertical: 10,
  marginTop: 5,
  alignItems: 'center',
},
seeAllText: {
  color: '#70dbfcff',
  fontWeight: '600',
  fontSize: 14,
},
reviewAvatar: {
  width: 35,
  height: 35,
  borderRadius: 20,
},
reviewCard: {
  backgroundColor: "#fff",
  borderRadius: 5,
  padding: 12,
  marginRight: 10,
   borderColor: '#e2dfdfff',
  borderWidth: 1,
  width: 260,
  marginBottom:15,
 
},
reviewName: { fontWeight: "600", fontSize: 14 },
reviewTime: { color: "#777", fontSize: 12 },
reviewText: { marginTop: 15, color: "#444", fontSize: 13 , marginBottom:20},

comboItem: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
  backgroundColor: "#fff",
  borderRadius: 10,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
  padding: 8,
},
comboImg: {
  width: 80,
  height: 80,
  borderRadius: 8,
},
comboInfo: {
  flex: 1,
  marginLeft: 10,
},
comboName: {
  fontWeight: "600",
  fontSize: 16,
},
comboDesc: {
  color: "#777",
  fontSize: 13,
  marginVertical: 4,
},
comboFooter: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
comboPrice: {
  fontWeight: "bold",
  color: "#131414",
},
comboRating: {
  flexDirection: "row",
  alignItems: "center",
},

});
