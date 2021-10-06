const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: "node", // IMPORTANT!
  mode: "production",
  entry: {
    HealthCheck: path.resolve(__dirname, "../HealthCheck/index.ts"),
    Leads: path.resolve(__dirname, "../Leads/index.ts"),
    LeadsFilterOptions: path.resolve(__dirname, "../LeadsFilterOptions/index.ts"),
    LeadInfo: path.resolve(__dirname, "../LeadInfo/index.ts"),
    UpdateLeadInfo: path.resolve(__dirname, "../updateLeadInfo/index.ts"),
    HomeBird: path.resolve(__dirname, "../HomeBird/index.ts"),
    Dashboard: path.resolve(__dirname, "../Dashboard/index.ts"),
    LoanOfficer: path.resolve(__dirname, "../LoanOfficer/index.ts"),
    UpdateFaq: path.resolve(__dirname, "../UpdateFaq/index.ts"),
    HelpFaq: path.resolve(__dirname, "../HelpFaq/index.ts"),
    CreateFaq: path.resolve(__dirname, "../CreateFaq/index.ts"),
    LoanOfficerByName: path.resolve(__dirname, "../LoanOfficerByName/index.ts"),
    SendPushNotification: path.resolve(__dirname, "../SendPushNotification/index.ts"),
    Analytics: path.resolve(__dirname, "../Analytics/index.ts"),
    SendEmail: path.resolve(__dirname, "../SendEmail/index.ts"),
    GroupIds: path.resolve(__dirname, "../GroupIds/index.ts"),
    GroupLOs: path.resolve(__dirname, "../GroupLOs/index.ts"),
    UpdateLoGroup: path.resolve(__dirname, "../UpdateLoGroup/index.ts"),
    CreateBanner: path.resolve(__dirname, "../CreateBanner/index.ts"),
    UpdateBanner: path.resolve(__dirname, "../UpdateBanner/index.ts"),
    Banners: path.resolve(__dirname, "../Banners/index.ts"),
    ExportLeads: path.resolve(__dirname, "../ExportLeads/index.ts"),
    InvitedUsers: path.resolve(__dirname, "../InvitedUsers/index.ts"),
    UserAccounts: path.resolve(__dirname, "../UserAccounts/index.ts"),
    AccountPrivileges: path.resolve(__dirname, "../AccountPrivileges/index.ts"),
    InviteUser: path.resolve(__dirname, "../InviteUser/index.ts"),
    RemoveInvitedUser: path.resolve(__dirname, "../RemoveInvitedUser/index.ts"),
    Timeline: path.resolve(__dirname, "../Timeline/index.ts"),
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
