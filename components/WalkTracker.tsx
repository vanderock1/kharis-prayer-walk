import { AppContext } from "@/contexts/AppContext";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { StyleSheet } from "react-native";
type Props = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function WalkTracker({ children, onClose }: Props) {
  console.log("WalkTracker2 rendered");

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
      snapPoints={[200, "50%", "100"]}
      style={styles.container}
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#ffadadad",
    zIndex: 1000, // Ensure it appears above other content
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
});
