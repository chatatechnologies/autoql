const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    plugins: [
        new MiniCssExtractPlugin({ filename: 'autoql.min.css' }),
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
