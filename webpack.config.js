const { resolve } = require('node:path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      plugins: [
        ...(options.resolve.plugins ?? []),
        new TsconfigPathsPlugin({
          configFile: resolve(__dirname, 'tsconfig.json'),
        }),
      ],
    },
  };
};
