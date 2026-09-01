const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Point Metro at the Tailwind entry so utility classes compile for native + web.
module.exports = withNativeWind(config, { input: "./src/global.css" });
