import HistoryItem, { HistoryItemProps } from "@/components/HistoryItem";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

export interface HistoryViewProps {
  items: HistoryItemProps[];
}

function EmptyHistoryView() {
  return <View>No history</View>;
}

export default function HistoryView({ items }: HistoryViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);
  const _onPress = (item: HistoryItemProps) => {};

  return (
    <FlatList
      ListEmptyComponent={EmptyHistoryView}
      contentContainerStyle={{ paddingBottom: useBottomTabBarHeight() + 80 }}
      overScrollMode="always"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={items}
      renderItem={({ item, index, separators }) => (
        // <TouchableHighlight key={index} onPress={() => _onPress(item)} onShowUnderlay={separators.highlight} onHideUnderlay={separators.unhighlight}>
        <HistoryItem key={index} {...item} />
        // </TouchableHighlight>
      )}
    ></FlatList>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    paddingBottom: 80,
  },
});
