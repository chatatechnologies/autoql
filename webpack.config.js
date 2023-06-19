const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "autoql-min.js",
    path: path.resolve(__dirname, "build"),
    libraryTarget: "umd",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /test_page/, /test/],
        loader: "babel-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "autoql.min.css" })],
  resolve: {
    extensions: [".js", ".jsx", ".css", ".scss"],
  },
  externals: {
    // Exclude all modules from node_modules
    "/.*/": "umd $0",
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
};
