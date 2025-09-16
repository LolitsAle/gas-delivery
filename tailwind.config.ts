// tailwind.config.ts
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0F1111",
          bgSecondary: "#1A1C1C",
          accent: "#FF9900",
          accentHover: "#F08804",
          text: "#FFFFFF",
          textSecondary: "#D5D9D9",
          border: "#2A2E2E",
          success: "#17A34A",
          error: "#D62828",
          blueDark: "#1E3A8A", // xanh dương đậm
          blue: "#2563EB", // xanh dương chính
          blueLight: "#60A5FA", // xanh dương nhạt
          gradientTop: "#2563EB", // xanh đậm đầu gradient
          gradientMid: "#60A5FA", // xanh nhạt giữa gradient
          gradientBottom: "#FFFFFF", // trắng cuối gradient
          yellow: "#FFD700", // vàng sáng slogan
          yellowLight: "#FFF176", // vàng nhạt hơn
        },
      },
    },
  },
};
