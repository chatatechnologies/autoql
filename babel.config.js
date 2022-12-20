console.log(process.env.NODE_ENV);

const plugins = []

if(process.env.NODE_ENV){
    plugins.push(
        ['babel-plugin-transform-remove-imports', {"test": "\\.(less|css)$"}]
    )
}

module.exports = {
    presets: [
        '@babel/preset-env',
    ],
    plugins: plugins
};
