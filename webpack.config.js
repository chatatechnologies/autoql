const path = require('path')

module.exports = {
    entry: './src_node/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            {test: /\.css$/i, use: ['style-loader', 'css-loader']}
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    }
}
