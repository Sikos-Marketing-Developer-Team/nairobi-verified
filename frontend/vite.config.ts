import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Ensure React is available globally if needed
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep React and React-DOM together in one chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            // Other UI libraries
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('@radix-ui')) return 'radix';
            // All other vendor dependencies
            return 'vendor';
          }
        },
      },
    },
    // Ensure proper source maps for debugging
    sourcemap: mode === 'development',
    // Target modern browsers that support ES modules
    target: 'es2020',
  },
}));
