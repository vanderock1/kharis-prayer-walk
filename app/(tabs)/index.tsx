import Button from "@/components/Button";
import HistoryView from "@/components/HistoryView";
import WalkTracker from "@/components/WalkTracker";
import { AppContext } from "@/contexts/AppContext";
import { historyItems } from "@/data/mocks";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [walking, setWalking] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [walkingData, setWalkingData] = useState<string[]>([]);
  const isModalVisible = walking;

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
        <AppContext.Provider value={{ walking, setWalking, permissions, setPermissions }}>
          <SafeAreaView style={styles.main}>
            <HistoryView items={historyItems}></HistoryView>
            <View
              style={{
                ...styles.footerContainer,
                ...(walking ? styles.hide : {}),
              }}
            >
              <Button label="start walk" onPress={onModalOpen} />
            </View>
            <WalkTracker isVisible={isModalVisible} onClose={onModalClose} />
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
    fontFamily: "Roboto-Light",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    overflow: "hidden",
    height: 140,
    marginVertical: 3,
    marginHorizontal: 5,
  },
  scrollViewContainer: {
    paddingBottom: 80,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  footerContainer: {
    alignItems: "center",
    position: "absolute",
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
