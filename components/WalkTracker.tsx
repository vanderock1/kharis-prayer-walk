import MapViewer from "@/components/MapViewer";
import { AppContext } from "@/contexts/AppContext";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { PropsWithChildren, useCallback, useContext, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import CircleButton from "./CircleButton";
type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function WalkTracker({ children, onClose }: Props) {
  const { walking, setWalking } = useContext(AppContext);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    if (index === -1) {
      onClose();
    }
  }, []);
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const expand = () => bottomSheetRef.current?.expand?.();
  const collapse = () => bottomSheetRef.current?.collapse?.();
  const close = () => bottomSheetRef.current?.close?.();

  // effects;
  useEffect(() => {
    walking ? expand() : close();
  }, [walking]);

  // renders
  return (
    <BottomSheet
      index={-1} // -1 means closed, 0 means collapsed, 1 means expanded
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      snapPoints={[75, "50%", "100"]}
      style={styles.container}
      backgroundStyle={styles.backgroundStyle}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={{ color: "white" }}>Walk Tracker</Text>
        <CircleButton iconName="close" onPress={close} />
        <View
          style={{
            ...styles.mapContainer,
            backgroundColor: "red",
          }}
        >
          <MapViewer style={styles.mapView} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundStyle: {
    backgroundColor: "rgba(0, 0, 0, 0.81)",
  },
  contentContainer: {
    flex: 1,
    padding: 5,
    alignItems: "center",
  },
  mapContainer: {
    width: "100%",
    height: 500,
    borderRadius: 16,
    overflow: "hidden",
  },
  mapViewer: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  mapView: {
    height: 500,
    width: "100%",
    flex: 1,
  },
});
