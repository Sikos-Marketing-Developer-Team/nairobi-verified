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
        target: mode === 'development' 
          ? 'http://localhost:5000'  // Local backend in development
          : 'https://nairobi-verified-backend-4c1b.onrender.com', // Production backend
        changeOrigin: true,
        secure: false,
        withCredentials: true,
        rewrite: (path) => path // Keep the /api prefix
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
          'react-vendor': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
          'radix': ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
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