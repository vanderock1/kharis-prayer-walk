import {
  ImageStyle,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

type Props = {
  style?: ImageStyle | TextStyle | ViewStyle;
};

export default function MapViewer({ style }: Props) {
  return Platform.OS != "web" ? (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      region={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}
    />
  ) : (
    <Text style={styles.text}>Map is not available on web</Text>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 140,
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
});
