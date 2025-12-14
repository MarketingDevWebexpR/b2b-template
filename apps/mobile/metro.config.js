// Metro configuration for Expo SDK 52 with NativeWind
// Handles @bijoux/* workspace package aliases for EAS Build compatibility
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Define workspace package alias mappings
// Maps @bijoux/* imports to local lib/shared files (inlined packages)
const aliases = {
  '@bijoux/types': path.resolve(projectRoot, 'lib/shared/types.ts'),
  '@bijoux/utils': path.resolve(projectRoot, 'lib/shared/utils.ts'),
};

// Custom resolveRequest to intercept @bijoux/* imports
// This runs BEFORE Metro's default resolution, ensuring aliases work
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if the module matches our aliases
  if (aliases[moduleName]) {
    return {
      filePath: aliases[moduleName],
      type: 'sourceFile',
    };
  }

  // Use default Metro resolution for everything else
  // context.resolveRequest delegates to Metro's built-in resolver
  return context.resolveRequest(context, moduleName, platform);
};

// Watch folders for development hot reload
// Ensures changes to lib/shared are picked up
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(projectRoot, 'lib'),
];

// Wrap with NativeWind for Tailwind CSS support
module.exports = withNativeWind(config, { input: './global.css' });
