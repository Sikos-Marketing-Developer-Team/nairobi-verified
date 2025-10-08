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
        target: 'https://nairobi-verified-backend-4c1b.onrender.com',
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
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep React and React-DOM together in a single chunk
          'react-vendor': ['react', 'react-dom'],
          // UI libraries in separate chunks
          'lucide': ['lucide-react'],
          'radix': ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-toast'], // add your specific radix imports
        },
      },
    },
    sourcemap: mode === 'development',
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
}));