const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js', 
    output: {
        filename: 'autoql-min.js',
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    plugins: [new MiniCssExtractPlugin({ filename: 'autoql.min.css' })],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /test_page/, /test/],
                loader: 'babel-loader',
            },
            {
                test: /\.(c|sc)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(jpg|png)$/,
                use: {
                  loader: 'url-loader',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css', '.scss'],
    },
    externals: {
        // Exclude all modules from node_modules
        '/.*/': 'umd $0',
    },
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
    },
};
