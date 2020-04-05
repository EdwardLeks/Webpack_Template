// Basic vars
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
// Additional plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const PATHS = {
	src: path.join(__dirname, './src')
}

const PAGES_DIR = `${PATHS.src}/pug/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

//Optimization
const optimization = () => {
	const config = {}
	if(isProd){
		config.minimizer = [
			new UglifyJSPlugin(),
			new ImageminPlugin({
				test: /\.(png|jpe?g|gif)$/i
			}),
			new webpack.LoaderOptionsPlugin({
				minimize: true
			})
		]
	}
	return config
}

const cssLoaders = extra => {
	const loaders = [{
		loader: MiniCssExtractPlugin.loader
	}, 
	'css-loader',
	'postcss-loader'
	]	

	if(extra){
		loaders.push(extra)
	}

	return loaders
}

//Plugins function
const plugins = () => {
	const base = [
		new webpack.ProvidePlugin({
			Popper: ['popper.js', 'default']
		}),
		...PAGES.map(page => new HtmlWebpackPlugin({
			template: `${PAGES_DIR}/${page}`,
			filename: `./${page.replace(/\.pug/,'.html')}`,
			minify: {
				collapseWhitespace: isProd
			}
		})),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, 'src/img'),
				to: path.resolve(__dirname, './dist/img'),
				ignore: [
					{
						glob: 'svg/#'
					}
				]
			}
		]),
		new MiniCssExtractPlugin({
			filename: '[name].css',
		})
	]

	return base 
}

// Module settings
module.exports = {
	// Project path
	context: path.resolve(__dirname, 'src'),
	// JS path
	entry:{
		// Main file
		index: [
			'./js/index.js'
		],
	},
	//Output path
	output:{
		filename: 'js/[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	optimization: optimization(),
	devServer:{
		port: 4200,
		hot: isDev
	},
	devtool: isDev ? 'source-map' : '',
	//Plugins
	plugins: plugins(),
	//Test files
	module:{
		rules: [
			{
				test: /\.pug$/,
				loader: 'pug-loader'
			},
			{
				test: /\.css$/,
				use: cssLoaders()
			},
			{
				test: /\.s[ac]ss$/,
				use: cssLoaders('sass-loader')
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				loaders: [
					{
						loader: 'file-loader',
						options: {
							name: '[path][name].[ext]'
						}
					},
					'img-loader',
				]
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[path][name].[ext]'
						}
					}
				]
			},
			{
				test: /\.svg$/,
				loader: 'svg-url-loader'
			}
		]
	}
}