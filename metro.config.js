const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Wire NativeWind's Tailwind entry file into Metro so utility classes compile.
module.exports = withNativeWind(config, { input: "./src/global.css" });
