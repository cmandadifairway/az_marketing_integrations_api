const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: "node", // IMPORTANT!
  mode: "production",
  entry: {
    HealthCheck: path.resolve(__dirname, "../HealthCheck/index.ts"),
    LoanOfficer: path.resolve(__dirname, "../LoanOfficer/index.ts"),
    UpdateFaq: path.resolve(__dirname, "../UpdateFaq/index.ts"),
    CreateFaq: path.resolve(__dirname, "../CreateFaq/index.ts"),
    LoanOfficerByName: path.resolve(__dirname, "../LoanOfficerByName/index.ts"),
    GroupIds: path.resolve(__dirname, "../GroupIds/index.ts"),
    GroupLOs: path.resolve(__dirname, "../GroupLOs/index.ts"),
    UpdateLoGroup: path.resolve(__dirname, "../UpdateLoGroup/index.ts"),
    CreateBanner: path.resolve(__dirname, "../CreateBanner/index.ts"),
    UpdateBanner: path.resolve(__dirname, "../UpdateBanner/index.ts"),
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
