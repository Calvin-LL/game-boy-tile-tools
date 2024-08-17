import { getViteConfig } from "astro/config";
import path from "node:path";

export default getViteConfig({
  test: {
    include: ["./src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    allowOnly: !process.env.CI,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
