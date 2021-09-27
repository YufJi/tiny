module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-env', {
        targets: {
          browsers: ['last 2 versions'],
        },
        loose: true,
      }],
      '@babel/preset-react',
    ],
    plugins: [
      // 下面两个的顺序的配置都不能动
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],

      ['@babel/plugin-transform-runtime'],
    ],
  };
};
