import 'setimmediate';
import { Stack } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useColorScheme } from "@/components/useColorScheme";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import FontAwesome from "@expo/vector-icons/FontAwesome";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tabs có thanh điều hướng */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Các trang khác vẫn dùng chung tab bar */}
        <Stack.Screen name="restaurantDetail" options={{ headerShown: false }} />
        <Stack.Screen name="categoryDetail" options={{ headerShown: false }} />
        {/* Có thể thêm các trang khác nếu cần */}
      </Stack>
    </ThemeProvider>
  );
}
