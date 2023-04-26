// @ts-check

module.exports = /** @type { import('webpack').Configuration } */ ({
  devtool: 'source-map',
  module: {
    rules: [
      // Load Blockly source maps.
      {
        test: /(blockly\/.*\.js)$/,
        use: [require.resolve('source-map-loader')],
        enforce: 'pre',
      }
    ].filter(Boolean),
  },
  // https://github.com/google/blockly-samples/blob/9974e85becaa8ad17e35b588b95391c85865dafd/plugins/dev-scripts/config/webpack.config.js#L118-L120
  ignoreWarnings: [/Failed to parse source map/]
});
