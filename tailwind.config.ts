import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f2e7",
        card: "#fffaf1",
        sand: "#ede2c7",
        ink: "#1f2a1f",
        muted: "#5d655b",
        accent: "#c35f24",
        accentDark: "#8f3d16",
        line: "#d3c3a3",
        moss: "#2d6a4f",
      },
      boxShadow: {
        card: "0 12px 30px rgba(143, 61, 22, 0.08)",
      },
      borderRadius: {
        panel: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

