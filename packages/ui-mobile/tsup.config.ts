import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: true,
  treeshake: true,
  outDir: "dist",
  // External dependencies - don't bundle these
  external: [
    "react",
    "react-native",
    "@maison/types",
    "@maison/utils",
  ],
  // Ensure JSX is properly transformed
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
