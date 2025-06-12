import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "rgb(255, 211, 61)",
        headerStyle: {
          backgroundColor: "rgba(0, 83, 184, 0.38)",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "rgba(0, 0, 0, 0.12)",
          position: "absolute",
        },
        tabBarBackground: () => <BlurView tint="dark" intensity={50} style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView" />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "about",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "information-circle" : "information-circle-outline"} color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
