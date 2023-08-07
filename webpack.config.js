const Webpack = require("webpack");
const Glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");

const configurator = {
  entries: function(){
    var entries = {
      app: [
        './assets/css/app.scss',
      ],
      appDark: [
        './assets/css/themes/dark/app-dark.scss',
      ],
    }

    Glob.sync("./assets/*/*/*.*").forEach((entry) => {
      if (entry === './assets/css/app.scss') {
        return
      }
      if (entry === './assets/css/themes/dark/app-dark.scss') {
        return
      }

      let key = entry.replace(/(\.\/assets\/(src|js|css|go)\/)|\.(ts|js|s[ac]ss|go)/g, '')
      if(key.includes("_") || (/(ts|js|s[ac]ss|go)$/i).test(entry) == false) {
        return
      }

      if( entries[key] == null) {
        entries[key] = [entry]
        return
      }

      entries[key].push(entry)
    })
    return entries
  },

  plugins() {
    var plugins = [
      new Webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery",
        jquery: "jquery",
        FormSerializer: "form-serializer",
        Popper: ['popper.js', 'default'],
        Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
        bootstrap:"bootstrap",
        Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
        Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
        Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
      }),
      new MiniCssExtractPlugin({filename: "[name].[contenthash].css"}),
      new CopyWebpackPlugin({
        patterns: [{
          from: "./assets",
          globOptions: {
            ignore: [
              "**/assets/css/**",
              "**/assets/js/**",
              "**/assets/src/**",
            ]
          },
        },
        {from: 'node_modules/bootstrap-icons',to: 'static/images'},
        {from:'node_modules/@fortawesome/fontawesome-free',to:'extensions/@fortawesome/fontawesome-free'},
        {from:'node_modules/rater-js',to:'extensions/rater-js'},
        {from:'node_modules/bootstrap-icons',to:'extensions/bootstrap-icons'},
        {from:'node_modules/bootstrap',to:'extensions/bootstrap'},
        {from:'node_modules/apexcharts',to:'extensions/apexcharts'},
        {from:'node_modules/perfect-scrollbar',to:'extensions/perfect-scrollbar'},
        {from:'node_modules/flatpickr',to:'extensions/flatpickr'},
        {from:'node_modules/filepond',to:'extensions/filepond'},
        {from:'node_modules/feather-icons',to:'extensions/feather-icons'},
        {from:'node_modules/dragula',to:'extensions/dragula'},
        {from:'node_modules/dayjs',to:'extensions/dayjs'},
        {from:'node_modules/parsleyjs',to:'extensions/parsleyjs'},
        {from:'node_modules/sweetalert2',to:'extensions/sweetalert2'},
        {from:'node_modules/summernote',to:'extensions/summernote'},
        {from:'node_modules/jquery',to:'extensions/jquery'},
        {from:'node_modules/quill',to:'extensions/quill'},
        {from:'node_modules/tinymce',to:'extensions/tinymce'},
        {from:'node_modules/toastify-js',to:'extensions/toastify-js'},
        {from:'node_modules/datatables.net',to:'extensions/datatables.net'},
        {from:'node_modules/datatables.net-bs5',to:'extensions/datatables.net-bs5'},
        {from:'node_modules/simple-datatables',to:'extensions/simple-datatables'},
        {from:'node_modules/jsvectormap',to:'extensions/jsvectormap'},
        {from: 'node_modules/jquery-ujs',to: 'extensions/jquery-ujs'},
      ],
      }),
      new Webpack.LoaderOptionsPlugin({minimize: true,debug: false}),
      new WebpackManifestPlugin({fileName: "manifest.json",publicPath: ""})
    ];

    return plugins
  },

  moduleOptions: function() {
    return {
      rules: [
        {
          test:/\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: {sourceMap: true}},
            { loader: "postcss-loader", options: {sourceMap: true}},
            { loader: "sass-loader", options: {sourceMap: true}}
          ]
        },
        { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/},
        { test: /\.jsx?$/,loader: "babel-loader",exclude: /node_modules/ },
        { test: /\.(woff|woff2|ttf|svg)(\?v=\d+\.\d+\.\d+)?$/,use: "url-loader"},
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,use: "file-loader" },
        { test: /\.go$/, use: "gopherjs-loader"},
        {
          test: /\.(ico|png|jpg|jpeg|gif|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: [
            {
              options: {
                name: "[name].[ext]",
                outputPath: "images/",

              },
              loader: "file-loader"
            }
          ]
        }
      ]
    }
  },

  buildConfig: function(){
    // NOTE: If you are having issues with this not being set "properly", make
    // sure your GO_ENV is set properly as `buffalo build` overrides NODE_ENV
    // with whatever GO_ENV is set to or "development".
    const env = process.env.NODE_ENV || "development";

    var config = {
      mode: env,
      entry: configurator.entries(),
      output: {
        filename: "[name].[contenthash].js",
        path: `${__dirname}/public/assets`,
        clean: true,
      },
      plugins: configurator.plugins(),
      module: configurator.moduleOptions(),
      resolve: {
        extensions: ['.ts', '.js', '.json']
      }
    }

    if( env === "development" ){
      config.plugins.push(new LiveReloadPlugin({appendScriptTag: true}))
      return config
    }

    const terser = new TerserPlugin({
      terserOptions: {
        compress: {},
        mangle: {
          keep_fnames: true
        },
        output: {
          comments: false,
        },
      },
      extractComments: false,
    })

    config.optimization = {
      minimizer: [terser]
    }

    return config
  }
}

module.exports = configurator.buildConfig()
