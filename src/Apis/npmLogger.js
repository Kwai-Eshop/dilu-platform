import request from '@/Request';

const post = (url, params) => {
  return request.post(url, params);
};

// const get = (url, params) => {
//   return request.get(url, { params });
// };

/**
 * 获取productName下所有工程及npm包信息
 */
export const api_getNpmInfo = (params) => post('/parse/functions/getNpmInfo', params);

/**
 * 获取productName和对应工程下的包信息
 */
export const api_getNpmInfoList = (params) => post('/parse/functions/getNpmInfoList', params);
