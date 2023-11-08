import { message } from 'antd';
import axios from 'axios';

const instance = axios.create({
  timeout: 30000,
});

// 设置post请求头
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * HTTP状态码-成功
 *
 * @const
 * @type {number}
 */
const HTTP_STATUS_CODE_OK = 200;

/**
 * 业务请求成功码
 *
 * @const
 * @type {number}
 */
const SUCCESS_RESULT = 0;

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { status, data } = response;
    if (status === HTTP_STATUS_CODE_OK && data?.code === 109) {
      // 跳转到登陆页面
      window.location.href = data.data;
    }
    // 兼容原先parseServer返回值
    if (
      status === HTTP_STATUS_CODE_OK &&
      (data?.result?.result === SUCCESS_RESULT || data?.code === SUCCESS_RESULT)
    ) {
      return Promise.resolve(data);
    } else {
      return Promise.reject(data);
    }
  },
  (error) => {
    // 相应错误处理
    // 比如： token 过期， 无权限访问， 路径不存在， 服务器问题等
    switch (error?.response?.status) {
      case 401:
        break;
      case 403:
        break;
      case 404:
        break;
      case 500:
        break;
      default:
        console.log('其他错误信息');
    }
    return Promise.reject({
      ...error,
      code: error?.response?.status,
      message: error.response?.data?.msg,
    });
  },
);

export default instance;
