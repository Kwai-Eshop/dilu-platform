import type {
  ICheckLoginResponse,
  IGetCorrelationMainAppListParams,
  IGetCorrelationMainAppListResponse,
  IGetServiceTreeResponse,
  IQueryStaffInfoByStrResponse,
  IGetBizListResponse,
  IGetMainAppListParams,
  IGetMainAppListResponse,
  ICreateMainAppParams,
  ICreateMainAppResponse,
  IUpdateMainAppParams,
  IGetConnectSubAppListParams,
  IGetConnectSubAppListResponse,
  IDeleteConnectSubAppParams,
  IGetMainAppInfoResponse,
  IGetSubAppListParams,
  IGetSubAppListResponse,
  ICreateSubAppParams,
  IGetCorrelationSubAppListParams,
  IGetCorrelationSubAppListResponse,
  IUpdateSubAppParams,
  ICreateConnectSubAppParams,
  IUpdateConnectSubAppParams,
  IGetSubAppVersionsParams,
  IGetSubAppVersionsResponse,
  IGetLogListParams,
  IGetLogListResponse,
  IGetServiceTacticsParams,
  IGetServiceTacticsResponse,
  IGetConnectInfoParams,
  IGetConnectInfoResponse,
  IUpdateVersionLaneParams,
  IUpdateVersionLaneResponse,
  ISetVersionStatusParams,
  ISetVersionStatusResponse,
  ICreatePublishParams,
  ICreatePublishResponse,
  ICancelApprovalParams,
  ICancelApprovalResponse,
  IRollBackConnectVersionParams,
  IRollBackConnectVersionResponse,
} from '@/Common/interface';
import { IEmptyParams, IUnifyApiResponse } from '@/Common/interface';
import request from '@/Request';

const post = <T = any>(url: string, params?: any) => {
  return request.post<T>(url, params);
};

const get = <T = any>(url: string, params?: any) => {
  return request.get<T>(url, { params });
};

/**
 * 获取操作日志列表
 */
export const api_getLogList = (params: IGetLogListParams) =>
  get<IGetLogListResponse>('/rest/api/getLogs', params);

/**
 *
 * 创建子应用
 */
export const api_createSubApp = (params: ICreateSubAppParams) =>
  post('/rest/api/createSubApp', params);

/**
 *
 * 查询子应用列表
 */
export const api_getSubAppList = (params: IGetSubAppListParams) =>
  get<IGetSubAppListResponse>('/rest/api/getSubAppList', params);

/**
 *
 * 修改子应用
 */
export const api_updateSubApp = (params: IUpdateSubAppParams) =>
  post('/rest/api/updateSubApp', params);

/**
 *
 * 创建主应用
 */
export const api_createMainApp = (params: ICreateMainAppParams) =>
  post<ICreateMainAppResponse>('/rest/api/createMainApp', params);

/**
 *
 * 查询主应用列表
 */
export const api_getMainAppList = (params: IGetMainAppListParams) =>
  get<IGetMainAppListResponse>('/rest/api/getMainAppList', params);

/**
 *
 * 修改主应用
 */
export const api_updateMainApp = (params: IUpdateMainAppParams) =>
  post('/rest/api/updateMainApp', params);

/**
 *
 * 获取人员列表
 */
export const api_queryStaffInfoByStr = (params: { nameStr: string }) =>
  get<IQueryStaffInfoByStrResponse>('/rest/api/queryStaffInfoByStr', params);

/**
 * 获取主应用环境列表
 */
export const api_getMainAppEnv = () => get('/rest/api/getEnvList');

/**
 * 关联子应用
 */
export const api_createConnectSubApp = (params: ICreateConnectSubAppParams) =>
  post('/rest/api/createConnectSubApp', params);

/**
 * 获取关联子应用列表
 */
export const api_getConnectSubAppList = (params: IGetConnectSubAppListParams) =>
  get<IGetConnectSubAppListResponse>('/rest/api/getConnectSubAppList', params);

/**
 * 获取关联子应用列表
 */
export const api_updateConnectSubApp = (params: IUpdateConnectSubAppParams) =>
  post('/rest/api/updateConnectSubApp', params);

/**
 * 获取关联信息
 */
export const api_getConnectInfo = (params: IGetConnectInfoParams) =>
  get<IGetConnectInfoResponse>('/rest/api/getConnectInfo', params);

/**
 * 设置当前生效版本
 */
export const api_setVersionStatus = (params: ISetVersionStatusParams) =>
  post<ISetVersionStatusResponse>('/rest/api/setVersionStatus', params);

/**
 * 撤回审批单
 */
export const api_cancelApproval = (params: ICancelApprovalParams) =>
  post<ICancelApprovalResponse>('/rest/api/cancelApproval', params);

/**
 * 创建发布单
 */
export const api_createPublish = (params: ICreatePublishParams) =>
  post<ICreatePublishResponse>('/rest/api/createPublish', params);

/**
 * 设置当前生效版本
 */
export const api_getMainAppInfo = (params: { mainId: string }) =>
  get<IGetMainAppInfoResponse>('/rest/api/getMainAppInfo', params);

/**
 * 更新泳道
 */
export const api_updateVersionLane = (params: IUpdateVersionLaneParams) =>
  post<IUpdateVersionLaneResponse>('/rest/api/updateVersionLane', params);

/**
 * 校验是否登录
 */
export const api_checkLogin = () => get<ICheckLoginResponse>('/rest/api/getUserInfo');

/**
 * 流程审批通过后二次确认
 */
export const api_setApprovedState = (params: any) => post('/rest/api/setApprovedState', params);

/**
 * 删除子应用
 */
export const api_deleteSubApp = (params: { id: string }) => post('/rest/api/deleteSubApp', params);

/**
 * 通过env获取子应用历史版本
 */
export const api_getSubAppVersions = (params: IGetSubAppVersionsParams) =>
  get<IGetSubAppVersionsResponse>('/rest/api/getSubAppVersions', params);

/**
 * 子应用与主应用某环境之间解除关联
 */
export const api_deleteConnectSubApp = (params: IDeleteConnectSubAppParams) =>
  post('/rest/api/deleteConnectSubApp', params);

/**
 * 获取研发云服务树目录
 */
export const api_getServiceTree = () => get<IGetServiceTreeResponse>('/rest/api/getServiceTree');

// /**
//  * 主应用与研发云服务节点建联
//  */
// export const api_setConnectService = (params: any) =>
//   post('/parse/functions/setConnectService', params);

// /**
//  * 解除主应用和研发云关联关系
//  */
// export const api_deleteConnectService = (params: any) =>
//   post('/parse/functions/deleteConnectService', params);

/*
 * 查询主应用管理员
 */
export const api_getMainAppUsers = (params: any) => get('/rest/api/getMainAppUsers', params);

/**
 * 查询主应用审批策略
 */
export const api_getServiceTactics = (params: IGetServiceTacticsParams) =>
  get<IGetServiceTacticsResponse>('/rest/api/getServiceTactics', params);

/**
 * 查询用户的主应用权限
 */
export const api_getMainAppPermission = (params: { id: string }) =>
  get('/rest/api/getMainAppPermission', params);

// /**
//  * 操作用户权限分组
//  * @param {*} params
//  *     id: 主应用id,
//  *     userid: 用户id,
//  *     type: 新增add 删除 remove,
//  *     roleType: 操作管理员admin 操作成员member
//  */
export const api_updatePersionGroup = (params: any) => post('/rest/api/updatePersionGroup', params);

// /**
//  * 操作用户权限分组
//  * @param {*} params
//  * id: 主应用id
//  * users = Array<{
//  *  email: 邮箱
//       name: 中文名
//       photo: 头像
//       username: 邮箱前缀
//  * }>
//  *
//  * roleType: admin 或者 member
//  */
export const api_addUserGroup = (params: any) => post('/rest/api/addUserGroup', params);

/**
 * 获取业务线列表
 * @param {*} params
 * @returns
 */
export const api_getBizList = () => get<IGetBizListResponse>('/rest/api/getBizList');

/**
 * 获取与我相关主应用列表
 * @param {*} params
 * @returns
 */
export const api_getCorrelationMainAppList = (params: IGetCorrelationMainAppListParams) =>
  get<IGetCorrelationMainAppListResponse>('/rest/api/getCorrelationMainAppList', params);

/**
 * 获取与我相关子应用列表
 * @param {*} params
 * @returns
 */
export const api_getCorrelationSubAppList = (params: IGetCorrelationSubAppListParams) =>
  get<IGetCorrelationSubAppListResponse>('/rest/api/getCorrelationSubAppList', params);

/**
 * 获取子应用在赤兔平台上注册信息
 */
export const api_getChituAppDetail = (params: any) =>
  get('/parse/functions/getChituAppDetail', params);

/**
 * 将当前版本回滚到上一个生效版本
 */
export const api_rollBackConnectVersion = (params: IRollBackConnectVersionParams) =>
  post<IRollBackConnectVersionResponse>('/rest/api/rollBackConnectVersion', params);
