'use strict';
const path = require('path');
const glob = require('glob')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const PATHS = {
    src: path.join(__dirname, 'src')
  }  

module.exports = merge(common, {
    mode: "production",
    plugins: [
        new HtmlWebpackPlugin({
            template: '../../src/server/views/index.pug',
            filename: 'index.pug',
            minify: false
        }),
        new HtmlWebpackPugPlugin(),
        new MiniCssExtractPlugin(),
        new CleanWebpackPlugin(),
        new CssMinimizerPlugin(),
        new PurgeCSSPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
            only: ['bundle', 'vendor']
        })
    ],
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader",
                    // "sass-loader",
                ],
            }
        ]
    }
});
