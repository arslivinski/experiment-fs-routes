'use strict';

const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = function webpackConfigFactory(env) {
  const isProduction = env.production === true;
  const isDevelopment = env.development === true;
  const isProfile = env.profile === true;

  // Enable profiling on the production bundle
  const isProductionProfile = isProduction && isProfile;

  return {
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,

    entry: path.resolve(__dirname, 'sources', 'main.js'),
    output: {
      clean: true,
      pathinfo: true,
      path: path.resolve(__dirname, 'build'),
      filename: `static/js/[name]${isProduction ? '.[contenthash]' : ''}.js`,
      chunkFilename: `static/js/[name]${isProduction ? '.[contenthash]' : ''}.chunk.js`,
      assetModuleFilename: `static/media/[name]${isProduction ? '.[contenthash]' : ''}[ext]`,
    },

    resolve: {
      alias: {
        ...isProductionProfile
          ? {
              'react-dom$': 'react-dom/profiling',
              'scheduler/tracing': 'scheduler/tracing-profiling',
            }
          : {},
      },
    },

    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          oneOf: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: false,
                  cacheCompression: false,
                  compact: isProduction,
                },
              },
            },
            {
              test: /\.css$/,
              use: [
                isDevelopment
                  ? require.resolve('style-loader')
                  : {
                      loader: MiniCssExtractPlugin.loader,
                      options: { publicPath: '../../' },
                    },
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1,
                    sourceMap: true,
                  },
                },
              ],
              sideEffects: true,
            },
            {
              // JavaScript and CSS loaders are declared above.
              // HTML and JSON will be loaded with WebPack internal loaders.
              // Everything else will be loaded with assets loader.
              exclude: /(^|\.(js|css|html|json))$/,
              type: 'asset/resource',
            },
          ],
        },
      ],
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'public'),
            to: path.resolve(__dirname, 'build'),
            noErrorOnMissing: true,
            filter(resourcePath) {
              if (resourcePath.endsWith('public/index.html')) {
                return false;
              }
              return true;
            },
          },
        ],
      }),
      new HtmlPlugin({
        inject: true,
        template: path.resolve(__dirname, 'public', 'index.html'),
        publicPath: '/',
        ...isProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : {},
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      isDevelopment ? new CaseSensitivePathsPlugin() : false,
      isProduction
        ? new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash].css',
          chunkFilename: 'static/css/[name].[contenthash].chunk.css',
        })
        : false,
    ].filter(Boolean),

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            // eslint-disable-next-line camelcase
            keep_classnames: isProductionProfile,
            // eslint-disable-next-line camelcase
            keep_fnames: isProductionProfile,
          },
        }),
        new CssMinimizerPlugin(),
      ],
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    devtool: isDevelopment || isProductionProfile ? 'source-map' : false,

    devServer: {
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || '8080',
      allowedHosts: 'all',
      client: {
        logging: 'none',
      },
      historyApiFallback: true,
      static: {
        directory: path.resolve(__dirname, 'public'),
      },
      headers: {
        'Cache-Control': 'no-store',
      },
    },

    watchOptions: {
      ignored: /(build|coverage|node_modules)/,
    },
  };
};
