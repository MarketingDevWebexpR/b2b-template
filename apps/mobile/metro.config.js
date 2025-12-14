// Learn more https://docs.expo.dev/guides/monorepos
// SDK 52+ automatically detects monorepo, no manual config needed
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Wrap with NativeWind for Tailwind CSS support
module.exports = withNativeWind(config, { input: './global.css' });
