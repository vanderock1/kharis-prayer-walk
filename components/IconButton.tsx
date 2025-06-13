import AntDesign from "@expo/vector-icons/AntDesign";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  icon: keyof typeof AntDesign.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
};

export default function IconButton({ icon, label, onPress, color = "#fff" }: Props) {
  return (
    <Pressable style={styles.iconButton} onPress={onPress}>
      <AntDesign name={icon} size={24} color={color} />
      <Text style={{ ...styles.iconButtonLabel, color: color }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonLabel: {
    color: "#fff",
    marginTop: 12,
  },
});
