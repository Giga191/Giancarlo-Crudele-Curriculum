import { defineConfig } from "vite";
import { resolve } from "path";

// Tre pagine: redirect radice → /3d/, la città 3D e il CV testuale.
// (Il vecchio sito isometrico è in /_archivio-iso, fuori dalla build.)
export default defineConfig({
  server: {
    port: 5500,
    open: "/3d/",
    host: true   // ascolta anche sulla rete locale (per provare dal telefono)
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        city3d: resolve(__dirname, "3d/index.html"),
        cv: resolve(__dirname, "cv.html")
      }
    }
  }
});
