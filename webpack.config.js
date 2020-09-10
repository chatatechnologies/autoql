const path = require('path')

module.exports = {
    entry: './src_node/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    }
}
