const path = require('path')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'cdn'),
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            {test: /\.css$/i, use: ['style-loader', 'css-loader']}
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
}
