const path = require("path")

module.exports = {
    entry: "./pong/pong.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "pong.js",
        path: path.resolve(__dirname, "../docs"),
    },
    devServer: {
        compress: true,
        contentBase: path.join(__dirname, "../docs"),
        hot: false,
        liveReload: false,
        open: true,
        port: 3000,
        stats: {
            assets: false,
            modules: false,
        },
    },
}
