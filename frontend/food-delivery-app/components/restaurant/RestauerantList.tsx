import React from "react";
import { View, Text, StyleSheet } from "react-native";
import RestaurantCard, { Restaurant } from "./RestaurantCard";
import { router } from "expo-router";

type Props = {
  restaurants: Restaurant[];
  onPress?: (r: Restaurant) => void;
  title?: string;
  viewAllLabel?: string;
};

export default function RestaurantList({
  restaurants,
  onPress,
  title = "All Restaurants",
  viewAllLabel = "View all",
}: Props) {
  return (
    <View style={styles.section}>
     
      {Array.isArray(restaurants) &&
        restaurants.map((r, i) => 
        (<RestaurantCard key={r?.id ?? i} restaurant={r} onPress={()=>router.push({
                          pathname: "/restaurantDetail/[id]",
                          
                          params: { id: String(r.id) },
                          
                        })} />))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 25 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  viewAll: { fontSize: 13, color: "#00bcd4", fontWeight: "500" },
});