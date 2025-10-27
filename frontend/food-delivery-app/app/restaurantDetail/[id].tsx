import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAllRestaurants, getRestaurantImageById , getAverageRatingByRestaurantId, getReviewsByRestaurantId} from "../data/dataService";
export const options = {
  headerShown: false,
};
export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const restaurantList = getAllRestaurants();
  const restaurant = restaurantList.find(r => String(r.id) === String(id));
  const rating = getAverageRatingByRestaurantId(String(id));
  const reviewList= getReviewsByRestaurantId(String(id));
  const reviewsCount = reviewList.length;
  const forYou = [
    { name: "Fried Chicken", price: 15, rating: 4.5, img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
    { name: "Chicken Salad", price: 16, rating: 4.5, img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
    { name: "Spicy Chicken", price: 15, rating: 4.5, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },
    { name: "Fried Potatoes", price: 15, rating: 4.3, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" },
  ];

  const menu = [
    { name: "Saute Chicken Rice", desc: "Saute chicken, rice", price: 15, rating: 4.6, img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
    { name: "Chicken Burger", desc: "Fried chicken, cheese & burger", price: 15, rating: 4.5, img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
  ];

  const combos = [
    { name: "Combo B", desc: "Fried Chicken, Chicken Rice & Salad", price: 25, rating: 4.7 },
    { name: "Combo C", desc: "Fried Chicken, Small Fries & Potatoes", price: 19, rating: 4.6 },
  ];

  return (
    <ScrollView style={styles.container}>
<Image
  source={
    restaurant
      ? (getRestaurantImageById(restaurant.id)
          ? getRestaurantImageById(restaurant.id)
          : { uri: restaurant.image_url })
      : require("../../assets/images/br1.png") // ảnh mặc định
  }
  style={styles.banner}
/>





<View style={styles.header}>
  <View style={[styles.tagContainer, { marginLeft: 80 }]}>
    <Text style={styles.tag}>Deal $1</Text>
    <Text style={styles.tag}>Near you</Text>
  </View>

  <Text style={styles.name}>{restaurant?.name ?? "Hana Chicken"}</Text>

  {/* Thay Text duy nhất bằng hàng chứa icon + text */}
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

{/* --- Info Card dưới banner --- */}
<View style={styles.infoCard}>
  <View style={styles.infoRow2}>
    <Ionicons name="star" size={18} color="#FFD700" />
    <Text style={styles.infoLabel}>{rating}</Text>
    <Text style={styles.infoSubLabel}>({reviewsCount})</Text>
    <Ionicons name="chevron-forward" size={20} color="#474646ff"  style={{ marginLeft: 'auto' }}  />

  </View>

  <View style={styles.infoRow2}>
    <Ionicons name="pricetags-outline" size={18} color="#00BCD4" />
    <Text style={styles.infoLabel}>2 vouchers</Text>
    <Text style={styles.infoSubLabel}> available</Text>
    <Ionicons name="chevron-forward" size={20} color="#474646ff"  style={{ marginLeft: 'auto' }}  />

  </View>

  <View style={styles.infoRow2}>
    <Ionicons name="bicycle-outline" size={18} color="#00BCD4" />
    <Text style={styles.infoLabel}>Delivery</Text>
    <Text style={styles.infoSubLabel}> {restaurant?.estimated_delivery_time} mins</Text>
    <Ionicons name="chevron-forward" size={20} color="#474646ff"  style={{ marginLeft: 'auto' }}  />

  </View>
</View>

{/* --- For You Section --- */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>For You</Text>
    <Text style={styles.viewAll}>View all</Text>
  </View>

  <FlatList
    data={forYou}
    keyExtractor={(item, index) => index.toString()}
    numColumns={2}  
    columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <Image source={{ uri: item.img }} style={styles.foodImg} />
        <Text style={styles.foodName}>{item.name}</Text>
        <View style={styles.foodInfoRow}>
  <Text style={styles.foodRating}>
    <Ionicons name="star" size={14} color="#FFD700" /> {item.rating} ({99})
  </Text>
  <Text style={styles.foodPrice}>${item.price}</Text>
</View>

      </View>
    )}
  />
</View>

{/* --- Menu Section --- */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Menu</Text>

  <FlatList
    data={menu}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => (
      <View style={styles.menuItem}>
        <Image source={{ uri: item.img }} style={styles.menuImg} />
        <View style={styles.menuInfo}>
          <Text style={styles.menuName}>{item.name}</Text>
          <Text style={styles.menuDesc}>{item.desc}</Text>
          <View style={styles.menuFooter}>
            <Text style={styles.menuPrice}>${item.price}</Text>
            <View style={styles.menuRating}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={{ marginLeft: 4 }}>{item.rating} (99)</Text>
            </View>
          </View>
        </View>
      </View>
    )}
  />

  <View style={styles.seeAllBtn}>
    <Text style={styles.seeAllText}>See all</Text>
  </View>
</View>


    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop:40
  },
  header: {
    position: "absolute",
    top: 170, // đè lên phần dưới của banner
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
    
  },
  tag: {
    backgroundColor: "#E8F9F1",
    color: "#69d5f0ff",
    fontSize: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
    
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
 
  section: { marginVertical: 15, paddingHorizontal: 15 },
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
  foodRating: { textAlign: "center", color: "#888", fontSize: 12, marginLeft:5 },


  reviewCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  reviewName: { fontWeight: "600" },
  reviewText: { marginTop: 5, color: "#444" },
  comboCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  comboName: { fontWeight: "600", fontSize: 16 },
  comboPrice: { color: "#00BCD4", marginTop: 5 },
    restaurantMeta: {
    fontSize: 13,
    color: "#777",
  },
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
  marginTop: 10,
  paddingHorizontal: 5, // khoảng cách 2 bên với card
},
menuItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 15,
},
menuImg: {
  width: 80,
  height: 80,
  borderRadius: 8,
},
menuInfo: {
  flex: 1,
  marginLeft: 10,
},
menuName: {
  fontWeight: '600',
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

});
