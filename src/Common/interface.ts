export interface IEmptyParams {}

export interface ICheckLoginResponse {
  mail: string;
  displayname: string;
  avatar: string;
  name: string;
}

export type IPrincipal = {
  value: string;
  label: string;
  key: string;
};

export type IApprover = IPrincipal;

export interface IUnifyApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  requestId: string;
}

export interface IGetCorrelationMainAppListParams {
  pageNo?: number;
  pageSize?: number;
  bizId: number;
  mainName?: string;
  mainAppId?: string;
  mainDesc?: string;
  principal?: string;
}

export interface IMainAppInfo {
  id: string;
  name: string;
  principal: IPrincipal[];
  desc: string;
  biz: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface IApprovalInfo {
  id: string;
  approver: string;
  needControl: boolean;
  haloNodePath: string;
  haloNodeId: number;
  entityId: string;
  approveUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface IMainAppInfoReplenish {
  id: number;
  kconfKey: string;
  chituAppId: string;
  mainAppId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export type IGetCorrelationMainAppItem = IMainAppInfo & {
  approval: IApprovalInfo;
} & {
  replenish?: IMainAppInfoReplenish;
};

export interface IGetCorrelationMainAppListResponse {
  list: IGetCorrelationMainAppItem[];
  totalCount: number;
}

export interface IServiceTree {
  id: number;
  name: string;
  full_name: string;
  path: string;
  parent_id: number;
  level: number;
  type: string;
  children: any[];
}

export interface IGetServiceTreeResponse {
  nodes: IServiceTree[];
}

export type IQueryStaffInfoByStrResponse = {
  name: string;
  username: string;
  email: string;
  photo: string;
}[];

export type IGetBizListResponse = {
  id: number;
  title: string;
}[];

export interface IGetMainAppListParams {
  pageNo?: number;
  pageSize?: number;
  bizId: number;
  mainName?: string;
  mainDesc?: string;
  principal?: string;
  mainAppId?: string;
}

export type IGetMainAppListResponse = IGetCorrelationMainAppListResponse;

export interface IBizModel {
  label: string;
  value: number;
  key: number;
}

export interface ICreateMainAppParams {
  mainName: string;
  mainDesc: string;
  principal: IPrincipal[];
  approver: IApprover[];
  biz: IBizModel;
  needControl: boolean;
  nodeId: number;
  nodePath: string;
}

export interface ICreateMainAppResponse {
  id: string;
}

export interface IUpdateMainAppParams {
  name: string;
  desc: string;
  mainId: string;
  principal: IPrincipal[];
  approver: IApprover[];
  biz: IBizModel;
  needControl: boolean;
}

export interface IGetConnectSubAppListParams {
  pageNo: number;
  pageSize: number;
  mainAppId: string;
  subName: string;
  subDesc: string;
  env: string;
  rule: string; // 访问规则
  creator: string;
}

export interface IConnect {
  id: string;
  extras: string;
  container: string;
  appType: string;
  activeRule: string;
}

export type IConnectSubAppModel = IConnect & {
  subApp: ISubApp;
} & {
  mainApp: IMainAppInfo;
} & {
  env: IEnvInfo;
};

export interface IGetConnectSubAppListResponse {
  list: IConnectSubAppModel[];
  total: number;
  limit: number;
  page: number;
}

export interface IDeleteConnectSubAppParams {
  mainAppId: string;
  subAppId: string;
  envKey: string;
}

export interface IEnvInfo {
  key: string;
  name: string;
}

export type IGetMainAppEnvResponse = IEnvInfo[];

export interface IGetMainAppPermissionResponse {
  isAdmin: boolean;
  isMember: boolean;
  isRoot: boolean;
}

export type IGetMainAppInfoResponse = IMainAppInfo;

export interface IGetSubAppListParams {
  pageNo: number;
  pageSize: number;
  subAppId?: string;
  subAppName?: string;
  subAppDesc?: string;
  subAppCreator?: string;
}

export interface ISubApp {
  id: string;
  subName: string;
  principal: IPrincipal[];
  creator: string;
  subDesc: string;
}

export interface IGetSubAppListResponse {
  list: ISubApp[];
  total: number;
  limit: number;
  page: number;
}

export interface IGetCorrelationSubAppListParams {
  pageNo: number;
  pageSize: number;
  subAppId: string;
  subAppName: string;
  subAppDesc: string;
  subAppCreator: string;
}

export interface IGetCorrelationSubAppListResponse {
  list: ISubApp[];
  total: number;
  limit: number;
  page: number;
}

export interface ICreateSubAppParams {
  subName: string;
  subDesc: string;
  principal: {
    value: string;
    label: string;
    key: string;
  }[];
}

export interface IUpdateSubAppParams {
  subName: string;
  subDesc: string;
  subId: string;
  principal: IPrincipal[];
}

export interface ICreateConnectSubAppParams {
  mainAppId: string;
  subAppId: string;
  envKey: string;
  rule?: string;
  container?: string;
  extras?: any;
  type: 'route' | 'component';
}

export interface IUpdateConnectSubAppParams {
  mainId: string;
  subId: string;
  container: string;
  rule: string;
  extras: string;
  type: 'route' | 'component';
  envKey: string;
}

export enum EVersionStatus {
  UN_TAKE_EFFECT = 1, // 未生效
  APPROVING = 2, // 审核中
  APPROVED = 3, // 审核通过
  GRAY = 4, // 放量中
  TAKE_EFFECT = 5, // 已生效
  ROLL_BACK = 6, // 已回滚
}

export interface IGetSubAppVersionsParams {
  pageNo: number;
  pageSize: number;
  subAppId?: string;
  subAppName?: string;
  versionId?: string;
  laneId?: string;
  buildOwner?: string;
  commitId?: string;
  buildBranch?: string;
  status?: EVersionStatus;
  envKey: string;
}

export interface IBuildRecord {
  buildBranch: string;
  builder: string;
  commitId: string;
  flashId: string;
  id: number;
  laneId: string;
}

export interface ISubAppVersionReplenish {
  effectScale: string;
  id: number;
  laneId: string;
}

export interface IVersionStatusModel {
  id: string;
  releaseDesc: string;
  approveUrl: string;
  entityId: string;
  status: EVersionStatus;
  updatedAt: string;
}

export interface ISubAppVersionModel {
  id: string;
  subApp: ISubApp;
  env: IEnvInfo;
  buildRecord: IBuildRecord;
  entry: string;
  replenish: ISubAppVersionReplenish;
  versionStatus: IVersionStatusModel;
  updatedAt: string;
}

export interface IGetSubAppVersionsResponse {
  list: ISubAppVersionModel[];
  total: number;
  limit: number;
  page: number;
}

export interface IGetLogListParams {
  pageNo: number;
  pageSize: number;
  operator?: string;
  endTime?: number;
  startTime?: number;
}

export interface ILogInfo {
  interfaceDesc: string;
  operateTime: string;
  operateType: string;
  operateUser: string;
  requestParams: string; // json string
  id: string;
  interface: string;
  customRecord: any[];
}

export interface IGetLogListResponse {
  list: ILogInfo[];
  total: number;
  limit: number;
  page: number;
}

export interface ITailNumberConfig {
  needGray?: boolean;
  grayPersentage?: number;
  accessList?: string[];
  blockList?: string;
}

export interface IGetServiceTacticsParams {
  mainAppId: string;
  haloNodeId: number;
  haloNodePath: string;
}

export interface IGetServiceTacticsResponse {
  source: string;
  tactics: {
    approver: {
      value: string;
      label: string;
      key: string;
    }[];
    audit_type: 'micro' | 'role' | 'fixed' | 'leader';
    auditors: string;
  }[];
}

export interface IGetConnectInfoParams {
  mainAppId: string;
  subAppId: string;
  envKey: string;
}

export interface IGetConnectInfoResponse {
  mainApp: IMainAppInfo & {
    approval: IApprovalInfo;
  };
  subApp: ISubApp;
  env: IEnvInfo;
}

export interface IUpdateVersionLaneParams {
  versionId: string;
  laneId: string;
}
export interface IUpdateVersionLaneResponse {}

export interface ISetVersionStatusParams {
  status: EVersionStatus;
  mainAppId: string;
  versionId: string;
}

export interface ISetVersionStatusResponse {}

export interface ICreatePublishParams {
  mainAppId: string;
  versionId: string;
  releaseDesc: string;
  approver: string[];
}

export interface ICreatePublishResponse {}

export interface ICancelApprovalParams {
  entityId: string;
  opinion?: string;
}

export interface ICancelApprovalResponse {}

export interface IRollBackConnectVersionParams {
  mainAppId: string;
  subAppId: string;
  envKey: string;
  versionId: string;
}

export interface IRollBackConnectVersionResponse {}
