// Metro configuration for Expo SDK 52 with NativeWind
// Handles @bijoux/* workspace package aliases for EAS Build compatibility
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Define workspace package alias mappings
// Maps @bijoux/* imports to local lib/shared files
const aliases = {
  '@bijoux/types': path.resolve(projectRoot, 'lib/shared/types.ts'),
  '@bijoux/utils': path.resolve(projectRoot, 'lib/shared/utils.ts'),
};

// Store the original resolver function
const originalResolveRequest = config.resolver.resolveRequest;

// Configure resolver for @bijoux/* aliases (inlined packages)
config.resolver = {
  ...config.resolver,

  // extraNodeModules provides fallback resolution
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    '@bijoux/types': path.resolve(projectRoot, 'lib/shared'),
    '@bijoux/utils': path.resolve(projectRoot, 'lib/shared'),
  },

  // Custom resolveRequest to intercept @bijoux/* imports
  // This is the most reliable way to handle aliases in Metro
  resolveRequest: (context, moduleName, platform) => {
    // Check if the module matches our aliases
    if (aliases[moduleName]) {
      return {
        filePath: aliases[moduleName],
        type: 'sourceFile',
      };
    }

    // Fall back to the default resolver for everything else
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }

    // Use context.resolveRequest for default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Watch folders for development hot reload
// Ensures changes to lib/shared are picked up
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(projectRoot, 'lib'),
];

// Wrap with NativeWind for Tailwind CSS support
module.exports = withNativeWind(config, { input: './global.css' });
