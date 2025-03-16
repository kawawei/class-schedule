const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // 導入 webpack 模塊 Import webpack module

// webpack配置文件 Webpack configuration file
module.exports = {
  entry: './src/main.js', // 入口文件 Entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // 輸出目錄 Output directory
    filename: 'js/[name].[contenthash].js', // 輸出文件名 Output filename
    clean: true, // 每次構建前清理輸出目錄 Clean output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.vue$/, // 處理.vue文件 Process .vue files
        use: 'vue-loader',
      },
      {
        test: /\.js$/, // 處理.js文件 Process .js files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(scss|css)$/, // 處理scss和css文件 Process scss and css files
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              // 使用 Dart Sass 的新 API Use Dart Sass's new API
              sassOptions: {
                outputStyle: 'compressed',
              },
              // 啟用 Sass 模塊 Enable Sass modules
              implementation: require('sass'),
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i, // 處理圖片文件 Process image files
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]', // 輸出到images目錄 Output to images directory
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(), // Vue Loader插件 Vue Loader plugin
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML模板 HTML template
      favicon: './public/favicon.ico', // 網站圖標 Website favicon
    }),
    // 添加 DefinePlugin 設置 Vue 特性標誌 Add DefinePlugin to set Vue feature flags
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true, // 啟用 Options API Enable Options API
      __VUE_PROD_DEVTOOLS__: false, // 生產環境禁用開發工具 Disable devtools in production
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false // 禁用水合不匹配詳情 Disable hydration mismatch details
    }),
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json'], // 自動解析的擴展名 Auto-resolved extensions
    alias: {
      '@': path.resolve(__dirname, 'src'), // 設置@指向src目錄 Set @ to point to src directory
      'vue': '@vue/runtime-dom', // 使用運行時 DOM 版本 Use runtime DOM version
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // 靜態文件目錄 Static files directory
    },
    hot: true, // 熱更新 Hot module replacement
    port: 3003, // 開發服務器端口 Development server port (修改為3003 Changed to 3003)
    historyApiFallback: true, // 支持HTML5 History API Support HTML5 History API
  },
}; 