/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // Tell Remix where the app routes are
  appDirectory: "app",
  // Where to output the build
  assetsBuildDirectory: "public/build",
  // Where to output the server build
  serverBuildPath: "build/index.js",
  // Public path
  publicPath: "/build/",
};
