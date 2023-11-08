export const USER_ROLE_TYPE = {
  GUEST: 'guest',
  DEVELOPER: 'developer',
  MAINTAINER: 'maintainer',
};

export const POOL_TYPE = {
  TEST: 'test', // 测试版本池
  PROD: 'prod', // 线上版本池
};
// 默认的三个基础环境
export const BASE_ENV: Record<
  string,
  {
    envType: string;
    name: string;
    label: string;
    poolType: string;
    needAudit: boolean;
  }
> = {
  test: {
    envType: 'test',
    name: 'Test',
    label: '测试环境',
    poolType: POOL_TYPE.TEST,
    needAudit: false, // 是否需要审核
  },
  prt: {
    envType: 'prt',
    name: 'Prt',
    label: 'PRT环境',
    poolType: POOL_TYPE.PROD,
    needAudit: false,
  },
  prod: {
    envType: 'prod',
    name: 'Prod',
    label: '线上环境',
    poolType: POOL_TYPE.PROD,
    needAudit: true,
  },
};

// 生效状态
export const EFFECTIVE_STATUS = {
  not: 1, // 未生效
  auditing: 2, // 审核中
  approved: 3, // 审核通过
  gray: 4, // 放量中
  yet: 5, // 已生效
  failed: 6, // 上线失败版本（回滚
};

export const EFFECTIVE_STATUS_TEXT = {
  [EFFECTIVE_STATUS.not]: '未生效',
  [EFFECTIVE_STATUS.auditing]: '审核中',
  [EFFECTIVE_STATUS.approved]: '审核通过',
  [EFFECTIVE_STATUS.gray]: '放量中',
  [EFFECTIVE_STATUS.yet]: '已生效',
  [EFFECTIVE_STATUS.failed]: '已回滚',
};

export const LOG_OPERATE_TYPE = [
  { key: 'unknown', label: '未知', value: 0, color: 'gray' },
  { key: 'create', label: '增加', value: 1, color: '#2db7f5' },
  { key: 'read', label: '查询', value: 2, color: '#108ee9' },
  { key: 'update', label: '更新', value: 3, color: '#87d068' },
  { key: 'delete', label: '删除', value: 4, color: '#f50' },
];

export const APPROVE_TACTICS_TEXT = {
  fixed: '固定审批人',
  role: '角色审批人',
  leader: 'leader审批',
  micro: '窗口期审批',
};
