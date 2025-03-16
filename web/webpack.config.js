const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json'], // 自動解析的擴展名 Auto-resolved extensions
    alias: {
      '@': path.resolve(__dirname, 'src'), // 設置@指向src目錄 Set @ to point to src directory
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