const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

module.exports = () => {
    const env = dotenv.config({ path: path.resolve(process.cwd(), '.env.production') }).parsed;

    // reduce it to a nice object, the same as before
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});
    return {
        module: {
            rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }, {test: /\.html$/, use: [{loader: "html-loader"}]}, {
                test: /\.less$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "less-loader",
                    options: {
                        javascriptEnabled: true
                    }
                }]// compiles Less to CSS
            }, {
                test: /\.(s[a|c]ss|css)$/,
                use: [{loader: "style-loader"}, {loader: "css-loader"}, {loader: "sass-loader"}]
            },
                {test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: {limit: 8192}},
                {
                    test: /\.(svg|woff|woff2|ttf|eot|otf)([\?]?.*)$/,
                    use: {loader: 'file-loader?name=assets/fonts/[name].[ext]'},
                }]
        },
        output: {
            filename: '[name].[contenthash].bundle.js',
            path: path.resolve(__dirname, 'build'),
            publicPath: "/"
        },
        entry: ['babel-polyfill', './src/index'],
        plugins: [
            new webpack.DefinePlugin({'process.env':{...envKeys}}),
            new CleanWebpackPlugin(),
            new HtmlWebPackPlugin({
                template: "./public/index.html",
                filename: "./index.html",
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'public', to: '',
                        globOptions: {
                            ignore: ['**/*.html'],
                        }
                    },
                ],
            }),
            new CompressionPlugin()
        ]
    }
}
