import { Tabs } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
          backgroundColor: "rgba(37, 41, 46, 0.38)",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "rgb(37, 41, 46)",
        },
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
