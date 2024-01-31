import { defineConfig } from "vite";
import path from "path"; // pnpm install @types/node -D
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // jsxRuntime: "classic",
      jsxRuntime: "automatic",
    }),
  ],
  resolve: {
    alias: {
      react: path.posix.resolve("src/react"),
      "react-dom": path.posix.resolve("src/react-dom"),
      "react-dom-bindings": path.posix.resolve("src/react-dom-bindings"),
      "react-reconciler": path.posix.resolve("src/react-reconciler"),
      scheduler: path.posix.resolve("src/scheduler"),
      shared: path.posix.resolve("src/shared"),
    },
  },
});
