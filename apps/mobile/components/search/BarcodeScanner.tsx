/**
 * BarcodeScanner Component
 * Full-screen camera view with luxury overlay for scanning barcodes and QR codes
 * Features permission handling, torch toggle, scan success animation, and haptic feedback
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import { CameraView, FlashMode, BarcodeScanningResult } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Flashlight, FlashlightOff, Camera, RefreshCw, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { ScannerOverlay } from './ScannerOverlay';
import { useBarcodeScanner, SUPPORTED_BARCODE_TYPES } from '../../hooks/useBarcodeScanner';
import { springConfigs } from '../../constants/animations';
import { hapticFeedback } from '../../constants/haptics';
import { COLORS } from '../../constants/designTokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onProductFound?: (productId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Permission Request UI Component
function PermissionRequest({
  onRequestPermission,
  isLoading,
}: {
  onRequestPermission: () => void;
  isLoading: boolean;
}) {
  const buttonScale = useSharedValue(1);

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, springConfigs.button);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, springConfigs.button);
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.permissionContainer}>
      <LinearGradient
        colors={['rgba(43, 51, 63, 0.9)', 'rgba(43, 51, 63, 0.95)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.permissionContent}>
        <View style={styles.permissionIconContainer}>
          <Camera size={48} color={COLORS.gold} strokeWidth={1.5} />
        </View>
        <Text style={styles.permissionTitle}>Accès à la caméra</Text>
        <Text style={styles.permissionDescription}>
          Pour scanner les codes-barres et QR codes de vos bijoux préférés,
          nous avons besoin d'accéder à votre caméra.
        </Text>
        <AnimatedPressable
          style={[styles.permissionButton, buttonStyle]}
          onPress={onRequestPermission}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[COLORS.hermes, COLORS.hermesDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.permissionButtonGradient}
          >
            <Text style={styles.permissionButtonText}>
              {isLoading ? 'Vérification...' : 'Autoriser la caméra'}
            </Text>
          </LinearGradient>
        </AnimatedPressable>
        <Pressable
          style={styles.settingsLink}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.settingsLinkText}>
            Ouvrir les paramètres
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Success Animation Overlay
function ScanSuccessOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={styles.successOverlay}
    >
      <View style={styles.successCircle}>
        <View style={styles.successCheckmark} />
      </View>
    </Animated.View>
  );
}

export function BarcodeScanner({
  visible,
  onClose,
  onProductFound,
}: BarcodeScannerProps) {
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const {
    hasPermission,
    isPermissionLoading,
    requestPermission,
    isScanning,
    lastScan,
    lookupResult,
    handleBarcodeScan,
    resetScan,
  } = useBarcodeScanner();

  // Animation values for UI elements
  const closeButtonScale = useSharedValue(1);
  const torchButtonScale = useSharedValue(1);
  const actionButtonScale = useSharedValue(1);

  // Handle successful scan
  useEffect(() => {
    if (lookupResult.product && !lookupResult.isLoading) {
      // Success haptic feedback
      hapticFeedback.addToCartSuccess();
      setShowSuccessAnimation(true);

      // Hide success animation after delay
      const timeout = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [lookupResult.product, lookupResult.isLoading]);

  // Handle scan with haptic
  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // Light haptic on scan detection
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      handleBarcodeScan(result);
    },
    [handleBarcodeScan]
  );

  // Toggle torch
  const toggleTorch = useCallback(() => {
    hapticFeedback.softConfirm();
    setFlashMode((current) => (current === 'off' ? 'on' : 'off'));
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    hapticFeedback.softConfirm();
    onClose();
  }, [onClose]);

  // Handle scan again
  const handleScanAgain = useCallback(() => {
    hapticFeedback.quantityButtonPress();
    resetScan();
    setFlashMode('off');
  }, [resetScan]);

  // Handle view product
  const handleViewProduct = useCallback(() => {
    if (lookupResult.product) {
      hapticFeedback.addToCartPress();
      onClose();
      // Navigate to product page
      if (onProductFound) {
        onProductFound(lookupResult.product.id);
      } else {
        router.push(`/product/${lookupResult.product.id}`);
      }
    }
  }, [lookupResult.product, onClose, onProductFound]);

  // Button press handlers
  const handleClosePress = () => {
    closeButtonScale.value = withSequence(
      withSpring(0.9, springConfigs.snap),
      withSpring(1, springConfigs.button)
    );
    handleClose();
  };

  const handleTorchPress = () => {
    torchButtonScale.value = withSequence(
      withSpring(0.9, springConfigs.snap),
      withSpring(1, springConfigs.button)
    );
    toggleTorch();
  };

  // Animated styles
  const closeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeButtonScale.value }],
  }));

  const torchButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: torchButtonScale.value }],
  }));

  const actionButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: actionButtonScale.value }],
  }));

  if (!visible) return null;

  // Permission not granted yet
  if (hasPermission === null || isPermissionLoading) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.container}
      >
        <PermissionRequest
          onRequestPermission={requestPermission}
          isLoading={isPermissionLoading}
        />
      </Animated.View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.container}
      >
        <PermissionRequest
          onRequestPermission={requestPermission}
          isLoading={false}
        />
        {/* Close button */}
        <AnimatedPressable
          style={[styles.closeButton, closeButtonStyle]}
          onPress={handleClosePress}
        >
          <BlurView intensity={30} tint="dark" style={styles.buttonBlur}>
            <X size={24} color={COLORS.white} strokeWidth={2} />
          </BlurView>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        flash={flashMode}
        barcodeScannerSettings={{
          barcodeTypes: SUPPORTED_BARCODE_TYPES,
        }}
        onBarcodeScanned={isScanning ? onBarcodeScanned : undefined}
      />

      {/* Scanner Overlay */}
      <ScannerOverlay
        isScanning={isScanning}
        scannedProduct={lookupResult.product}
        isLoading={lookupResult.isLoading}
        error={lookupResult.error}
      />

      {/* Success Animation */}
      <ScanSuccessOverlay visible={showSuccessAnimation} />

      {/* Top Controls */}
      <View style={styles.topControls}>
        {/* Close Button */}
        <AnimatedPressable
          style={[styles.closeButton, closeButtonStyle]}
          onPress={handleClosePress}
        >
          <BlurView intensity={30} tint="dark" style={styles.buttonBlur}>
            <X size={24} color={COLORS.white} strokeWidth={2} />
          </BlurView>
        </AnimatedPressable>

        {/* Torch Toggle */}
        <AnimatedPressable
          style={[styles.torchButton, torchButtonStyle]}
          onPress={handleTorchPress}
        >
          <BlurView intensity={30} tint="dark" style={styles.buttonBlur}>
            {flashMode === 'on' ? (
              <Flashlight size={24} color={COLORS.hermes} strokeWidth={2} />
            ) : (
              <FlashlightOff size={24} color={COLORS.white} strokeWidth={2} />
            )}
          </BlurView>
        </AnimatedPressable>
      </View>

      {/* Bottom Actions */}
      {lookupResult.product && !lookupResult.isLoading && (
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={styles.bottomActions}
        >
          <BlurView intensity={40} tint="dark" style={styles.actionsBlur}>
            <View style={styles.actionsContent}>
              {/* Scan Again Button */}
              <Pressable
                style={styles.secondaryButton}
                onPress={handleScanAgain}
              >
                <RefreshCw size={20} color={COLORS.white} strokeWidth={2} />
                <Text style={styles.secondaryButtonText}>Scanner à nouveau</Text>
              </Pressable>

              {/* View Product Button */}
              <AnimatedPressable
                style={[styles.primaryButton, actionButtonStyle]}
                onPress={handleViewProduct}
                onPressIn={() => {
                  actionButtonScale.value = withSpring(0.95, springConfigs.button);
                }}
                onPressOut={() => {
                  actionButtonScale.value = withSpring(1, springConfigs.button);
                }}
              >
                <LinearGradient
                  colors={[COLORS.hermes, COLORS.hermesDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Voir le produit</Text>
                  <ChevronRight size={20} color={COLORS.white} strokeWidth={2} />
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </BlurView>
        </Animated.View>
      )}

      {/* Scan Again Button for Error State */}
      {lookupResult.error && !lookupResult.product && !lookupResult.isLoading && (
        <Animated.View
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={styles.bottomActions}
        >
          <BlurView intensity={40} tint="dark" style={styles.actionsBlur}>
            <View style={styles.actionsContent}>
              <AnimatedPressable
                style={[styles.primaryButton, { flex: 1 }, actionButtonStyle]}
                onPress={handleScanAgain}
                onPressIn={() => {
                  actionButtonScale.value = withSpring(0.95, springConfigs.button);
                }}
                onPressOut={() => {
                  actionButtonScale.value = withSpring(1, springConfigs.button);
                }}
              >
                <LinearGradient
                  colors={[COLORS.hermes, COLORS.hermesDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  <RefreshCw size={20} color={COLORS.white} strokeWidth={2} />
                  <Text style={styles.primaryButtonText}>Réessayer</Text>
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
  },

  // Permission UI
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  permissionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },

  permissionTitle: {
    fontFamily: 'PlayfairDisplay-SemiBold',
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },

  permissionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.whiteTranslucent,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  permissionButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },

  permissionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
  },

  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
  },

  settingsLink: {
    padding: 8,
  },

  settingsLinkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },

  // Top Controls
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  closeButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },

  torchButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },

  buttonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },

  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  successCheckmark: {
    width: 30,
    height: 15,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: COLORS.white,
    transform: [{ rotate: '-45deg' }, { translateY: -4 }],
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  actionsBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  actionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  secondaryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.white,
  },

  primaryButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },

  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
  },

  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
  },
});

export default BarcodeScanner;
