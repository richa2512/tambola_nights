import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tambola.housie",
  appName: "Tambola Housie",
  webDir: "out",
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#f8fafc",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f8fafc",
      overlaysWebView: false,
    },
  },
};

export default config;
