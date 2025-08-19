import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/subreddits": "http://localhost:8000",
      "/users": "http://localhost:8000",
      "/posts": "http://localhost:8000",
      "/comments": "http://localhost:8000",
      "/jobs": "http://localhost:8000",
    },
  },
});
