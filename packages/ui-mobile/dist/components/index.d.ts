import * as react from 'react';
import { ReactNode } from 'react';
import { PressableProps, ViewStyle, TextStyle, View, ViewProps } from 'react-native';

/**
 * Button variant options
 */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
/**
 * Button size options
 */
type ButtonSize = "sm" | "md" | "lg";
/**
 * Button component props
 */
interface ButtonProps extends Omit<PressableProps, "style"> {
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
 * Reusable Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={() => console.log('pressed')}>
 *   Click me
 * </Button>
 * ```
 */
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<View>>;

/**
 * Card component props
 */
interface CardProps extends Omit<ViewProps, "style"> {
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
 * Reusable Card component for content containers
 *
 * @example
 * ```tsx
 * <Card padding="md" shadow>
 *   <Text>Card content</Text>
 * </Card>
 * ```
 */
declare const Card: react.ForwardRefExoticComponent<CardProps & react.RefAttributes<View>>;

export { Button, type ButtonProps, Card, type CardProps };
