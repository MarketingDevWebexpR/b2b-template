/**
 * ScannerOverlay Component
 * Premium transparent overlay with animated scan line, corner markers with glow effect,
 * and product info preview when scanned
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import type { Product } from '@bijoux/types';
import { springConfigs } from '../../constants/animations';
import { COLORS, SCANNER_TOKENS } from '../../constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scanner area dimensions
const SCAN_AREA_SIZE = Math.min(SCREEN_WIDTH * 0.75, SCANNER_TOKENS.scanAreaMaxWidth);
const CORNER_SIZE = SCANNER_TOKENS.cornerSize;
const CORNER_THICKNESS = SCANNER_TOKENS.cornerThickness;
const SCAN_LINE_HEIGHT = SCANNER_TOKENS.scanLineHeight;

interface ScannerOverlayProps {
  isScanning: boolean;
  scannedProduct?: Product | null;
  isLoading?: boolean;
  error?: string | null;
}

// Animated Corner Component
function AnimatedCorner({
  position,
  pulseProgress,
  glowOpacity,
  isSuccess,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  pulseProgress: Animated.SharedValue<number>;
  glowOpacity: Animated.SharedValue<number>;
  isSuccess: boolean;
}) {
  const color = isSuccess ? COLORS.success : COLORS.hermes;
  const glowColor = isSuccess ? COLORS.successGlow : COLORS.accentGlow;

  const cornerStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseProgress.value, [0, 0.5, 1], [1, 1.05, 1]);
    return {
      transform: [{ scale }],
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getPositionStyle = () => {
    switch (position) {
      case 'topLeft':
        return { top: 0, left: 0 };
      case 'topRight':
        return { top: 0, right: 0 };
      case 'bottomLeft':
        return { bottom: 0, left: 0 };
      case 'bottomRight':
        return { bottom: 0, right: 0 };
    }
  };

  const getBorderStyle = () => {
    switch (position) {
      case 'topLeft':
        return {
          borderTopWidth: CORNER_THICKNESS,
          borderLeftWidth: CORNER_THICKNESS,
          borderTopLeftRadius: 8,
        };
      case 'topRight':
        return {
          borderTopWidth: CORNER_THICKNESS,
          borderRightWidth: CORNER_THICKNESS,
          borderTopRightRadius: 8,
        };
      case 'bottomLeft':
        return {
          borderBottomWidth: CORNER_THICKNESS,
          borderLeftWidth: CORNER_THICKNESS,
          borderBottomLeftRadius: 8,
        };
      case 'bottomRight':
        return {
          borderBottomWidth: CORNER_THICKNESS,
          borderRightWidth: CORNER_THICKNESS,
          borderBottomRightRadius: 8,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.corner,
        getPositionStyle(),
        getBorderStyle(),
        { borderColor: color },
        cornerStyle,
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.cornerGlow,
          {
            backgroundColor: glowColor,
            ...getPositionStyle(),
          },
          glowStyle,
        ]}
      />
    </Animated.View>
  );
}

// Product Preview Component
function ProductPreview({
  product,
  isLoading,
  error,
}: {
  product?: Product | null;
  isLoading?: boolean;
  error?: string | null;
}) {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (product || error) {
      translateY.value = withSpring(0, springConfigs.gentle);
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = 50;
      opacity.value = 0;
    }
  }, [product, error]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (isLoading) {
    return (
      <Animated.View style={[styles.productPreview, animatedStyle]}>
        <BlurView intensity={20} tint="dark" style={styles.previewBlur}>
          <View style={styles.previewContent}>
            <View style={styles.loadingDot} />
            <Text style={styles.loadingText}>Recherche du produit...</Text>
          </View>
        </BlurView>
      </Animated.View>
    );
  }

  if (error && !product) {
    return (
      <Animated.View style={[styles.productPreview, animatedStyle]}>
        <BlurView intensity={20} tint="dark" style={styles.previewBlur}>
          <View style={styles.previewContent}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>
              Ce code-barres ne correspond à aucun produit
            </Text>
          </View>
        </BlurView>
      </Animated.View>
    );
  }

  if (!product) return null;

  return (
    <Animated.View style={[styles.productPreview, animatedStyle]}>
      <BlurView intensity={20} tint="dark" style={styles.previewBlur}>
        <View style={styles.previewContent}>
          {product.images?.[0] && (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            {product.reference && (
              <Text style={styles.productReference}>
                Ref. {product.reference}
              </Text>
            )}
            <Text style={styles.productPrice}>
              {product.price?.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

export function ScannerOverlay({
  isScanning,
  scannedProduct,
  isLoading,
  error,
}: ScannerOverlayProps) {
  // Animation values
  const scanLinePosition = useSharedValue(0);
  const cornerPulse = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const instructionOpacity = useSharedValue(1);

  const isSuccess = !!scannedProduct;

  // Scan line animation
  useEffect(() => {
    if (isScanning) {
      scanLinePosition.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      scanLinePosition.value = withTiming(0.5, { duration: 300 });
    }

    return () => {
      cancelAnimation(scanLinePosition);
    };
  }, [isScanning, scanLinePosition]);

  // Corner pulse animation
  useEffect(() => {
    cornerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(cornerPulse);
    };
  }, [cornerPulse]);

  // Glow animation
  useEffect(() => {
    if (isSuccess) {
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withTiming(0.4, { duration: 400 })
      );
    } else {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }

    return () => {
      cancelAnimation(glowOpacity);
    };
  }, [isSuccess, glowOpacity]);

  // Instruction fade animation
  useEffect(() => {
    if (scannedProduct || isLoading || error) {
      instructionOpacity.value = withTiming(0, { duration: 200 });
    } else {
      instructionOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
    }

    return () => {
      cancelAnimation(instructionOpacity);
    };
  }, [scannedProduct, isLoading, error, instructionOpacity]);

  // Animated styles
  const scanLineStyle = useAnimatedStyle(() => ({
    top: interpolate(
      scanLinePosition.value,
      [0, 1],
      [0, SCAN_AREA_SIZE - SCAN_LINE_HEIGHT]
    ),
    opacity: isScanning ? 0.8 : 0,
  }));

  const instructionStyle = useAnimatedStyle(() => ({
    opacity: instructionOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Dark overlay around scan area */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayMiddle}>
        <View style={styles.overlaySide} />

        {/* Scan area */}
        <View style={styles.scanArea}>
          {/* Corner markers */}
          <AnimatedCorner
            position="topLeft"
            pulseProgress={cornerPulse}
            glowOpacity={glowOpacity}
            isSuccess={isSuccess}
          />
          <AnimatedCorner
            position="topRight"
            pulseProgress={cornerPulse}
            glowOpacity={glowOpacity}
            isSuccess={isSuccess}
          />
          <AnimatedCorner
            position="bottomLeft"
            pulseProgress={cornerPulse}
            glowOpacity={glowOpacity}
            isSuccess={isSuccess}
          />
          <AnimatedCorner
            position="bottomRight"
            pulseProgress={cornerPulse}
            glowOpacity={glowOpacity}
            isSuccess={isSuccess}
          />

          {/* Animated scan line */}
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <View style={[styles.scanLineGradient, { backgroundColor: isSuccess ? COLORS.success : COLORS.hermes }]} />
          </Animated.View>
        </View>

        <View style={styles.overlaySide} />
      </View>
      <View style={styles.overlayBottom}>
        {/* Instructions */}
        <Animated.View style={[styles.instructionsContainer, instructionStyle]}>
          <Text style={styles.instructionTitle}>Scanner un code</Text>
          <Text style={styles.instructionText}>
            Placez le code-barres ou QR code dans le cadre
          </Text>
          <View style={styles.supportedTypes}>
            <Text style={styles.supportedLabel}>Types supportés:</Text>
            <Text style={styles.supportedText}>
              QR Code, EAN-13, EAN-8, UPC-A, Code 128
            </Text>
          </View>
        </Animated.View>

        {/* Product preview */}
        <ProductPreview
          product={scannedProduct}
          isLoading={isLoading}
          error={error}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Overlay sections
  overlayTop: {
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT - SCAN_AREA_SIZE) / 2 - 50,
    backgroundColor: COLORS.overlayDark,
  },

  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },

  overlaySide: {
    width: (SCREEN_WIDTH - SCAN_AREA_SIZE) / 2,
    height: SCAN_AREA_SIZE,
    backgroundColor: COLORS.overlayDark,
  },

  overlayBottom: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: COLORS.overlayDark,
    alignItems: 'center',
    paddingTop: 32,
  },

  // Scan area
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },

  // Corner markers
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },

  cornerGlow: {
    position: 'absolute',
    width: CORNER_SIZE * 2,
    height: CORNER_SIZE * 2,
    borderRadius: CORNER_SIZE,
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: SCAN_LINE_HEIGHT,
    alignItems: 'center',
  },

  scanLineGradient: {
    width: '100%',
    height: SCAN_LINE_HEIGHT,
    borderRadius: 1,
    shadowColor: COLORS.hermes,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  // Instructions
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  instructionTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 20,
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  instructionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.whiteTranslucent,
    textAlign: 'center',
    lineHeight: 22,
  } as const,

  supportedTypes: {
    marginTop: 20,
    alignItems: 'center',
  },

  supportedLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  supportedText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.whiteTranslucent,
    textAlign: 'center',
    opacity: 0.7,
  },

  // Product preview
  productPreview: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },

  previewBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.overlayLight,
  },

  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  productInfo: {
    flex: 1,
    marginLeft: 16,
  },

  productName: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 4,
  },

  productReference: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.whiteTranslucent,
    marginBottom: 4,
    opacity: 0.8,
  },

  productPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.gold,
  },

  // Loading state
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.hermes,
    marginRight: 12,
  },

  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.whiteTranslucent,
  },

  // Error state
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 4,
  },

  errorHint: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.whiteTranslucent,
    opacity: 0.7,
  },
});

export default ScannerOverlay;
