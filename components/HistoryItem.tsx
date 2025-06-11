import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";
import ImageViewer from "./ImageViewer";
const PlaceholderImage = require("@/assets/images/map.png");

export type HistoryItemProps = {
  duration: string;
  distance: number;
  startStreet: string;
  endStreet: string;
  date: string;
};

export default function HistoryItem({ ...data }: HistoryItemProps) {
  return (
    <View style={styles.container}>
      <ImageViewer imgSource={PlaceholderImage} style={styles.image} />
      <View style={styles.itemHeader}>
        <Text style={{ ...styles.text, ...styles.robotoLight, flex: 0.5 }}>{data.startStreet}</Text>
        <AntDesign name="right" size={12} color="rgb(255, 145, 0)" />
        <Text style={{ ...styles.text, ...styles.robotoLight, flex: 0.5 }}>{data.endStreet}</Text>
      </View>
      <View style={styles.itemHeader}>
        <Text style={{ ...styles.text, ...styles.robotoMedium, flex: 0.5 }}>
          <AntDesign name="calendar" size={16} color="rgb(255, 145, 0)" /> {data.date}
        </Text>
        <Text style={{ ...styles.text, ...styles.robotoMedium, flex: 0.5 }}>
          <MaterialCommunityIcons name="map-marker-distance" size={16} color="rgb(255, 145, 0)" /> {data.distance} km
        </Text>
        <Text style={{ ...styles.text, ...styles.robotoMedium, flex: 0.5 }}>
          <AntDesign name="clockcircleo" size={16} color="rgb(255, 145, 0)" /> {data.duration}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
    height: 150,
    marginVertical: 7,
    marginHorizontal: 7,
    backgroundColor: "rgb(25, 27, 28)",
  },
  image: {
    width: "100%",
    height: "40%",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginHorizontal: 8,
  },
  robotoLight: {
    fontFamily: "Roboto-Thin",
    fontWeight: "ultralight",
    fontSize: 32,
    color: "rgb(255, 145, 0)",
  },
  robotoMedium: {
    fontFamily: "Roboto-Medium",
    fontWeight: "medium",
    fontSize: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
});
