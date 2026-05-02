// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Partial<Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  // Workout
  "figure.strengthtraining.traditional": "fitness-center",
  "dumbbell.fill": "fitness-center",
  "list.bullet": "list",
  "chart.line.uptrend.xyaxis": "show-chart",
  "person.fill": "person",
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "checkmark.circle.fill": "check-circle",
  "checkmark.circle": "radio-button-unchecked",
  "timer": "timer",
  "flame.fill": "local-fire-department",
  "trophy.fill": "emoji-events",
  "calendar": "calendar-today",
  "square.and.arrow.up": "share",
  "trash.fill": "delete",
  "pencil": "edit",
  "magnifyingglass": "search",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "ellipsis": "more-horiz",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "arrow.clockwise": "refresh",
  "info.circle": "info",
  "gear": "settings",
  "star.fill": "star",
  "bolt.fill": "bolt",
  "chart.bar.fill": "bar-chart",
  "muscle.fill": "fitness-center",
  "book.fill": "menu-book",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
