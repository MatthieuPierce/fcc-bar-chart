const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//mode default is development
let mode = 'development';
//target default is web
let target = "web";

//change mode & target conditionally by NODE_ENV
if (process.env.NODE_ENV === 'production') {
  mode = "production";
  target = "browserslist";
}

module.exports = {
  mode: mode,
  target: target,
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    //not necessary in webpack 5 if default 'dist', required for any other path
    path: path.resolve(__dirname, 'dist'),
    //path for asset resources, e.g. images
    assetModuleFilename: 'images/[hash][ext][query]',
  },
  module: {
    rules: [
      {
        //rules for javascript files
        test: /\.js$/,
        exclude: [
          /node_modules/,
          /fcc-bundle\.js/
        ],
        use: {
          //without additional settings, babel-loader will reference 
          // .babelrc ; babel.config.js is common alternative
          loader: 'babel-loader'
        }
      },
      {
        //rules for cass, sass, and scss files
        test: /\.(s[ac]|c)ss$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "" },
          },
          'css-loader',
          "postcss-loader",
          'sass-loader'
        ] 
      },
      {
        //rules for images, requires webpack 5, otherwise url-loader etc
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: "asset", 
        //type: "asset" parses resources under 8kb into js, rest into sep files;
        // can custom parsing rules with parser : {dataUrlCondition: maxSize: etc}
        //
        //type: "asset/resource" places all resources linked as sep files
        // into output / dist directory
        //type: "asset/inline" bundles all resources into js, costly upfront
        
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin( {
      template: "./src/index.html",
    }),
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
  }
}