import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageStyle, Platform, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import MapView, { CameraZoomRange, PROVIDER_GOOGLE, Polyline, UserLocationChangeEvent } from "react-native-maps";

type Props = {
  style?: ImageStyle | TextStyle | ViewStyle;
  polyline?: boolean;
};
export default function MapViewer({ style, polyline = false }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapViewRef = useRef<MapView>(null);
  const locationChanged = useCallback((event: UserLocationChangeEvent) => {
    if (event.nativeEvent.coordinate) {
      const location = {
        coords: {
          latitude: event.nativeEvent.coordinate.latitude,
          longitude: event.nativeEvent.coordinate.longitude,
        },
        // console.debug("Location changed:", location);
      };

      const region = {
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      } as const;

      mapViewRef.current?.animateToRegion(region, 500);
    }
  }, []);
  const regionChanged = useCallback((region: any) => {
    // console.debug("Region changed:", region);
    setLocation({
      coords: {
        latitude: region.latitude,
        longitude: region.longitude,
      },
    } as Location.LocationObject);
  }, []);
  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  let text = "Waiting...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return Platform.OS != "web" ? (
    <>
      {/* <Text style={[styles.text]}>{text}</Text> */}
      <MapView
        cameraZoomRange={[15, 20] as CameraZoomRange}
        minZoomLevel={15}
        style={styles.map}
        showsUserLocation={true}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        onUserLocationChange={locationChanged}
        onRegionChangeComplete={regionChanged}
        ref={mapViewRef}
      >
        {polyline && (
          <Polyline
            coordinates={[
              { latitude: 37.78825, longitude: -122.4324 },
              { latitude: 37.78825, longitude: -122.4325 },
              { latitude: 37.78826, longitude: -122.4326 },
            ]}
            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={6}
          />
        )}
      </MapView>
    </>
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
