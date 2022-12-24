const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DisableOutputWebpackPlugin = require('disable-output-webpack-plugin');

module.exports = {
    plugins: [
        new MiniCssExtractPlugin({ filename: 'autoql.min.css' }),
        new DisableOutputWebpackPlugin({ }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
};
