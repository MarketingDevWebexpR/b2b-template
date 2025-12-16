import { Pressable, Text, View, type PressableProps, type TextStyle, type ViewStyle } from "react-native";
import { type ReactNode, forwardRef } from "react";

/**
 * Button variant options
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

/**
 * Button size options
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button component props
 */
export interface ButtonProps extends Omit<PressableProps, "style"> {
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button text content */
  children: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Custom style override */
  style?: ViewStyle;
  /** Custom text style override */
  textStyle?: TextStyle;
}

/**
 * Get styles based on variant
 */
function getVariantStyles(variant: ButtonVariant): { container: ViewStyle; text: TextStyle } {
  const styles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: { backgroundColor: "#1a1a1a" },
      text: { color: "#ffffff" },
    },
    secondary: {
      container: { backgroundColor: "#f5f5f5" },
      text: { color: "#1a1a1a" },
    },
    outline: {
      container: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#1a1a1a" },
      text: { color: "#1a1a1a" },
    },
    ghost: {
      container: { backgroundColor: "transparent" },
      text: { color: "#1a1a1a" },
    },
  };
  return styles[variant];
}

/**
 * Get styles based on size
 */
function getSizeStyles(size: ButtonSize): { container: ViewStyle; text: TextStyle } {
  const styles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: { paddingVertical: 8, paddingHorizontal: 16 },
      text: { fontSize: 14 },
    },
    md: {
      container: { paddingVertical: 12, paddingHorizontal: 20 },
      text: { fontSize: 16 },
    },
    lg: {
      container: { paddingVertical: 16, paddingHorizontal: 24 },
      text: { fontSize: 18 },
    },
  };
  return styles[size];
}

/**
 * Reusable Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={() => console.log('pressed')}>
 *   Click me
 * </Button>
 * ```
 */
export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    children,
    loading = false,
    disabled,
    style,
    textStyle,
    ...props
  },
  ref
) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const isDisabled = disabled ?? loading;

  const containerStyle: ViewStyle = {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    opacity: isDisabled ? 0.5 : 1,
    ...variantStyles.container,
    ...sizeStyles.container,
    ...style,
  };

  const labelStyle: TextStyle = {
    fontWeight: "600",
    ...variantStyles.text,
    ...sizeStyles.text,
    ...textStyle,
  };

  return (
    <Pressable
      ref={ref}
      disabled={isDisabled}
      style={containerStyle}
      {...props}
    >
      <Text style={labelStyle}>
        {loading ? "Loading..." : children}
      </Text>
    </Pressable>
  );
});
