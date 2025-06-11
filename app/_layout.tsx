import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Roboto-Light": require("@/assets/fonts/Roboto-Light.ttf"),
    "Roboto-Medium": require("@/assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Thin": require("@/assets/fonts/Roboto-Thin.ttf"),
  });
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <></>;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
