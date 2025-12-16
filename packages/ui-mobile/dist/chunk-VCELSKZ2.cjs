'use strict';

var reactNative = require('react-native');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/components/Button.tsx
function getVariantStyles(variant) {
  const styles = {
    primary: {
      container: { backgroundColor: "#1a1a1a" },
      text: { color: "#ffffff" }
    },
    secondary: {
      container: { backgroundColor: "#f5f5f5" },
      text: { color: "#1a1a1a" }
    },
    outline: {
      container: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#1a1a1a" },
      text: { color: "#1a1a1a" }
    },
    ghost: {
      container: { backgroundColor: "transparent" },
      text: { color: "#1a1a1a" }
    }
  };
  return styles[variant];
}
function getSizeStyles(size) {
  const styles = {
    sm: {
      container: { paddingVertical: 8, paddingHorizontal: 16 },
      text: { fontSize: 14 }
    },
    md: {
      container: { paddingVertical: 12, paddingHorizontal: 20 },
      text: { fontSize: 16 }
    },
    lg: {
      container: { paddingVertical: 16, paddingHorizontal: 24 },
      text: { fontSize: 18 }
    }
  };
  return styles[size];
}
var Button = react.forwardRef(function Button2({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  disabled,
  style,
  textStyle,
  ...props
}, ref) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled ?? loading;
  const containerStyle = {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    opacity: isDisabled ? 0.5 : 1,
    ...variantStyles.container,
    ...sizeStyles.container,
    ...style
  };
  const labelStyle = {
    fontWeight: "600",
    ...variantStyles.text,
    ...sizeStyles.text,
    ...textStyle
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactNative.Pressable,
    {
      ref,
      disabled: isDisabled,
      style: containerStyle,
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(reactNative.Text, { style: labelStyle, children: loading ? "Loading..." : children })
    }
  );
});
function getPadding(padding) {
  const paddingMap = {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24
  };
  return paddingMap[padding ?? "md"];
}
var Card = react.forwardRef(function Card2({ children, style, padding = "md", shadow = false, ...props }, ref) {
  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: getPadding(padding),
    ...shadow && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    },
    ...style
  };
  return /* @__PURE__ */ jsxRuntime.jsx(reactNative.View, { ref, style: cardStyle, ...props, children });
});

exports.Button = Button;
exports.Card = Card;
//# sourceMappingURL=chunk-VCELSKZ2.cjs.map
//# sourceMappingURL=chunk-VCELSKZ2.cjs.map