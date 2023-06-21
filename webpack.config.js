const path = require('path');

const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV !== 'production'

module.exports = {
    mode: 'production',
    entry: './src/index.js', 
    output: {
        filename: 'autoql-min.js',
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    plugins: [new MiniCssExtractPlugin({ filename: 'autoql.min.css' }), new RemoveEmptyScriptsPlugin()],
    module: {
        rules: [
            {   // This must go first, so the css file is generated before removing the imports
                test: /\.(c|sc)ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(jpg|png)$/,
                use: {
                  loader: 'url-loader',
                },
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/, /test_page/, /test/],
                loader: 'babel-loader',
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
        minimize: isProduction,
    },
};
