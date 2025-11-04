import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/receiptly/", // לשנות לשם הריפו שלך בדיוק!
});