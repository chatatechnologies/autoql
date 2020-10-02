const path = require('path')
var fs = require('fs')

var nodeModules = {};
fs.readdirSync('node_modules')
.filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
})
.forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});


module.exports = {
    entry: path.join(__dirname, '/src/index.js'),
    output: {
        filename: 'autoql-min.js',
        path: path.join(__dirname, "/build/"),
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
    optimization: {
        minimize: true
    },
    externals: nodeModules,
}
