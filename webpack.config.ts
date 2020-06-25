const logger = require("console");
const hasFlag = require("has-flag");
const path = require("path");
const webpack = require("webpack");
const RequireFrom = require("webpack-require-from");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const { devServer } = require("@metablock/server");

const STATIC_PATH = "/static";

const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";
const PWD = process.cwd();
const resolvePath = (relativePath: string) => path.resolve(PWD, relativePath);

const config = {
  mode,
  devServer: devServer("https://new.lucasbardella.com", { hot: true }),
  entry: {
    luca: "./main/index.ts",
  },
  output: {
    publicPath: STATIC_PATH,
    path: resolvePath(STATIC_PATH),
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
      variableName: "__metablock_assets_url__",
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
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
      {
        test: /\.(s?)css$/,
        use: ["style-loader", "css-loader"],
        //use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-inline-loader",
            options: {
              removeSVGTagAttrs: false,
            },
          },
        ],
      },
    ],
  },
};

if (mode === "development") {
  logger.log("Looks like we are in development mode");

  if (hasFlag("--watch") || hasFlag("-w")) {
    const bundleAnaliser = new BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerPort: 8833,
    });
    config.plugins.push(bundleAnaliser);
  }

  const ignorePlugin = new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);
  config.plugins.push(ignorePlugin);
}

module.exports = config;
