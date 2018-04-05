const html = require('html-webpack-plugin');
const clean = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/index.jsx'
    },
    output: {
        filename: '[name].bundle.js',
        path: __dirname + '/dist/'
    },
    mode: "development",
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: / node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['react']
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new html({
            template: './src/index.html'
        }),
        new clean(["./dist"])
    ],
    devServer: {
        contentBase: './dist'
    },
    resolve: {
        extensions: ['.jsx', '.js']
    }
}