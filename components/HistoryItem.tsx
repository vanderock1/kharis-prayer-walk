import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import IconButton from "./IconButton";
import ImageViewer from "./ImageViewer";
const PlaceholderImage = require("@/assets/images/map.png");

export type HistoryItemProps = {
  duration: string;
  distance: number;
  startStreet: string;
  endStreet: string;
  date: string;
};
function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log("showRightProgress:", prog.value);
    console.log("appliedTranslation:", drag.value);

    return {
      transform: [{ translateX: drag.value + 140 }],
      flexDirection: "row",
      position: "relative",
      marginLeft: -20,
      marginVertical: 7,
      width: 160,
      backgroundColor: "rgba(63, 63, 63, 0.53)",
      boxShadow: "0 0 0.4 rgba(0,0,0,0.5)",
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <View style={styles.delete}>
        <IconButton icon="delete" label="delete" color="rgb(168, 34, 0)" onPress={() => {}} />
      </View>
      <View style={styles.edit}>
        <IconButton icon="edit" label="edit" color="white" onPress={() => {}} />
      </View>
    </Reanimated.View>
  );
}
export default function HistoryItem({ ...data }: HistoryItemProps) {
  return (
    <ReanimatedSwipeable friction={2} enableTrackpadTwoFingerGesture rightThreshold={40} renderRightActions={RightAction}>
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
    </ReanimatedSwipeable>
  );
}
const builder = StyleSheet.create({
  rightAction: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
    // position: "absolute",
  },
});
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
  rightAction: {
    ...builder.rightAction,
  },
  separator: {
    height: "100%",
    borderRightWidth: 1,
  },
  delete: {
    ...builder.rightAction,
    color: "rgb(131, 2, 2)",
    marginLeft: 20,
    // left: 0,
  },
  edit: {
    ...builder.rightAction,
    // right: -40,
    color: "rgb(22, 126, 179)",
  },
});
