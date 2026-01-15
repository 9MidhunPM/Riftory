import 'dotenv/config';

export default {
  expo: {
    name: "Riftory",
    slug: "Riftory",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/iconz.jpg",
    scheme: "riftory",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.riftory.marketplace",
      adaptiveIcon: {
        backgroundColor: "#1a1a2e",
        foregroundImage: "./assets/images/iconz.jpg"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/iconz.jpg"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/iconz.jpg",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1a1a2e",
          dark: {
            backgroundColor: "#1a1a2e"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      // Uses environment variable if set, otherwise defaults to production API
      apiUrl: process.env.API_URL || 'https://riftory-api.onrender.com/api',
      eas: {
        projectId: "367a9561-05fc-4ad2-8319-cae4e08544c0"
      }
    },
  }
};
