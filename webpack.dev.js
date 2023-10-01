'use strict';
const path = require('path');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
// const NodemonPlugin = require('nodemon-webpack-plugin');

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        // new webpack.HotModuleReplacementPlugin(), // enable HMR globally
        // new webpack.NoEmitOnErrorsPlugin(),  // do not emit compiled assets that include errors
        // new Dotenv()
        new CleanWebpackPlugin(),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
        }),
        new HtmlWebpackPlugin({
            template: '../../src/server/views/index.pug',
            filename: 'index.pug',
            minify: false
        }),
        new HtmlWebpackPugPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    // "sass-loader",
                ],
            }
            // {
            //   test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            //   loader: 'url-loader',
            //   options: {
            //     limit: 10000
            //   }
            // }
        ]
    },
    // devServer: {
    //   port: 8080,
    //   open: true,
    //   proxy: {
    //     "/api": "http://localhost:3000"
    //   }
    // },
    
});