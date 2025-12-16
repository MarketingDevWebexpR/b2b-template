import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    eslint: "src/eslint.ts",
    prettier: "src/prettier.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  outDir: "dist",
});
