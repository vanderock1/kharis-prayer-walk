import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import MapViewer from "@/components/MapViewer";
import WalkTracker from "@/components/WalkTracker";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import CircleButton from "@/components/CircleButton";
import { AppContext } from "@/contexts/AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const PlaceholderImage = require("@/assets/images/placeholder.webp");

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [walking, setWalking] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [walkingData, setWalkingData] = useState<string[]>([]);
  const isModalVisible = walking;
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  const onModalClose = () => {
    setWalking(false);
  };
  const onModalOpen = () => {
    console.log("onModalOpen called");
    setWalking(true);
  };

  return (
    <GestureHandlerRootView style={styles.main}>
      <SafeAreaProvider>
        <AppContext.Provider
          value={{ walking, setWalking, permissions, setPermissions }}
        >
          <SafeAreaView style={styles.main}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <Text style={styles.text}>Home screen</Text>
              <View
                style={{
                  ...styles.container,
                  ...styles.itemContainer,
                  backgroundColor: "blue",
                }}
              >
                <ImageViewer imgSource={PlaceholderImage} />
              </View>
              <View
                style={{
                  ...styles.container,
                  ...styles.itemContainer,
                  backgroundColor: "red",
                }}
              >
                <MapViewer />
              </View>
              <View
                style={{
                  ...styles.container,
                  ...styles.itemContainer,
                  backgroundColor: "green",
                }}
              >
                <ImageViewer imgSource={PlaceholderImage} />
              </View>
            </ScrollView>
            <View
              style={{
                ...styles.footerContainer,
                ...(walking ? styles.hide : {}),
              }}
            >
              <Button label="start walk" onPress={onModalOpen} />
            </View>
            <WalkTracker isVisible={isModalVisible} onClose={onModalClose}>
              <Text>Walk Tracker</Text>
              <CircleButton iconName="close" onPress={onModalClose} />
            </WalkTracker>
          </SafeAreaView>
        </AppContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#25292e",
  },
  container: {
    flex: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    borderRadius: 18,
    overflow: "hidden",
  },
  scrollViewContainer: {
    // flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // padding: 10,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  footerContainer: {
    alignItems: "center",
    position: "relative",
    bottom: 5,
    left: "auto",
    right: "auto",
    width: "100%",
    zIndex: 2, // Ensure it appears above other content
  },
  hide: {
    display: "none",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
