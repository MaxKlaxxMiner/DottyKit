const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const cssnano = require('cssnano');

const buildVersionFile = path.resolve(__dirname, 'build-version.txt');

// Liest die Build-Version aus der Datei oder liefert einen Fallback.
const readBuildVersion = () => {
    try {
        const raw = fs.readFileSync(buildVersionFile, 'utf8').trim();
        return raw || '0';
    } catch (error) {
        if (error.code === 'ENOENT') {
            return '0';
        }
        throw error;
    }
};

/** @type {import('webpack').ConfigurationFactory} */
module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';

    const cssLoaders = [
        'style-loader',
        {
            loader: 'css-loader',
            options: {sourceMap: !isProd},
        },
    ];

    if (isProd) {
        cssLoaders.push({
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [cssnano({preset: 'default'})],
                },
            },
        });
    }

    return {
        entry: './src/index.ts',
        output: {
            filename: isProd ? 'assets/[name].[contenthash].js' : 'assets/[name].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: cssLoaders,
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[hash][ext][query]',
                    },
                },
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    use: ['source-map-loader'],
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'public/index.html',
                buildVersion: readBuildVersion(),
                minify: isProd && {collapseWhitespace: true, removeComments: true},
            }),
        ],
        devtool: isProd ? false : 'eval-cheap-module-source-map',
        devServer: {
            static: {directory: path.resolve(__dirname, 'public')},
            hot: true,
            open: true,
            host: '0.0.0.0',
            port: 5173,
            allowedHosts: 'all',
            liveReload: true,
            watchFiles: {
                paths: ['src/**/*', 'public/**/*'],
                options: {usePolling: false},
            },
            client: {overlay: {warnings: false, errors: true}},
            historyApiFallback: true,
        },
        performance: {hints: false},
    };
};
