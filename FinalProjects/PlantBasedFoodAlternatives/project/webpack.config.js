var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/public/',
        filename: 'index.bundle.js'
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            }]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'D3 Orthographic',
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeScriptTypeAttributes: true,
          removeAttributeQuotes: true,
          useShortDoctype: true,
          minifyCSS: true
        },
        template: './src/index.html'
      }),
      new ExtractTextPlugin({ filename: "style.css"}),
    ],
    stats: {
        colors: true
    },
    devtool: 'source-map',
};
