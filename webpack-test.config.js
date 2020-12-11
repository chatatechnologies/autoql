const path = require('path')

module.exports = {
    entry: './test_node.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'test'),
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
    }
}
