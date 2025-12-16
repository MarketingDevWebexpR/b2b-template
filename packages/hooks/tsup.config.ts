import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "b2b/index": "src/b2b/index.ts",
    "cart/index": "src/cart/index.ts",
    "api/index": "src/api/index.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "@maison/api-client", "@maison/types"],
});
