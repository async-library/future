module.exports = {
  presets: [],
  plugins: ["@babel/plugin-proposal-object-rest-spread"],

  env: {
    test: {
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-runtime"],
    },
  },
}
