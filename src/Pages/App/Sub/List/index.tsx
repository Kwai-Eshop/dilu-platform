import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, message, Form, Input, Button, Modal, Space, Tooltip, Tabs } from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import dayjs from 'dayjs';
import {
  api_createSubApp,
  api_getSubAppList,
  api_updateSubApp,
  api_queryStaffInfoByStr,
  api_getCorrelationSubAppList,
} from '@/Apis';
import { useHistory } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { debounce } from 'lodash';
import styles from './index.module.less';
import { CopyOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import type { ICreateSubAppParams, IPrincipal, ISubApp } from '@/Common/interface';
import type { ColumnType, TableProps } from 'antd/es/table';

const pageSize = 10;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

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

interface ICreateModalProps {
  visible: boolean;
  onOk: (values: any) => Promise<void>;
  onCancel: () => void;
  type: any;
  data: any;
}

const CreateModal = React.memo((props: ICreateModalProps) => {
  const { visible, onOk, onCancel, type, data } = props;
  const [principal, setPrincipal] = useState([]);
  const [modalForm] = Form.useForm();
  const { TextArea } = Input;

  const handleOk = async () => {
    try {
      const values = await modalForm.validateFields();
      // modalForm.resetFields();
      await onOk(values);
      modalForm.resetFields();
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    modalForm.setFieldsValue({ ...data });
  }, [modalForm, data]);

  const handleCancel = () => {
    modalForm.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={type === 'create' ? '新建子应用' : '编辑子应用'}
      open={visible}
      onCancel={handleCancel}
      onOk={debounce(handleOk, 500)}
      maskClosable={false}
      destroyOnClose
      forceRender
      okText="确定"
      cancelText="取消"
    >
      <Form {...layout} form={modalForm}>
        <Form.Item
          name="subName"
          label="子应用名称"
          rules={[
            { required: true, message: '请输入子应用名称' },
            () => ({
              validator(_, value) {
                if (value === '' || /^[A-Za-z0-9_-]+$/.test(value)) {
                  return Promise.resolve();
                } else {
                  return Promise.reject(new Error('子应用名称只支持字母数字中划线与下划线'));
                }
              },
            }),
          ]}
          // rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input
            disabled={type === 'update'}
            placeholder="请输入子应用名称"
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
            mode="multiple"
            value={principal}
            allowClear
            placeholder="请选择负责人"
            fetchOptions={handlePrincipalSearch}
            onChange={(value) => {
              setPrincipal(value);
            }}
          />
        </Form.Item>
        <Form.Item
          name="subDesc"
          label="子应用描述"
          rules={[{ required: true, message: '请输入子应用描述' }]}
        >
          <TextArea rows={3} placeholder="请输入子应用描述" allowClear autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  );
});

function SubList() {
  const history = useHistory();
  const [form] = Form.useForm();
  const [data, setData] = useState<ISubApp[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [comfirmModalVisible, setComfirmModalVisible] = useState(false);
  const [modalData, setModalData] = useState<ISubApp>(Object.create(null));
  const [type, setType] = useState('create');
  const [subCreator, setSubCreator] = useState(); // 创建人
  const [tabKey, setTabKey] = useState('my');
  const [correlationData, setCorrelationData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const pagination = useMemo(() => {
    return {
      current: pageNo,
      total,
      pageSize,
      showSizeChanger: false,
      showTotal: (num: number) => {
        return `共 ${num} 条`;
      },
    };
  }, [pageNo, total]);

  const getSubAppList = useCallback(async () => {
    try {
      setLoading(true);
      const params = form.getFieldsValue();
      const subAppName = params.subName?.trim();
      const subAppDesc = params.subDesc?.trim(); // 子应用描述
      const subAppId = params.subId?.trim();
      const subAppCreator = params.subCreator?.value; // 子应用创建人
      const res = await api_getSubAppList({
        pageNo,
        pageSize,
        subAppName,
        subAppDesc,
        subAppId,
        subAppCreator,
      });
      const { list, total } = res?.data || {};
      setData(list);
      setTotal(total);
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    } finally {
      setLoading(false);
    }
  }, [form, pageNo]);

  const getCorrelationSubAppList = useCallback(async () => {
    try {
      setLoading(true);
      const params = form.getFieldsValue();
      const subAppName = params.subName?.trim();
      const subAppId = params.subId?.trim();
      const subAppDesc = params.subDesc?.trim();
      const subAppCreator = params.subCreator?.value;
      const res = await api_getCorrelationSubAppList({
        pageNo,
        pageSize,
        subAppName,
        subAppDesc,
        subAppCreator,
        subAppId,
      });
      const { list, total } = res?.data || {};
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
      getCorrelationSubAppList();
    } else {
      getSubAppList();
    }
  }, [getCorrelationSubAppList, getSubAppList, tabKey]);

  useEffect(() => {
    setPageNo(1);
  }, [tabKey]);

  const handleReset = useCallback(() => {
    form.resetFields();
    getSubAppList();
    getCorrelationSubAppList();
  }, [form, getSubAppList, getCorrelationSubAppList]);

  const handleSearch = useCallback(() => {
    setPageNo(1);
    if (tabKey === 'my') {
      getCorrelationSubAppList();
    } else {
      getSubAppList();
    }
  }, [tabKey, getCorrelationSubAppList, getSubAppList]);

  const handleCreateModalOk = async (params: ICreateSubAppParams) => {
    try {
      if (type === 'create') {
        await api_createSubApp(params);
      } else {
        await api_updateSubApp({ ...params, subId: modalData.id });
      }
      if (tabKey === 'my') {
        getCorrelationSubAppList();
      } else {
        getSubAppList();
      }
      setCreateModalVisible(false);
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  };

  const handleConfirmOK = (params: ISubApp) => {
    const left = data.filter((data) => data.id !== params.id);
    setData(left);
  };

  const handleCreateModalCancel = useCallback(() => {
    setCreateModalVisible(false);
    setModalData(Object.create(null));
  }, [setCreateModalVisible, setModalData]);

  const handleConfirmModalCancel = () => {
    setComfirmModalVisible(false);
    setModalData(Object.create(null));
  };
  // 点击子应用列表的编辑
  const handleEdit = useCallback(
    (data: ISubApp) => {
      setType('update');
      setCreateModalVisible(true);
      setModalData(data);
    },
    [setType, setCreateModalVisible, setModalData],
  );

  // 点击子应用的历史版本
  const handleHistory = (data: ISubApp) => {
    const principal = data.principal
      ? data?.principal?.map?.((item) => item.label)?.join?.(',')
      : '无';
    history.push(`/app/sub/history?id=${data.id}&subName=${data.subName}&principal=${principal}`);
  };

  const handleOffline = (data: ISubApp) => {
    setType('offline');
    setComfirmModalVisible(true);
    setModalData(data);
  };

  const handleCreate = useCallback(() => {
    setType('create');
    setCreateModalVisible(true);
  }, [setType, setCreateModalVisible]);

  const handleTableChange: TableProps<ISubApp>['onChange'] = (e) => {
    // setPageNo(e.current);
    // getSubAppList();
  };

  const columns: ColumnType<ISubApp>[] = [
    {
      title: '子应用ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
    },
    {
      title: '子应用名称',
      dataIndex: 'subName',
      key: 'subName',
      align: 'center',
      render: (subName) => {
        return (
          <>
            <span>{subName}</span>
            <CopyToClipboard text={subName} onCopy={() => message.success('复制成功')}>
              <Button type="link" icon={<CopyOutlined />} />
            </CopyToClipboard>
          </>
        );
      },
    },
    {
      title: '子应用描述',
      dataIndex: 'subDesc',
      key: 'subDesc',
      align: 'center',
    },
    {
      title: '负责人',
      dataIndex: 'principal',
      key: 'principal',
      align: 'center',
      render: (principal: IPrincipal[]) => {
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
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      align: 'center',
      render: (creator) => {
        return <span>{creator ? creator : '-'}</span>;
      },
    },
    {
      title: '最新更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
      render: (updatedAt) => {
        return <span>{dayjs(updatedAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: '操作',
      key: 'operate',
      align: 'center',
      render: (_, record) => {
        return (
          <>
            <Button onClick={() => handleOffline(record)} type="link" disabled>
              删除
            </Button>
            <Button onClick={() => handleEdit(record)} type="link">
              编辑
            </Button>
            <Button onClick={() => handleHistory(record)} type="link">
              历史版本
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Form className={styles.searchForm} layout="inline" form={form} onFinish={handleSearch}>
        <div style={{ flex: 1, display: 'flex' }}>
          {/* <Form.Item name="subId" label="应用ID">
            <Input placeholder="请输入应用ID" allowClear autoComplete="off" />
          </Form.Item> */}
          <Form.Item name="subName" label="子应用名称">
            <Input placeholder="请输入子应用名称" allowClear autoComplete="off" />
          </Form.Item>
          <Form.Item name="subDesc" label="子应用描述">
            <Input placeholder="请输入子应用描述" allowClear autoComplete="off" />
          </Form.Item>
          <Form.Item name="subCreator" label="创建人">
            <DebounceSelect
              value={subCreator}
              allowClear
              showSearch
              placeholder="请选择创建人"
              fetchOptions={handlePrincipalSearch}
              style={{ width: '220px' }}
              onChange={(value) => {
                setSubCreator(value);
              }}
            />
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
        <div></div>
      </Form>
      <Tabs
        tabBarExtraContent={{
          right: (
            <div className={styles.operateWrap}>
              <Button onClick={handleCreate} type="primary">
                新建子应用
              </Button>
            </div>
          ),
        }}
        defaultActiveKey={tabKey}
        onChange={(key) => setTabKey(key)}
        items={[
          {
            key: 'all',
            label: '全部应用',
            children: (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
              />
            ),
          },
          {
            key: 'my',
            label: '与我相关',
            children: (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={correlationData}
                pagination={pagination}
                onChange={handleTableChange}
                loading={loading}
              />
            ),
          },
        ]}
      ></Tabs>
      <CreateModal
        visible={createModalVisible}
        onCancel={handleCreateModalCancel}
        onOk={handleCreateModalOk}
        data={modalData}
        type={type}
      ></CreateModal>
      <ConfirmModal
        visible={comfirmModalVisible}
        onOK={handleConfirmOK}
        onCancel={handleConfirmModalCancel}
        data={modalData}
      ></ConfirmModal>
    </div>
  );
}

export default React.memo(SubList);
