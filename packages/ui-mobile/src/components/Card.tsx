import { View, type ViewProps, type ViewStyle } from "react-native";
import { type ReactNode, forwardRef } from "react";

/**
 * Card component props
 */
export interface CardProps extends Omit<ViewProps, "style"> {
  /** Card content */
  children: ReactNode;
  /** Custom style override */
  style?: ViewStyle;
  /** Padding preset */
  padding?: "none" | "sm" | "md" | "lg";
  /** Enable shadow */
  shadow?: boolean;
}

/**
 * Get padding based on preset
 */
function getPadding(padding: CardProps["padding"]): number {
  const paddingMap: Record<NonNullable<CardProps["padding"]>, number> = {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
  };
  return paddingMap[padding ?? "md"];
}

/**
 * Reusable Card component for content containers
 *
 * @example
 * ```tsx
 * <Card padding="md" shadow>
 *   <Text>Card content</Text>
 * </Card>
 * ```
 */
export const Card = forwardRef<View, CardProps>(function Card(
  { children, style, padding = "md", shadow = false, ...props },
  ref
) {
  const cardStyle: ViewStyle = {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: getPadding(padding),
    ...(shadow && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...style,
  };

  return (
    <View ref={ref} style={cardStyle} {...props}>
      {children}
    </View>
  );
});
