const plugins = []

// if(process.env.NODE_ENV === 'production'){
//     plugins.push(
//         ['babel-plugin-transform-remove-imports', {"test": "\\.(less|css|scss)$"}]
//     )
// }

module.exports = {
    presets: [
        '@babel/preset-env',
    ],
    plugins: plugins
};
