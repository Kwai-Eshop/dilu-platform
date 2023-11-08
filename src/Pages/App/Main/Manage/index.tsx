import React, { useMemo, useState, useCallback, useEffect } from 'react';
import qs from 'query-string';
// import ConnectService from './ConnectService';
import styles from './index.module.less';
import { Tabs, Table, message, Button, Modal, Form, Input, Space, Tag, Tooltip } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import DebounceSelect from '@/Components/DebounceSelect';

import { BASE_ENV } from '@/Constants';
import {
  api_deleteConnectSubApp,
  api_getMainAppEnv,
  api_createConnectSubApp,
  api_getConnectSubAppList,
  api_updateConnectSubApp,
  api_getMainAppInfo,
  api_queryStaffInfoByStr,
  // api_deleteConnectService
} from '@/Apis';
import { useHistory, useLocation } from 'react-router-dom';
import { envsTextMap } from './const';
import AccessManagement from './AccessManagement';
import { usePermission } from '@/Hooks/permission';
import type { IConfigSubModalValues, IConnectSubModalFormValues } from './Modals';
import { ConnectSubModal, ConfigSubModal } from './Modals';
import { CopyOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import type {
  IConnectSubAppModel,
  IEnvInfo,
  IGetConnectSubAppListResponse,
  IMainAppInfo,
  IPrincipal,
} from '@/Common/interface';
import type { ColumnType, TableProps } from 'antd/es/table';

const { TabPane } = Tabs;
const pageSize = 10;
// const subEnvSelectList = Object.keys(BASE_ENV).reduce((prev, curr) => {
//   prev.push({ label: BASE_ENV[curr]?.label, value: BASE_ENV[curr]?.envType });
//   return prev;
// }, []);

// 乐高主应用 对方舟子应用做 访问规则 特殊限制
const handleLegoFangzhouPrefix = ({
  id,
  subName,
  activeRule,
}: {
  id: string;
  subName: string;
  activeRule: string;
}) => {
  if (
    id === 'EcG4LkLn42' &&
    subName?.indexOf('fangzhou') > -1 &&
    !activeRule?.trim().startsWith('/page/fangzhou')
  ) {
    message.error('乐高-方舟子应用访问规则只能以 /page/fangzhou 开头');
    return true;
  }
  return false;
};

interface ISubAppListProps {
  envInfo?: IEnvInfo;
}

function MainManage() {
  const { search } = useLocation();
  const urlParamsEnvType = qs?.parse(search)?.envType;
  const [subForm] = Form.useForm();
  const id: any = useMemo(() => {
    return qs?.parse(search)?.id;
  }, [search]);
  const [envList, setEnvList] = useState<IEnvInfo[]>([]);
  const [appInfo, setAppInfo] = useState<IMainAppInfo>(Object.create(null));
  const [conSubModalVisible, setConSubModalVisible] = useState(false);
  const [configSubModalVisible, setConfigSubModalVisible] = useState(false);
  const [configModalData, setConfigModalData] = useState<IConnectSubAppModel | null>(null);
  const [conSubList, setConSubList] = useState<IGetConnectSubAppListResponse['list']>([]);
  const history = useHistory();
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentTab, setCurrentTab] = useState('test');
  const [accessDialogVisible, setDialogVisible] = useState(false);

  const { isDeveloper, isAdmin } = usePermission(id);
  const [principal, setPrincipal] = useState();

  const pagination = useMemo(() => {
    return {
      current: pageNo,
      total,
      pageSize,
      showSizeChanger: false,
      showTotal: (total: number) => {
        return `共 ${total} 条`;
      },
    };
  }, [pageNo, total]);
  const getMainAppInfo = useCallback(async () => {
    try {
      const res = await api_getMainAppInfo({ mainId: id });
      setAppInfo(res?.data || {});
    } catch (err) {
      console.error(err);
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  }, [id]);
  const getEnvList = useCallback(async () => {
    try {
      const res = await api_getMainAppEnv();
      setEnvList(res?.data || []);
    } catch (err) {
      console.error(err);
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  }, [id]);

  // 搜索负责人
  const handlePrincipalSearch = async (nameStr: string) => {
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
  // 列表接口
  const getConSubList = useCallback(
    async (env: string) => {
      try {
        const params = subForm.getFieldsValue();
        const subName = params?.subName?.trim(); // 子应用名称
        const subDesc = params?.subDesc?.trim(); // 子应用描述
        const rule = params?.rule?.trim(); // 访问规则
        const creator = params?.creator?.value; // 负责人
        const res = await api_getConnectSubAppList({
          mainAppId: id as string,
          pageNo,
          pageSize,
          env,
          subName,
          subDesc,
          rule,
          creator,
        });
        const { list = [], total } = res?.data || {};
        setConSubList(list);
        setTotal(total);
      } catch (err) {
        console.error(err);
        message.error(err?.message || '请求失败，请稍后再试~');
      }
    },
    [subForm, pageNo, id],
  );
  const handleParamsConfig = (data: IConnectSubAppModel) => {
    setConfigModalData(data);
    setConfigSubModalVisible(true);
  };

  const handleDisConnect = async (record: IConnectSubAppModel, envInfo?: IEnvInfo) => {
    Modal.confirm({
      title: '确定要解除关联吗',
      content: '解除关联后，当前关联环境下的版本将被删除',
      onOk: async () => {
        try {
          await api_deleteConnectSubApp({
            mainAppId: record.mainApp?.id,
            subAppId: record.subApp?.id,
            envKey: envInfo ? envInfo.key : '',
          });
          message.success('解除关联成功');
          setConSubList(conSubList.filter((item) => item.id !== record.id));
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  };

  const handleHistory = (data: IConnectSubAppModel) => {
    const mainId = qs?.parse(search)?.id;
    const subId = data.subApp?.id;
    if (data?.env?.key === BASE_ENV.test?.envType) {
      history.push(`/version/lane?envKey=${data?.env?.key}&mainId=${mainId}&subId=${subId}`);
    } else {
      history.push(`/version/manage?envKey=${data?.env?.key}&mainId=${mainId}&subId=${subId}`);
    }
  };

  useEffect(() => {
    getMainAppInfo();
  }, [getMainAppInfo]);

  useEffect(() => {
    getEnvList();
  }, [getEnvList]);

  useEffect(() => {
    if (urlParamsEnvType) {
      setCurrentTab(urlParamsEnvType as string);
      getConSubList(urlParamsEnvType as string);
    } else {
      getConSubList(currentTab);
    }
  }, [getConSubList]);

  const handleRelateSubApp = useCallback((record: IEnvInfo) => {
    setConSubModalVisible(true);
  }, []);

  const handleConSubModalCancel = () => {
    setConSubModalVisible(false);
  };

  const handleConSubModalOk = async (data: IConnectSubModalFormValues) => {
    console.log('data', data);
    try {
      if (
        handleLegoFangzhouPrefix({
          id,
          subName: data.subApp?.label,
          activeRule: data.activeRule,
        })
      )
        return;

      await api_createConnectSubApp({
        mainAppId: id,
        subAppId: data.subApp?.value,
        envKey: currentTab,
        rule: data.activeRule?.trim(),
        container: data.container || undefined,
        extras: data.extras,
        type: data.type,
      });
      message.success('关联成功');
      setConSubModalVisible(false);
      getEnvList();
      getConSubList(currentTab);
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  };

  const handleConfigSubModalCancel = () => {
    setConfigSubModalVisible(false);
  };

  const handleConfigSubModalOk = async (data: IConfigSubModalValues) => {
    try {
      if (
        handleLegoFangzhouPrefix({
          id,
          subName: data.subName,
          activeRule: data.activeRule,
        })
      )
        return;

      const params = {
        mainId: id,
        subId: data.subId,
        rule: data.activeRule,
        container: data.container,
        extras: data.extras,
        // logMainName: appInfo.name,
        // logSubName: data.subName,
        type: data.type,
        envKey: currentTab,
      };
      if (params.type === 'component') {
        params.rule = '';
      }
      await api_updateConnectSubApp(params);
      setConfigSubModalVisible(false);
      getConSubList(currentTab);
    } catch (err) {
      message.error(err?.msg || '请求失败，请稍后再试~');
    }
  };

  const handleTabsChange = useCallback(
    (key: string) => {
      setCurrentTab(key);
      getConSubList(key);
      setPageNo(1);
      history.push({
        search: `?id=${qs?.parse(search)?.id}&envType=${key}`,
      });
    },
    [getConSubList],
  );

  const handleSubTableChange: TableProps<IConnectSubAppModel>['onChange'] = (pageConfig) => {
    if (pageConfig.current) {
      setPageNo(pageConfig.current);
    }
  };
  // 返回上一页
  const goBack = useCallback(() => {
    // history.go(-1);
    history.push('/app/main/list');
  }, [history]);

  // 传新版本的关联子应用列表
  const SubAPPList = React.memo((props: ISubAppListProps) => {
    const { envInfo } = props;

    const handleSubSearch = useCallback(() => {
      // 防止page改变，也会请求列表
      if (pageNo !== 1) {
        setPageNo(1);
      } else {
        getConSubList(currentTab);
      }
    }, [pageNo, getConSubList]);

    const handleSubReset = useCallback(() => {
      subForm.resetFields();
      // 防止page改变，也会请求列表
      if (pageNo !== 1) {
        setPageNo(1);
      } else {
        getConSubList(currentTab);
      }
    }, [pageNo, subForm, getConSubList]);

    const subColumns: ColumnType<IConnectSubAppModel>[] = [
      {
        title: '子应用ID',
        key: 'subId',
        align: 'center',
        render: (_, record) => {
          return record.subApp?.id || '-';
        },
      },
      {
        title: '子应用名称',
        key: 'name',
        align: 'center',
        render: (_, record) => {
          return (
            <>
              <span>{record.subApp?.subName}</span>
              <CopyToClipboard
                text={record.subApp?.subName}
                onCopy={() => message.success('复制成功')}
              >
                <Button type="link" icon={<CopyOutlined />} />
              </CopyToClipboard>
            </>
          );
        },
      },
      {
        title: '子应用描述',
        key: 'subDesc',
        align: 'center',
        render: (_, record) => {
          return record.subApp?.subDesc || '-';
        },
      },
      {
        title: '子应用类型',
        dataIndex: 'appType',
        key: 'appType',
        align: 'center',
        render: (type) => {
          return type === 'component' ? (
            <Tag color="cyan">组件级</Tag>
          ) : (
            <Tag color="gold">路由级</Tag>
          );
        },
      },
      {
        title: '负责人',
        dataIndex: 'subApp',
        key: 'principal',
        align: 'center',
        render: (_, record) => {
          const principal = record.subApp?.principal;
          if (principal && principal.length) {
            const newPrincipal = principal
              ?.map((item) => {
                const name = item?.label?.split('(')?.[0];
                return `${name}(${item.value})`;
              })
              ?.join?.('、');
            return (
              <Tooltip title={newPrincipal}>
                {newPrincipal.length > 30 ? newPrincipal.slice(0, 30) + '...' : newPrincipal}
              </Tooltip>
            );
          } else {
            return '-';
          }
        },
      },
      {
        title: '访问规则',
        dataIndex: 'activeRule',
        key: 'activeRule',
        align: 'center',
        render: (activeRule) => {
          return activeRule ? (
            <>
              <span>{activeRule}</span>
              <CopyToClipboard text={activeRule} onCopy={() => message.success('复制成功')}>
                <Button type="link" icon={<CopyOutlined />} />
              </CopyToClipboard>
            </>
          ) : (
            '-'
          );
        },
      },
      {
        title: '容器ID',
        dataIndex: 'container',
        key: 'container',
        align: 'center',
        render: (container) => (container ? container : '-'),
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (_, record) => {
          return (
            <>
              <Button
                disabled={!isDeveloper}
                onClick={() => handleDisConnect(record, envInfo)}
                type="link"
              >
                解除关联
              </Button>
              <Button
                disabled={!isDeveloper}
                onClick={() => handleParamsConfig(record)}
                type="link"
              >
                参数配置
              </Button>
              <Button disabled={!isDeveloper} onClick={() => handleHistory(record)} type="link">
                版本管理
              </Button>
            </>
          );
        },
      },
    ];
    const principalStr =
      appInfo?.principal?.length > 0
        ? (appInfo?.principal || [])?.map((item: IPrincipal) => item.value)?.join(',')
        : '';

    return envInfo ? (
      <React.Fragment>
        <Form
          className={styles.searchForm}
          layout="inline"
          form={subForm}
          onFinish={handleSubSearch}
        >
          <div style={{ flex: 1, display: 'flex' }}>
            <Form.Item name="subName" label="子应用名称">
              <Input
                placeholder="请输入子应用名称"
                allowClear
                autoComplete="off"
                style={{ width: '170px' }}
              />
            </Form.Item>
            <Form.Item name="subDesc" label="子应用描述">
              <Input
                placeholder="请输入子应用描述"
                allowClear
                autoComplete="off"
                style={{ width: '170px' }}
              />
            </Form.Item>
            <Form.Item name="rule" label="访问规则">
              <Input placeholder="请输入访问规则" allowClear autoComplete="off" />
            </Form.Item>
            <Form.Item name="creator" label="负责人">
              <DebounceSelect
                value={principal}
                allowClear
                showSearch
                placeholder="请选择负责人"
                fetchOptions={handlePrincipalSearch}
                style={{ width: '200px' }}
                onChange={(value) => {
                  setPrincipal(value);
                }}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button onClick={handleSubReset}>重置</Button>
              </Space>
            </Form.Item>
          </div>
        </Form>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
            <Tag color={envInfo.key === 'prt' || envInfo.key === 'prod' ? 'brown' : '#87d068'}>
              {envsTextMap[envInfo.key]}版本池
            </Tag>
            <Tag
              color={
                envInfo.key === 'prod' ? '#f50' : envInfo.key === 'prt' ? 'darkorange' : '#87d068'
              }
            >
              环境标识：{envInfo.key}
            </Tag>
            <Tag color="#87d068">当前子应用数量：{conSubList.length}</Tag>
          </div>
          <Space>
            {isAdmin ? (
              <Button type="primary" disabled={!isAdmin} onClick={() => setDialogVisible(true)}>
                主应用权限管理
              </Button>
            ) : (
              <Tooltip title={`请找${principalStr}添加权限`}>
                <Button type="primary" onClick={() => setDialogVisible(true)} disabled={!isAdmin}>
                  主应用权限管理
                </Button>
              </Tooltip>
            )}
            {isDeveloper ? (
              <Button
                type="primary"
                disabled={!isDeveloper}
                onClick={() => handleRelateSubApp(envInfo)}
              >
                关联子应用
              </Button>
            ) : (
              <Tooltip title={`请找${principalStr}添加权限`}>
                <Button
                  type="primary"
                  disabled={!isDeveloper}
                  onClick={() => handleRelateSubApp(envInfo)}
                >
                  关联子应用
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>

        <Table
          rowKey="id"
          columns={subColumns}
          dataSource={conSubList}
          pagination={pagination}
          onChange={handleSubTableChange}
        />
      </React.Fragment>
    ) : (
      <></>
    );
  });
  // 暂时去掉主动解除研发云节点
  // const deleteConnectService = async params => {
  //   try {
  //     await api_deleteConnectService(params);
  //     message.success('解除成功');
  //     await getMainAppInfo();
  //   } catch (err) {
  //     message.error(err?.message || '请求失败，请稍后再试~');
  //   }
  // };

  // 暂时去掉主动解除研发云节点
  // const handleDeleteConnectService = () => {
  //   const { mainName, objectId, nodeName } = appInfo || {};
  //   Modal.confirm({
  //     icon: null,
  //     content: `确定将主应用${mainName}与${nodeName}解除关联？解除后可在主应用关联页面重新关联`,
  //     onOk: () => {
  //       deleteConnectService({
  //         mainId: objectId
  //       });
  //     }
  //   });
  // };

  return (
    <div className={styles.container}>
      {!!appInfo && (
        <PageHeader
          className={styles.header}
          onBack={goBack}
          title={`主应用名称：${appInfo.name}`}
          subTitle={
            <>
              <span style={{ marginRight: '10px' }}>主应用ID：{appInfo.id}</span>
              {appInfo.principal?.length > 0 && (
                <span style={{ marginRight: '10px' }}>
                  负责人：
                  {appInfo?.principal
                    ?.map((item: IPrincipal) => {
                      return item.label;
                    })
                    ?.join('、')}
                </span>
              )}
              {/* 暂时去掉主动解除研发云节点 */}
              {/* {appInfo.nodeId && (
                <Button
                  disabled={!isDeveloper}
                  type="link"
                  onClick={handleDeleteConnectService}
                >
                  解除研发云关联
                </Button>
              )} */}
            </>
          }
        />
      )}
      <div className={styles.body}>
        <Tabs
          defaultActiveKey={(urlParamsEnvType as string) || currentTab}
          onChange={handleTabsChange}
          style={{ marginTop: '10px' }}
        >
          <TabPane tab="测试环境" key="test">
            <SubAPPList
              envInfo={envList.find((item) => {
                return item.key === 'test';
              })}
            ></SubAPPList>
          </TabPane>
          <TabPane tab="prt环境" key="prt">
            <SubAPPList
              envInfo={envList.find((item) => {
                return item.key === 'prt';
              })}
            ></SubAPPList>
          </TabPane>
          <TabPane tab="线上环境" key="prod">
            <SubAPPList
              envInfo={envList.find((item) => {
                return item.key === 'prod';
              })}
            ></SubAPPList>

            {/* {appInfo.needConnect && (
              <ConnectService
                appInfo={appInfo}
                isDeveloper={isDeveloper}
                onConnectSuccess={() => {
                  getMainAppInfo();
                }}
              />
            )} */}
          </TabPane>
        </Tabs>
      </div>
      <ConnectSubModal
        visible={conSubModalVisible}
        onCancel={handleConSubModalCancel}
        onOk={handleConSubModalOk}
      ></ConnectSubModal>
      {configModalData && (
        <ConfigSubModal
          key={configModalData?.id}
          data={configModalData}
          visible={configSubModalVisible}
          onCancel={handleConfigSubModalCancel}
          onOk={handleConfigSubModalOk}
        ></ConfigSubModal>
      )}
      <AccessManagement
        appInfo={appInfo}
        visible={accessDialogVisible}
        onClose={() => setDialogVisible(false)}
      ></AccessManagement>
    </div>
  );
}

export default MainManage;
