module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // `jsxImportSource: nativewind` lets className flow through JSX at build time.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
