const { resolve: pathResolve } = require('path')
const GasPlugin = require('gas-webpack-plugin')
const webpack = require('webpack')

const path = a => pathResolve(__dirname, a)
module.exports = {
    mode: 'production',
    context: path('.'),
    entry: path('src/index.ts'),
    output: {
        filename: 'code.js',
        path: path('dist'),
        clean: true
    },
    optimization: {
        //minimize: false,
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules|index\.ts/,
                loader: 'babel-loader'
            },
            {
                test: /index\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new GasPlugin({
            autoGlobalExportsFiles: [ 'src/index.ts' ]
        })
    ]
}
