import path from 'path';
import { IConfig } from 'curiosity-bundler';

export default (env): IConfig => {
  const publicPath = '/';

  return {
    entry: {
      index: path.join(__dirname, 'src/main.js'),
    },
    html: {
      index: {
        title: '小程序浏览器调试',
        template: path.join(__dirname, 'host.html'),
      },
    },
    outputPath: path.join(__dirname, 'dist'),
    publicPath,
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    urlLoaderIncludes: [
      /\.svg$/,
    ],
    webpack(config) {
      config.stats = 'normal';
    },
    devServer: {
      port: 8080,
      static: [
        path.join(__dirname, 'public'),
        path.join(__dirname, 'static'),
      ],
    },
    analyzer: false,
    define: {

    },
    disableCompress: false,
  };
};
