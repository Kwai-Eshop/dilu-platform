import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  Table,
  message,
  Form,
  Input,
  Button,
  Modal,
  Radio,
  TreeSelect,
  Divider,
  Space,
  Tooltip,
  Tabs,
} from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import dayjs from 'dayjs';
import {
  api_createMainApp,
  api_getMainAppList,
  api_updateMainApp,
  api_queryStaffInfoByStr,
  api_getServiceTree,
  api_getCorrelationMainAppList,
} from '@/Apis';
import styles from './index.module.less';
import { useHistory } from 'react-router-dom';
import { debounce } from 'lodash';
import UserContext from '@/Contexts/user';
import BizSelect from './BizSelect';
import { USER_ROLE_TYPE } from '../../../../Constants';
import type {
  IApprover,
  IGetCorrelationMainAppItem,
  IGetMainAppListResponse,
  IPrincipal,
  IServiceTree,
} from '@/Common/interface';
import type { ColumnsType, TableProps } from 'antd/es/table';
import * as SafeJSON from 'safe-json-parse-and-stringify';
import { useBiz } from '@/Hooks/biz';

const { TextArea } = Input;
const pageSize = 10;
const { TreeNode } = TreeSelect;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

interface IFormValues {
  name: string;
  principal: IPrincipal[];
  approver: IApprover[];
  biz: number;
  desc: string;
  needControl?: boolean;
  haloNodeId: number;
  haloNodePath: string;
  id: string;
}

interface IProps {
  visible: boolean;
  onOk: (val: IFormValues) => Promise<boolean>;
  onCancel: () => void;
  type: any;
  data: IFormValues;
}

const CreateModal = React.memo((props: IProps) => {
  const { visible, onOk, onCancel, type, data } = props;
  const [modalForm] = Form.useForm();
  const [principal, setPrincipal] = useState<IPrincipal[]>([]);
  const [approver, setApprover] = useState([]);
  const [needControl, setNeedControl] = useState(true);
  const [serviceTree, setServiceTree] = useState<IServiceTree[]>([]);
  const findNodePath = (id: number, nodes = serviceTree): string => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i]?.id === id) {
        return nodes[i]?.path;
      } else if (nodes[i]?.children?.length) {
        return findNodePath(id, nodes[i]?.children);
      }
    }
    return '';
  };

  const handleCancel = () => {
    modalForm.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values: IFormValues = await modalForm.validateFields();
      const finalResultValues = Object.assign(
        values,
        values.haloNodeId ? { haloNodePath: findNodePath(values.haloNodeId) } : {},
      );
      console.log('finalResultValues', values, finalResultValues, findNodePath(values.haloNodeId));
      const res = await onOk(finalResultValues);
      if (res) {
        modalForm.resetFields();
      }
      onCancel();
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await api_getServiceTree();
      const nodes = res?.data?.nodes;
      if (nodes && !!nodes.length) {
        setServiceTree(nodes);
      }
    };
    if (visible && !serviceTree.length) {
      fetchData();
    }
  }, [visible, serviceTree]);

  useEffect(() => {
    modalForm.setFieldsValue({ needControl: true, ...data });
    setNeedControl(data?.needControl ?? true);
  }, [modalForm, data]);
  // 搜索负责人
  const handlePrincipalSearch = async (nameStr: string) => {
    try {
      const res = await api_queryStaffInfoByStr({ nameStr });
      const list =
        res?.data?.map((item) => ({
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
  // 搜索审批人
  const handleApproverSearch = async (nameStr: string) => {
    try {
      const res = await api_queryStaffInfoByStr({ nameStr });
      const list =
        res?.data?.map((item) => ({
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

  const renderServiceTree = (nodes: IServiceTree[]) => {
    return nodes.map((tree) => (
      <TreeNode value={tree.id} title={tree.name} key={tree.id}>
        {tree?.children?.length ? renderServiceTree(tree.children) : null}
      </TreeNode>
    ));
  };

  return (
    <Modal
      title={type === 'create' ? '新建主应用' : '编辑主应用'}
      open={visible}
      onCancel={handleCancel}
      onOk={debounce(handleOk, 500)}
      maskClosable={false}
      destroyOnClose
      okText="确定"
      cancelText="取消"
    >
      <Form {...layout} form={modalForm}>
        <Divider orientation="left">基本配置</Divider>
        <Form.Item name="id" label="主应用id" hidden></Form.Item>
        <Form.Item
          name="name"
          label="主应用名称"
          rules={[
            { required: true, message: '请输入主应用名称' },
            () => ({
              validator(_, value) {
                if (value === '' || /^[A-Za-z0-9_-]+$/.test(value)) {
                  return Promise.resolve();
                } else {
                  return Promise.reject(new Error('主应用名称只支持字母数字中划线与下划线'));
                }
              },
            }),
          ]}
        >
          <Input
            disabled={type === 'update'}
            placeholder="请输入主应用名称"
            allowClear
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          name="principal"
          label="负责人"
          rules={[{ required: true, message: '请选择负责人' }]}
        >
          <DebounceSelect
            key="principal"
            mode="multiple"
            value={principal}
            allowClear
            placeholder="请选择负责人"
            fetchOptions={handlePrincipalSearch}
            onChange={(value: IPrincipal[]) => {
              setPrincipal(value);
            }}
          />
        </Form.Item>
        <Form.Item name="biz" label="业务线" rules={[{ required: true, message: '请选择业务线' }]}>
          <BizSelect />
        </Form.Item>
        <Form.Item
          name="desc"
          label="应用描述"
          rules={[{ required: true, message: '请输入应用描述' }]}
        >
          <TextArea rows={3} placeholder="请输入应用描述" autoComplete="off" allowClear />
        </Form.Item>
        <Divider orientation="left">审批配置</Divider>
        <Form.Item
          name="approver"
          label="窗口期审批人"
          rules={[
            { required: true, message: '请选择窗口期审批人' },
            () => ({
              validator(_, value) {
                if (value?.length >= 2) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('最少选择两位审批人'));
              },
            }),
          ]}
        >
          <DebounceSelect
            key="approver"
            mode="multiple"
            value={approver}
            allowClear
            placeholder="请选择审批人"
            fetchOptions={handleApproverSearch}
            onChange={(value) => {
              setApprover(value);
            }}
          />
        </Form.Item>
        <Form.Item
          name="needControl"
          label="非窗口期管控"
          tooltip="建议开启非窗口期管控，开启后可关联服务节点来对应用进行封网管控，内部项目可选择不开启"
          rules={[{ required: true, message: '请选择是否开启非窗口期管控' }]}
        >
          <Radio.Group
            onChange={(e) => {
              setNeedControl(e.target.value);
            }}
          >
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        {needControl && (
          <Form.Item
            name="haloNodeId"
            label="关联服务节点"
            tooltip="关联服务节点后，在非窗口期会拉取容器云上该节点的上线审批策略"
            rules={[{ required: true, message: '请选择服务节点' }]}
          >
            <TreeSelect
              showSearch
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择服务节点"
              allowClear
              treeDefaultExpandAll
            >
              {renderServiceTree(serviceTree)}
            </TreeSelect>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
});

function MainList() {
  const userInfo = useContext(UserContext);
  const [form] = Form.useForm();
  const history = useHistory();
  const [data, setData] = useState<IGetMainAppListResponse['list']>([]);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState<IFormValues>(Object.create(null));
  const [type, setType] = useState('create');
  const [searchPrincipal, setSearchPrincipal] = useState();
  // const [driverVisible, setDriverVisible] = useState(false); // 新功能引导
  const [tabKey, setTabKey] = useState('my');
  const [correlationData, setCorrelationData] = useState<IGetCorrelationMainAppItem[]>([]);

  const pagination = useMemo(() => {
    return {
      current: pageNo,
      total,
      pageSize,
      showSizeChanger: false,
      showTotal: (totalNum: number) => {
        return `共 ${totalNum} 条`;
      },
    };
  }, [pageNo, total]);

  const getMainAppList = useCallback(async () => {
    try {
      setLoading(true);
      const params = form.getFieldsValue();
      const mainName = params.mainName?.trim();
      const id = params.id?.trim();
      const principal = params.principal?.value;
      const mainDesc = params.mainDesc?.trim(); // 应用描述
      const res = await api_getMainAppList({
        pageNo,
        pageSize,
        mainName,
        mainDesc,
        principal,
        bizId: params?.biz,
        mainAppId: id,
      });
      const { list, totalCount } = res?.data || {};
      setData(list);
      setTotal(total);
    } catch (err) {
      console.error(err);
      message.error(err?.message || '请求失败，请稍后再试~');
    } finally {
      setLoading(false);
    }
  }, [form, pageNo]);

  useEffect(() => {
    if (!localStorage.getItem('dilu-driver-status')) {
      // setDriverVisible(true);
      localStorage.removeItem('dilu-driver');
    }
  }, []);

  const getCorrelationMainAppList = useCallback(async () => {
    try {
      setLoading(true);
      const params = form.getFieldsValue();
      const mainName = params.mainName?.trim();
      const mainAppId = params.id?.trim();
      const principal = params.principal?.value;
      const mainDesc = params.mainDesc?.trim();
      const bizId = params.biz;
      const res = await api_getCorrelationMainAppList({
        pageNo,
        pageSize,
        mainName,
        principal,
        mainDesc,
        mainAppId,
        bizId,
      });
      const { list, totalCount } = res?.data || {};
      setCorrelationData(list);
      setTotal(total);
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    } finally {
      setLoading(false);
    }
  }, [form, pageNo]);

  useEffect(() => {
    if (tabKey === 'my') {
      getCorrelationMainAppList();
    } else {
      getMainAppList();
    }
  }, [getCorrelationMainAppList, getMainAppList, tabKey]);

  useEffect(() => {
    setPageNo(1);
  }, [tabKey]);

  // 搜索负责人
  const handlePrincipalSearch = async (nameStr: string) => {
    try {
      const res = await api_queryStaffInfoByStr({ nameStr });
      const list =
        res?.data?.map((item) => ({
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

  const handleReset = useCallback(() => {
    form.resetFields();
    if (pageNo !== 1) {
      setPageNo(1);
    } else {
      getMainAppList();
    }
  }, [form, getMainAppList, pageNo]);

  const handleSearch = useCallback(() => {
    if (pageNo !== 1) {
      setPageNo(1);
    } else {
      if (tabKey === 'my') {
        getCorrelationMainAppList();
      } else {
        getMainAppList();
      }
    }
  }, [getCorrelationMainAppList, getMainAppList, pageNo, tabKey]);

  const handleCreateModalOk = useCallback(
    async (params: any) => {
      try {
        if (type === 'create') {
          await api_createMainApp(params);
        } else {
          await api_updateMainApp({ ...params });
        }
        // 同步需要时间, 我也不想写这种东西，但是没什么时间处理
        setTimeout(() => {
          if (tabKey === 'my') {
            getCorrelationMainAppList();
          } else {
            getMainAppList();
          }
        }, 100);
        return true;
      } catch (err) {
        message.error(err?.message || '请求失败，请稍后再试~');
        return false;
      }
    },
    [setCreateModalVisible, getCorrelationMainAppList, getMainAppList, type, modalData, tabKey],
  );

  const handleCreateModalCancel = useCallback(() => {
    setCreateModalVisible(false);
    setModalData(Object.create(null));
  }, [setCreateModalVisible, setModalData]);

  const handleEdit = useCallback(
    (data: IFormValues) => {
      setType('update');
      setCreateModalVisible(true);
      setModalData(data);
    },
    [setType, setCreateModalVisible, setModalData],
  );
  const handleManage = useCallback(
    (data: IGetCorrelationMainAppItem) => {
      history.push(`/app/main/manage?id=${data.id}`);
    },
    [history],
  );
  const bizList = useBiz();
  const columns: ColumnsType<IGetCorrelationMainAppItem> = useMemo(() => {
    return [
      {
        title: '主应用ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        width: 160,
      },
      {
        title: '主应用名称',
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        ellipsis: true,
        onCell: () => {
          return {
            style: {
              width: 200,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          };
        },
        render: (_, rowData) => {
          return (
            <Tooltip placement="topLeft" title={rowData.name}>
              {rowData.name || '-'}
            </Tooltip>
          );
        },
      },
      {
        title: '主应用描述',
        dataIndex: 'desc',
        key: 'desc',
        align: 'center',
        ellipsis: true,
        onCell: () => {
          return {
            style: {
              maxWidth: 200,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          };
        },
        render: (_, rowData) => {
          return (
            <Tooltip placement="topLeft" title={rowData.desc}>
              {rowData.desc || '-'}
            </Tooltip>
          );
        },
      },
      {
        title: 'kconf key',
        key: 'kconfKey',
        align: 'center',
        render: (_, rowData) => rowData.replenish?.kconfKey,
      },
      {
        title: '业务线',
        key: 'biz',
        align: 'center',
        render: (_, record) => {
          const target = bizList.find((v) => v.id === record.biz);
          return target ? target.title : '-';
        },
      },
      {
        title: '负责人',
        dataIndex: 'principal',
        key: 'principal',
        align: 'center',
        render: (principalStr) => {
          const principal = SafeJSON.jsonParse(principalStr, []);
          if (principal && principal.length) {
            const newPrincipal = principal
              ?.map((item: IPrincipal) => {
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
        title: '窗口期审批人',
        dataIndex: 'approval',
        key: 'approval',
        align: 'center',
        render: (approval) => {
          const approver = SafeJSON.jsonParse(approval?.approver, []);
          if (approver && approver.length) {
            const newApprover = approver
              ?.map((item: IApprover) => {
                const name = item?.label?.split('(')?.[0];
                return `${name}(${item.value})`;
              })
              ?.join?.('、');
            return (
              <Tooltip title={newApprover}>
                {newApprover.length > 30 ? newApprover.slice(0, 30) + '...' : newApprover}
              </Tooltip>
            );
          } else {
            return '-';
          }
        },
      },
      {
        title: '最近更新',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        align: 'center',
        minWidth: 140,
        render: (updatedAt) => {
          return <span>{dayjs(updatedAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
      {
        title: '操作',
        key: 'operate',
        align: 'center',
        minWidth: 160,
        fixed: 'right',
        render: (text, record) => {
          return (
            <>
              <Button
                onClick={() =>
                  handleEdit({
                    name: record.name,
                    desc: record.desc,
                    principal: SafeJSON.jsonParse(record.principal, []),
                    approver: SafeJSON.jsonParse(record.approval?.approver, []),
                    needControl: record.approval?.needControl,
                    haloNodeId: record.approval?.haloNodeId,
                    haloNodePath: record.approval?.haloNodePath,
                    biz: record.biz,
                    id: record.id,
                  })
                }
                type="link"
                // disabled={}
              >
                编辑
              </Button>
              <Button onClick={() => handleManage(record)} type="link">
                管理
              </Button>
            </>
          );
        },
      },
    ];
  }, [handleEdit, handleManage, bizList]);

  const handleCreate = useCallback(() => {
    setType('create');
    setCreateModalVisible(true);
  }, [setType, setCreateModalVisible]);

  const handleTableChange: TableProps<IGetCorrelationMainAppItem>['onChange'] = (pageConfig) => {
    setPageNo(pageConfig.current || 1);
    getMainAppList();
  };
  return (
    <div className={styles.container}>
      <Form className={styles.searchForm} layout="inline" form={form} onFinish={handleSearch}>
        <div style={{ flex: 1, display: 'flex' }}>
          <Form.Item name="id" label="应用ID">
            <Input placeholder="请输入应用ID" autoComplete="off" />
          </Form.Item>
          <Form.Item name="mainName" label="主应用名称">
            <Input placeholder="请输入主应用名称" autoComplete="off" allowClear />
          </Form.Item>
          <Form.Item name="mainDesc" label="主应用描述">
            <Input placeholder="请输入主应用描述" autoComplete="off" allowClear />
          </Form.Item>
          <Form.Item name="principal" label="负责人">
            <DebounceSelect
              value={searchPrincipal}
              allowClear
              showSearch
              placeholder="请选择负责人"
              fetchOptions={handlePrincipalSearch}
              style={{ width: '220px' }}
              onChange={(value) => {
                setSearchPrincipal(value);
                form.setFieldsValue({
                  principal: value,
                });
              }}
            />
          </Form.Item>
          <Form.Item name="biz" label="业务线" className={styles.bizSelect}>
            <BizSelect />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary">
                查询
              </Button>
              <Button onClick={handleReset} style={{ marginLeft: '10px' }}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </div>
      </Form>
      {createModalVisible && (
        <CreateModal
          visible={createModalVisible}
          onCancel={handleCreateModalCancel}
          onOk={handleCreateModalOk}
          data={modalData}
          type={type}
        ></CreateModal>
      )}
      <Tabs
        tabBarExtraContent={{
          right: (
            <div className={styles.operateWrap}>
              <Button onClick={handleCreate} type="primary">
                新建主应用
              </Button>
            </div>
          ),
        }}
        defaultActiveKey={tabKey}
        onChange={(key) => setTabKey(key)}
      >
        <TabPane tab="全部应用" key="all">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={pagination}
            onChange={handleTableChange}
            loading={loading}
          />
        </TabPane>
        <TabPane tab="与我相关" key="my">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={correlationData}
            pagination={pagination}
            onChange={handleTableChange}
            loading={loading}
          />
        </TabPane>
      </Tabs>
      {/* 全局引导 */}
      {/* <DriverModal
        title={'2022.7.7 升级 changelog'}
        pageList={driverList}
        visible={driverVisible}
        disabledPoint={true}
        maskClosable={false}
        onCancel={() => {
          setDriverVisible(false);
          localStorage.setItem('dilu-driver-status', true);
        }}
        onOk={() => {
          setDriverVisible(false);
          localStorage.setItem('dilu-driver-status', true);
        }}
      /> */}
    </div>
  );
}

export default React.memo(MainList);
