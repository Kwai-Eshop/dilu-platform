import React, { useMemo, useCallback, useEffect, useContext, useState } from 'react';
import {
  Table,
  message,
  Form,
  Input,
  Button,
  Select,
  Modal,
  Descriptions,
  Tag,
  Tooltip,
  Alert,
  Steps,
} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { CopyOutlined } from '@ant-design/icons';
import { useLocation, useHistory } from 'react-router-dom';
import DebounceSelect from '@/Components/DebounceSelect';
import qs from 'query-string';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  api_getConnectInfo,
  api_getSubAppVersions,
  api_createPublish,
  api_getServiceTactics,
  api_queryStaffInfoByStr,
  api_getChituAppDetail,
  api_setVersionStatus,
  api_cancelApproval,
  api_rollBackConnectVersion,
} from '@/Apis';
import styles from './index.module.less';
import {
  BASE_ENV,
  EFFECTIVE_STATUS,
  EFFECTIVE_STATUS_TEXT,
  APPROVE_TACTICS_TEXT,
} from '@/Constants';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { usePermission } from '@/Hooks/permission';
import GrayPublishForm from './Components/GrayPublishForm';
import PageContext from '@/Contexts/pageConfig';
import type {
  IApprover,
  IEnvInfo,
  IGetConnectInfoResponse,
  IGetServiceTacticsResponse,
  ISubApp,
  ISubAppVersionModel,
} from '@/Common/interface';
import { EVersionStatus, ITailNumberConfig } from '@/Common/interface';
import type { ColumnType, TableProps } from 'antd/es/table';
const { Option } = Select;
const { Step } = Steps;

const pageSize = 10;
const layout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

function VersionManage() {
  const history = useHistory();
  const { search } = useLocation();
  const [searchForm] = Form.useForm();
  const [effectForm] = Form.useForm();
  const [mainAppInfo, setMainAppInfo] = useState<IGetConnectInfoResponse['mainApp']>(
    Object.create(null),
  );
  const [subAppInfo, setSubAppInfo] = useState<ISubApp>(Object.create(null));
  const [envInfo, setEnvInfo] = useState<IEnvInfo>(Object.create(null));
  const [versionInfo, setVersionInfo] = useState<ISubAppVersionModel>(Object.create(null));
  const subId = useMemo(() => {
    return qs?.parse(search)?.subId;
  }, [search]) as string;
  const mainId = useMemo(() => {
    return qs?.parse(search)?.mainId;
  }, [search]) as string;
  const envKey = useMemo(() => {
    return qs?.parse(search)?.envKey;
  }, [search]) as string;
  const [versionList, setVersionList] = useState<ISubAppVersionModel[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [approverList, setApproverList] = useState<IApprover[]>([]);
  const [isFixedApprove, setFixedApprove] = useState(false);
  const [isOnlyLeaderApprove, setOnlyLeaderApprove] = useState(false);
  const [approveAlert, setApproveAlert] = useState('');
  const [approveTactics, setApproveTactics] = useState<IGetServiceTacticsResponse['tactics']>([]);
  const [buildOwner, setBuildOwner] = useState(); // 构建人
  const { isDeveloper } = usePermission(mainId);

  const pagination = useMemo(() => {
    return {
      current: pageNo,
      total,
      pageSize,
      showTotal: (num: number) => {
        return `共 ${num} 条`;
      },
    };
  }, [pageNo, total]);
  const [effectConfirmLoading, setEffectConfirmLoading] = useState(false);
  // 生效状态筛选项
  const statusOptions = useMemo(() => {
    if (envInfo) {
      let statusList;
      if (envInfo.key === 'prod') {
        statusList = [
          EFFECTIVE_STATUS.not,
          EFFECTIVE_STATUS.auditing,
          EFFECTIVE_STATUS.approved,
          EFFECTIVE_STATUS.yet,
          EFFECTIVE_STATUS.failed,
        ];
      } else {
        statusList = [EFFECTIVE_STATUS.not, EFFECTIVE_STATUS.yet];
      }
      return statusList.map((status) => {
        return {
          value: status,
          label: EFFECTIVE_STATUS_TEXT[status],
        };
      });
    } else {
      return [];
    }
  }, [envInfo]);
  const [effectModalVisible, setEffectModalVisible] = useState(false);
  const [approvedState, setApprovedState] = useState<number>(1);
  const isPrt = envInfo?.key === 'prt';
  const goBack = useCallback(() => {
    history.go(-1);
  }, [history]);
  const getConnectInfo = async () => {
    try {
      const res = await api_getConnectInfo({
        mainAppId: mainId,
        subAppId: subId,
        envKey,
      });
      const { env, mainApp, subApp } = res?.data || {};
      setMainAppInfo(mainApp);
      setSubAppInfo(subApp);
      setEnvInfo(env);
    } catch (err) {
      console.error(err);
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  };
  // 搜索构建人
  const handleBuildOwnerSearch = async (nameStr: string) => {
    try {
      const res = await api_queryStaffInfoByStr({ nameStr });
      const list =
        res.data?.map?.((item) => ({
          label: `${item.name}(${item.username})`,
          value: item.username,
          photo: item.photo,
        })) || [];
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };
  // 版本列表
  const getConnectVersions = useCallback(
    async (pageNo = 1) => {
      try {
        const params = searchForm.getFieldsValue();
        const res = await api_getSubAppVersions({
          envKey,
          subAppId: subId,
          pageNo,
          ...params,
          pageSize,
          buildOwner: params.buildOwner?.value,
        });
        const { list, total } = res?.data || {};
        setVersionList(list);
        setTotal(total);
        setPageNo(pageNo);
      } catch (err) {
        console.error(err);
        message.error(err?.message || '请求失败，请稍后再试~');
      }
    },
    [searchForm],
  );
  // 查询重置
  const handleReset = useCallback(() => {
    searchForm.resetFields();
    getConnectVersions(1);
  }, [searchForm, getConnectVersions]);
  const handleConfirmTakeOnlineEffect = async (
    subAppVersionModel: ISubAppVersionModel,
    targetVersionStatus: EVersionStatus,
  ) => {
    try {
      switch (targetVersionStatus) {
        case EVersionStatus.TAKE_EFFECT: // 上线
          await api_setVersionStatus({
            status: targetVersionStatus,
            versionId: subAppVersionModel.id,
            mainAppId: mainAppInfo.id,
          });
          break;
        case EVersionStatus.UN_TAKE_EFFECT: // 撤回
          await api_cancelApproval({
            entityId: subAppVersionModel.versionStatus?.entityId,
          });
          break;
        case EVersionStatus.ROLL_BACK: //回滚
          await api_rollBackConnectVersion({
            versionId: subAppVersionModel.id,
            mainAppId: mainAppInfo.id,
            subAppId: subAppVersionModel.subApp?.id,
            envKey: subAppVersionModel.env?.key,
          });
          break;
        default:
          break;
      }
      message.success('操作成功');
      getConnectVersions(pageNo);
    } catch (e) {
      message.error(e.message);
    }
  };
  // 上线
  const handleOnline = (data: ISubAppVersionModel, targetVersionStatus: EVersionStatus) => {
    Modal.confirm({
      title: '提示',
      onOk: debounce(handleConfirmTakeOnlineEffect.bind(null, data, targetVersionStatus), 500),
      cancelText: '取消',
      okText: '确认',
      content: (
        <div>
          {targetVersionStatus === EVersionStatus.TAKE_EFFECT &&
            '确认上线后该版本立即生效，确认上线？'}
          {targetVersionStatus === EVersionStatus.UN_TAKE_EFFECT &&
            '撤销后需重新发起审批流程，确认撤销？'}
          {targetVersionStatus === EVersionStatus.ROLL_BACK &&
            '快速回滚将回滚到上一个生效版本，确认回滚？'}
        </div>
      ),
    });
  };
  /**
   * 立即生效
   */
  const InitiateApproval = useCallback(async () => {
    try {
      const { versionStatus = Object.create(null), id: versionId } = versionInfo;
      const { lane, approver, releaseDesc } = effectForm.getFieldsValue();
      // const params = {
      //   lane: lane || undefined,
      //   approver: approver || undefined,
      //   mainId: mainAppInfo.id,
      //   subId: subAppInfo.id,
      //   releaseDesc: releaseDesc ? releaseDesc.trim() : releaseDesc,
      //   logMainName: mainAppInfo.name,
      //   logSubName: subAppInfo.subName,
      //   logExtendDesc:
      //     envInfo.key === 'prod'
      //       ? '发起线上审批'
      //       : versionStatus.status === EFFECTIVE_STATUS.not
      //       ? '设置prt环境生效版本'
      //       : '修改prt环境生效泳道',
      // };
      // if (
      //   versionStatus.status === EFFECTIVE_STATUS.not ||
      //   versionStatus.status === EFFECTIVE_STATUS.yet
      // ) {
      //   // 未生效
      //   // params.connectId = connectId;
      //   // params.versionId = versionId;
      // }
      await api_createPublish({
        mainAppId: mainAppInfo.id,
        versionId,
        releaseDesc: releaseDesc ? releaseDesc.trim() : releaseDesc,
        approver,
      });
      message.success('提交成功');
      getConnectVersions(pageNo);
    } catch (err) {
      message.error(err?.msg || '请求失败，请稍后再试~');
    }
  }, [versionInfo, envInfo, effectForm, pageNo, mainAppInfo, subAppInfo, getConnectVersions]);

  const approveCheck = useCallback(async () => {
    try {
      const res = await api_getServiceTactics({
        haloNodeId: mainAppInfo.approval?.haloNodeId,
        haloNodePath: mainAppInfo.approval?.haloNodePath,
        mainAppId: mainAppInfo.id,
      });
      const tactics = res?.data?.tactics || [];
      setApproveTactics(tactics);
      const auditType: any[] = [];
      const audit = tactics.map((item) => {
        const { audit_type, approver } = item || {};
        auditType.push(audit_type);
        return {
          auditType: audit_type,
          approver,
        };
      });
      if (auditType.includes('micro')) {
        const index = auditType.indexOf('micro');
        setApproverList(audit[index]?.approver);
        setEffectModalVisible(true);
      } else if (auditType.includes('role')) {
        const index = auditType.indexOf('role');
        setApproverList(audit[index]?.approver);
        setApproveAlert('当前处于非窗口期，上线需要角色审批');
        setEffectModalVisible(true);
      } else if (auditType.includes('fixed')) {
        const index = auditType.indexOf('fixed');
        const approver: IApprover[] = audit[index]?.approver;
        setApproverList(approver);
        setFixedApprove(true);
        effectForm.setFieldsValue({
          approver: approver.map((item) => item.label),
        });
        setEffectModalVisible(true);
      } else if (auditType.includes('leader')) {
        setOnlyLeaderApprove(true);
        setApproveAlert('当前处于非窗口期，上线需要直属leader审批');
        setEffectModalVisible(true);
      } else {
        Modal.confirm({
          icon: null,
          content: '获取审批人异常，请重试',
          onOk: () => {},
        });
      }
      if (auditType.includes('role') && auditType.includes('leader')) {
        setApproveAlert('当前处于非窗口期，上线需要角色审批和直属leader审批');
      }
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  }, [mainAppInfo, effectForm]);

  const handleTakeEffect = useCallback(
    (data: ISubAppVersionModel) => {
      setVersionInfo(data);
      effectForm.setFieldsValue({ lane: data.replenish?.laneId });
      if (envInfo.key === 'prod') {
        approveCheck();
      } else {
        setEffectModalVisible(true);
      }
    },
    [effectForm, envInfo, approveCheck],
  );

  const handleConfirmTakeEffect = useCallback(async () => {
    try {
      await effectForm.validateFields();
      setEffectConfirmLoading(true);
      await InitiateApproval();
      setEffectModalVisible(false);
      setEffectConfirmLoading(false);
    } catch (e) {
      //
    }
  }, [effectForm, InitiateApproval]);
  const handleCloseEffectModal = useCallback(() => {
    setEffectModalVisible(false);
    effectForm.resetFields();
  }, [effectForm]);

  // 查询
  const handleSearch = useCallback(() => {
    getConnectVersions(1);
  }, [getConnectVersions]);
  useEffect(() => {
    getConnectInfo();
    getConnectVersions(1);
  }, []);

  const handleTableChange: TableProps<ISubAppVersionModel>['onChange'] = (pagination) => {
    const { current } = pagination;
    getConnectVersions(current);
  };

  // 表格列
  const columns: ColumnType<ISubAppVersionModel>[] = [
    {
      title: '版本ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: 'Commit ID（8位）',
      key: 'commitId',
      align: 'center',
      ellipsis: true,
      render: (_, record) => record.buildRecord?.commitId,
    },
    {
      title: '构建分支',
      key: 'buildBranch',
      width: 120,
      align: 'center',
      ellipsis: true,
      render: (_, record) => record.buildRecord?.buildBranch,
    },
    {
      title: '构建人',
      key: 'buildOwner',
      width: 120,
      align: 'center',
      render: (_, record) => record.buildRecord?.builder,
    },
    {
      title: 'entry地址',
      dataIndex: 'entry',
      key: 'entry',
      align: 'center',
      ellipsis: true,
      render: (entry) => {
        return (
          <Tooltip title={entry}>
            <a
              href={entry}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                width: 200,
                wordBreak: 'break-all',
              }}
            >
              {entry.length > 30 ? entry.slice(0, 5) + '...' + entry.slice(-20) : entry}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      key: 'versionStatus',
      align: 'center',
      ellipsis: true,
      width: 170,
      render: (_, record) => {
        return (
          <span
            className={classNames(styles.status, {
              [styles['status__red']]:
                record.versionStatus?.status === EFFECTIVE_STATUS.auditing ||
                record.versionStatus?.status === EFFECTIVE_STATUS.gray ||
                record.versionStatus?.status === EFFECTIVE_STATUS.failed,
              [styles['status__orange']]:
                record.versionStatus?.status === EFFECTIVE_STATUS.approved,
              [styles['status__green']]: record.versionStatus?.status === EFFECTIVE_STATUS.yet,
            })}
          >
            {EFFECTIVE_STATUS_TEXT[record.versionStatus.status] || '未生效'}
          </span>
        );
      },
    },
    {
      title: '审批单',
      key: 'approvalUrl',
      align: 'center',
      ellipsis: true,
      render: (_, record) => {
        return record.versionStatus?.approveUrl ? (
          <div>
            <Tooltip title={record.versionStatus?.approveUrl}>
              <a href={record.versionStatus?.approveUrl} target="_blank" rel="noreferrer">
                审批链接
              </a>
            </Tooltip>
            <CopyToClipboard
              text={record.versionStatus?.approveUrl}
              onCopy={() => message.success('复制成功')}
            >
              <Button type="link" icon={<CopyOutlined />} />
            </CopyToClipboard>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: envInfo?.key === 'prt' ? '发布描述' : '上线描述',
      key: 'releaseDesc',
      align: 'center',
      ellipsis: true,
      render: (_, record) =>
        record.versionStatus?.releaseDesc ? (
          <Tooltip title={record.versionStatus?.releaseDesc}>
            <div className={styles.ellipsis}>{record.versionStatus?.releaseDesc}</div>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '泳道',
      key: 'lane',
      width: 180,
      align: 'center',
      colSpan: envInfo?.key === 'prt' ? 0 : 1,
      render: (_, record) => {
        return record.replenish?.laneId || '-';
      },
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      width: 200,
      align: 'center',
      ellipsis: true,
      render: (_, record) => {
        return (
          <span>{dayjs(record.versionStatus?.updatedAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>
        );
      },
    },
    {
      title: '构建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      align: 'center',
      ellipsis: true,
      render: (createdAt) => {
        return <span>{dayjs(createdAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      fixed: 'right',
      ellipsis: true,
      render: (_, record) => {
        if (!isPrt) {
          return null;
        }
        return (
          <>
            {record.versionStatus?.status === EVersionStatus.UN_TAKE_EFFECT && (
              <Button type="link" disabled={!isDeveloper} onClick={() => handleTakeEffect(record)}>
                立即生效
              </Button>
            )}
            {record.versionStatus?.status === EVersionStatus.TAKE_EFFECT &&
              envInfo?.key !== 'prod' && (
                <Button
                  disabled={!isDeveloper}
                  type="link"
                  onClick={() => handleTakeEffect(record)}
                >
                  修改泳道
                </Button>
              )}
            {record.versionStatus?.status === EVersionStatus.APPROVED &&
              envInfo?.key === 'prod' && (
                <>
                  <Button
                    type="link"
                    disabled={!isDeveloper}
                    onClick={() => handleOnline(record, EVersionStatus.UN_TAKE_EFFECT)}
                  >
                    撤销
                  </Button>
                  <Button
                    type="link"
                    disabled={!isDeveloper}
                    onClick={() => handleOnline(record, EVersionStatus.TAKE_EFFECT)}
                  >
                    上线
                  </Button>
                </>
              )}
            {envInfo?.key === 'prod' && (
              <>
                <Button
                  type="link"
                  disabled={!isDeveloper}
                  onClick={() => handleOnline(record, EVersionStatus.ROLL_BACK)}
                >
                  快速回滚
                </Button>
                {/* <Button type="link" disabled={!isDeveloper} onClick={() => handleOnline(record, 1)}>
                  继续放量
                </Button> */}
              </>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader className={styles.header} title="子应用版本管理" onBack={goBack}>
        <Descriptions column={3} className={styles.headerInfo}>
          <Descriptions.Item label="主应用">
            <Tag color="processing">{mainAppInfo?.name || ''}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="主应用环境">
            <Tag color={isPrt ? 'warning' : 'error'}>{BASE_ENV[envInfo?.key]?.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="子应用">
            <Tag color="processing">{subAppInfo?.subName || ''}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </PageHeader>
      <div className={styles.body}>
        <Form
          className={styles.searchForm}
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <div style={{ display: 'flex', flex: 1 }}>
            {envInfo?.key === 'prt' && (
              <Form.Item name="lane" label="泳道">
                <Input placeholder="请输入泳道" allowClear autoComplete="off" />
              </Form.Item>
            )}
            <Form.Item name="buildOwner" label="构建人">
              <DebounceSelect
                value={buildOwner}
                showSearch
                allowClear
                placeholder="请选择构建人"
                fetchOptions={handleBuildOwnerSearch}
                style={{ width: '200px' }}
                onChange={(value) => {
                  setBuildOwner(value);
                }}
              />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                placeholder="请选择状态"
                style={{ width: '200px' }}
                allowClear
                onChange={handleSearch}
              >
                {statusOptions.map((item) => (
                  <Option value={item.value} key={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Form.Item>
          </div>
        </Form>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={versionList}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </div>
      <Modal
        title="立即生效"
        open={effectModalVisible}
        cancelText="取消"
        okText="确定"
        confirmLoading={effectConfirmLoading}
        onCancel={handleCloseEffectModal}
        onOk={debounce(handleConfirmTakeEffect, 500)}
      >
        {approveAlert && (
          <Alert message={approveAlert} type="info" showIcon style={{ marginBottom: 10 }} />
        )}
        <Form form={effectForm} {...layout}>
          {envInfo?.key === 'prt' && (
            <>
              <Form.Item
                name="lane"
                label="泳道ID"
                // rules={[{ required: true, message: '请输入泳道ID' }]}
              >
                <Input placeholder="请输入" allowClear autoComplete="off" />
              </Form.Item>
              <Form.Item name="releaseDesc" label="发布描述">
                <Input.TextArea
                  placeholder="请输入"
                  rows={4}
                  maxLength={200}
                  allowClear
                  autoComplete="off"
                />
              </Form.Item>
            </>
          )}
          {envInfo?.key === 'prod' && (
            <>
              {versionInfo?.entry && (
                <Form.Item label="目标生效entry">
                  <a
                    className={styles.entryLink}
                    href={versionInfo.entry}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {versionInfo.entry}
                  </a>
                </Form.Item>
              )}
              <Form.Item
                name="releaseDesc"
                label="上线描述"
                rules={[{ required: true, message: '请输入上线描述' }]}
              >
                <Input placeholder="请输入上线描述" allowClear autoComplete="off" />
              </Form.Item>
              {!!approveTactics.length && (
                <Form.Item
                  label={
                    approveTactics.length === 1 && !isOnlyLeaderApprove && !isFixedApprove
                      ? '选择审批人'
                      : '审批流程'
                  }
                  required
                >
                  {approveTactics.length === 1 ? (
                    isOnlyLeaderApprove ? (
                      <span>直属leader审批</span>
                    ) : isFixedApprove ? (
                      <span>{approveTactics[0].auditors}</span>
                    ) : (
                      <Form.Item
                        name="approver"
                        rules={[
                          {
                            required: true,
                            message: '请选择审批人',
                          },
                        ]}
                      >
                        <Select mode="multiple" placeholder="请选择" allowClear>
                          {approverList.map((item) => (
                            <Option value={item.value} key={item.value}>
                              {item.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )
                  ) : (
                    <Steps
                      progressDot
                      current={approveTactics.length}
                      direction="vertical"
                      className={styles['approveStep']}
                    >
                      {approveTactics.map((item, index) => {
                        return (
                          <Step
                            // @ts-ignore
                            title={APPROVE_TACTICS_TEXT[item.audit_type]}
                            key={index}
                            description={
                              <>
                                {item.audit_type === 'fixed' && item.auditors}
                                {item.audit_type === 'leader' && '直属leader审批'}
                                {['role', 'micro'].includes(item.audit_type) && (
                                  <Form.Item
                                    name="approver"
                                    rules={[
                                      {
                                        required: true,
                                        message: '请选择审批人',
                                      },
                                    ]}
                                  >
                                    <Select
                                      mode="multiple"
                                      placeholder="请选择"
                                      allowClear
                                      // @ts-ignore
                                      {...props}
                                    >
                                      {approverList.map((item) => (
                                        <Option value={item.value} key={item.value}>
                                          {item.label}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                )}
                              </>
                            }
                          />
                        );
                      })}
                    </Steps>
                  )}
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default React.memo(VersionManage);
