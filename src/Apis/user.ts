import request from '@/Request';

const post = <T = any>(url: string, params?: any) => {
  return request.post<T>(url, params);
};

const get = <T = any>(url: string, params?: any) => {
  return request.get<T>(url, { params });
};

export const apiRegister = (params: any) => post('/rest/api/register', params);

export const apiLogin = (params: any) => post('/rest/api/login', params);

export const apiLogout = () => get('/rest/api/logout');
