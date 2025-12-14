// React Native CLI configuration
// Excludes packages from native autolinking while keeping their JS/Babel plugins available

module.exports = {
  dependencies: {
    // Exclude react-native-worklets from native build
    // Its native code is incompatible with RN 0.76.9, but its Babel plugin is required
    // by react-native-reanimated/plugin for worklet transformations
    'react-native-worklets': {
      platforms: {
        ios: null,     // Don't link on iOS
        android: null, // Don't link on Android
      },
    },
  },
};
