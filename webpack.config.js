const path = require("path");
const ExtensionReloader = require("webpack-extension-reloader");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  watch: true,
  devtool: "cheap-module-source-map",
  entry: {
    background: "./src/background/background.js",
    blocked: "./src/ui/blocked/index.js",
    popup: "./src/ui/popup/index.js"
  },
  output: {
    publicPath: ".",
    path: path.resolve(__dirname, "dist/"),
    filename: "[name].js",
    libraryTarget: "umd"
  },
  plugins: [
    new ExtensionReloader(),
    new CopyWebpackPlugin([{ from: "./static/*", flatten: true }])
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
