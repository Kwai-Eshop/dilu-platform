const { 
  override, 
  fixBabelImports,
  addWebpackAlias, 
  addWebpackResolve,
  overrideDevServer,
} = require('customize-cra')
const path = require('path')

const lessLoaderOverride = function override(config, env) {
  config.module.rules[1].oneOf.splice(2, 0, {
    test: /\.less$/i,
    use: [
      { loader: "style-loader" },
      { loader: "css-loader" },
      {
        loader: "less-loader",
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    ],
  })
  return config
}

const overrideFunc = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  }),
  addWebpackAlias({
    ['@']: path.resolve(__dirname, 'src')
  }),
  addWebpackResolve({
    extensions: ['.js', '.jsx', '.json', '.tsx', '.ts']
  }),
  lessLoaderOverride,
);

module.exports = {
  webpack: overrideFunc,
  devServer: overrideDevServer(config => {
    return {
      ...config,
      proxy: {
        "/rest": {
          target: "http://127.0.0.1:8001", // 接口的域名
          secure: true, // 是否验证SSL证书，如果是https接口，需要配置这个参数
          changeOrigin: true // 将主机标头的原点更改为目标URL，如果接口跨域，需要进行这个参数配置
        },
      }
    }
  })
};