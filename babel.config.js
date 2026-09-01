module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // NativeWind compiles className on React Native components at build time.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
