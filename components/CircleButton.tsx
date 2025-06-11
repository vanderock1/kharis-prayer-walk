import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  onPress: () => void;
  iconName?: React.ComponentProps<typeof MaterialIcons>["name"]; // Restrict to valid icon names
  style?: StyleProp<ViewStyle> | typeof styles.circleButtonContainer;
};

export default function CircleButton({
  onPress,
  iconName = "add",
  style = styles.circleButtonContainer,
}: Props) {
  return (
    <View style={style}>
      <Pressable style={styles.circleButton} onPress={onPress}>
        <MaterialIcons name={iconName} size={10} color="#25292e" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  circleButtonContainer: {
    width: 40,
    height: 40,
    marginHorizontal: 60,
    borderWidth: 2,
    borderColor: "rgb(255, 211, 61)",
    borderRadius: 42,
    padding: 3,
  },
  circleButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 42,
    backgroundColor: "#fff",
  },
});
