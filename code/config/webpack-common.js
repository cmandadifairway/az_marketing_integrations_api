const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: "node", // IMPORTANT!
  mode: "production",
  entry: {
    HealthCheck: path.resolve(__dirname, "../HealthCheck/index.ts"),
    GetDeltas: path.resolve(__dirname, "../GetDeltas/index.ts"),
    SendDeltasEmail: path.resolve(__dirname, "../SendDeltasEmail/index.ts"),
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      { test: /\.node$/, loader: 'node-loader' }
    ],
  },
};
