import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: ".",
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "code-checkout": path.resolve(__dirname, "../../dist/esm"),
    },
  },
});
