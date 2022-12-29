const logger = require("console");
const hasFlag = require("has-flag");
const path = require("path");
const RequireFrom = require("webpack-require-from");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const { devServer, statusCode } = require("@metablock/server");

const PWD = process.cwd();
const STATIC_PATH = "/static/";
const DIRECTORY = path.resolve(PWD, `.${STATIC_PATH}`);

const mode = process.env.NODE_ENV === "production" ? "production" : "development";

const config = {
  mode,
  entry: {
    luca: "./app/Index.tsx",
  },
  output: {
    publicPath: STATIC_PATH,
    path: DIRECTORY,
    filename: "block.js",
    chunkFilename: "[name].bundle.js",
    libraryTarget: "umd",
  },
  devtool: "source-map",
  optimization: {
    minimize: mode === "production",
  },
  plugins: [
    new RequireFrom({
      variableName: "__bundle_url__",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    alias: ["@mui", "react", "react-dom", "react-router-dom", "react-data-grid"].reduce(
      (p, name) => {
        p[name] = path.resolve(PWD, "node_modules", name);
        return p;
      },
      {}
    ),
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/, /third_party/, /server/],
        use: {
          loader: "ts-loader",
        },
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.(s?)css$/,
        use: ["style-loader", "css-loader"],
        //use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
};

if (mode === "development") {
  logger.log("Looks like we are in development mode");

  config.devServer = devServer("https://lucasbardella.com", {
    ssr: false,
    docker: true,
    ssrPlugins: [statusCode],
    static: {
      publicPath: STATIC_PATH,
      directory: DIRECTORY,
    },
    hot: true,
    port: 9085,
  });

  if (hasFlag("--watch") || hasFlag("-w")) {
    const bundleAnaliser = new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerPort: 8833,
    });
    config.plugins.push(bundleAnaliser);
  }
}

module.exports = config;
