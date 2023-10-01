'use strict';
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

const outputDirectory = 'dist'

module.exports = {
    context: path.resolve(__dirname, 'src', 'client'),
    entry: {
        app: [
            './index.js'  // the entry point of app
        ]
    },
    output: {
        path: path.resolve(__dirname, 'public', outputDirectory), //  destination
        filename: 'bundle.js',
        publicPath: '/dist/',
        sourceMapFilename: 'bundle.map.js'
    },
    plugins: [
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
                test: /\.(js|jsx)$/, //check for all js files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        // This is a feature of `babel-loader` for webpack (not Babel itself).
                        // It enables caching results in ./node_modules/.cache/babel-loader/
                        // directory for faster rebuilds.
                        cacheDirectory: false,
                        plugins: ["@babel/plugin-proposal-class-properties"]
                    },
                }
            }
            // {
            //   test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            //   loader: 'url-loader',
            //   options: {
            //     limit: 10000
            //   }
            // }
        ]
    }
};