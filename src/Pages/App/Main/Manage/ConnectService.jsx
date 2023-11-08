import React, { useState } from 'react';
import { Space, Form, Modal, Button, message } from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import { api_getServiceTree, api_setConnectService } from '@/Apis';
import styles from './index.module.less';

function ConnectService(props) {
  const [service, setService] = useState({});
  const [defaultOptions, setDefaultOptions] = useState([]);
  const [modalForm] = Form.useForm();

  const handleSearch = async (e) => {
    try {
      const res = await api_getServiceTree({ serviceName: e });
      const list =
        res?.data?.nodes?.map((item) => ({
          label: item.name,
          value: item.id,
          path: item.path,
        })) || [];
      setDefaultOptions(list);
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const setConnectService = async (params) => {
    try {
      await api_setConnectService(params);
      message.success('关联成功');
      props?.onConnectSuccess();
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  };

  const onFinish = (values) => {
    const { mainName, objectId } = props.appInfo || {};
    const { label, value } = values.serviceName || {};
    const path = defaultOptions[defaultOptions.findIndex((item) => item.value === value)]?.path;
    Modal.confirm({
      icon: null,
      content: `确定将主应用${mainName}关联到${label}节点？关联后可在主应用管理中解除关联`,
      onOk: () => {
        setConnectService({
          mainId: objectId,
          nodeId: value,
          nodeName: label,
          nodePath: path,
        });
      },
    });
  };

  return (
    <div className={styles.connectService}>
      <Space direction="vertical">
        <h3>当前主应用未关联研发云服务节点</h3>
        <h5>关联服务节点旨在使用研发云统一上线审批策略</h5>
        <Form form={modalForm} onFinish={onFinish}>
          <Form.Item name="serviceName" rules={[{ required: true, message: '请选择服务节点' }]}>
            <DebounceSelect
              showSearch={true}
              value={service}
              style={{ width: 250 }}
              allowClear
              placeholder="请输入主应用的研发云节点名称"
              fetchOptions={handleSearch}
              onChange={(value) => {
                setService(value);
              }}
              // onFocus={handleFocus}
              options={defaultOptions}
            />
          </Form.Item>
          <Form.Item>
            <Button disabled={!props.isDeveloper} type="primary" htmlType="submit">
              确认关联
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
}

export default ConnectService;
