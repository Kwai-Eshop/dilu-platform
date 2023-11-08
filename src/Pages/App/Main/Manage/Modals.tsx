import React, { useState, useEffect } from 'react';
import { message, Modal, Form, Input, Radio, Row, Col } from 'antd';
import { BASE_ENV } from '@/Constants';
import { api_getSubAppList } from '@/Apis';
import DebounceSelect from '@/Components/Select';
import JSONInput from '@/Components/JSONInput';
import { debounce } from 'lodash';
import type { IConnectSubAppModel, ICreateConnectSubAppParams, ISubApp } from '@/Common/interface';
import { jsonParse } from 'safe-json-parse-and-stringify';
const { TextArea } = Input;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export interface IConnectSubModalFormValues {
  subApp: {
    label: string;
    key: string;
    value: string;
  };
  activeRule: string;
  container: string;
  extras: any;
  type: ICreateConnectSubAppParams['type'];
}

interface IConnectSubModalProps {
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
}

export const ConnectSubModal = React.memo((props: IConnectSubModalProps) => {
  const { visible, onCancel, onOk } = props;
  const [modalForm] = Form.useForm();
  const [subApp, setSubApp] = useState<ISubApp>(Object.create(null));
  const [defaultOptions, setDefaultOptions] = useState<
    {
      value: any;
      label: string;
    }[]
  >([]);
  const [appType, setAppType] = useState('route');
  const handleOk = async () => {
    try {
      const values = await modalForm.validateFields();
      onOk({ ...values, type: appType });
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubAppSearch = async (subAppName: string) => {
    try {
      const res = await api_getSubAppList({
        subAppName,
        pageNo: 1,
        pageSize: 1000000,
      });
      const list =
        res?.data?.list?.map((item) => ({
          label: item.subName,
          value: item.id,
        })) || [];
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const handleFocus = async () => {
    if (!subApp.subName) {
      try {
        const list = await handleSubAppSearch(subApp.subName);
        setDefaultOptions(list);
      } catch (err) {
        message.error(err?.message || '请求失败，请稍后再试~');
      }
    }
  };

  const renderForm = () => {
    if (appType === 'route') {
      return (
        <Form {...layout} form={modalForm}>
          <Form.Item
            name="subApp"
            label="子应用选择"
            rules={[{ required: true, message: '请选择子应用' }]}
          >
            <DebounceSelect
              showSearch={true}
              value={subApp}
              allowClear
              placeholder="请选择"
              onSearch={handleSubAppSearch}
              onChange={(value) => {
                console.log('DebounceSelect', value);
                setSubApp(value);
              }}
              onFocus={handleFocus}
              options={defaultOptions}
            />
          </Form.Item>
          <Form.Item
            name="activeRule"
            label="访问规则"
            rules={[{ required: true, message: '请输入访问规则' }]}
          >
            <TextArea rows={3} placeholder="请输入" />
          </Form.Item>
          <Form.Item name="container" label="容器ID">
            <Input placeholder="非必填，默认#micro-container" />
          </Form.Item>
          <Form.Item
            name="extras"
            label="额外属性"
            rules={[
              {
                validator: async (rule, value) => {
                  if (value?.isError) {
                    throw new Error(value.reason);
                  }
                },
              },
            ]}
          >
            <JSONInput />
          </Form.Item>
        </Form>
      );
    } else if (appType === 'component') {
      return (
        <Form {...layout} form={modalForm}>
          <Form.Item
            name="subApp"
            label="子应用选择"
            rules={[{ required: true, message: '请选择子应用' }]}
          >
            <DebounceSelect
              showSearch={true}
              value={subApp}
              allowClear
              placeholder="请选择"
              onSearch={handleSubAppSearch}
              onChange={(value) => {
                setSubApp(value);
              }}
              onFocus={handleFocus}
              options={defaultOptions}
            />
          </Form.Item>
        </Form>
      );
    }
    return null;
  };

  useEffect(() => {
    if (!visible) {
      modalForm.resetFields();
    }
  }, [visible, modalForm]);

  return (
    <Modal
      title={'关联子应用'}
      open={visible}
      onCancel={onCancel}
      onOk={debounce(handleOk, 500)}
      maskClosable={false}
      destroyOnClose
      forceRender
      okText="确定"
      cancelText="取消"
    >
      <Row style={{ marginTop: '10px' }}>
        <Col span={6} style={{ textAlign: 'right', padding: '0 3px 0 0' }}>
          子应用类型：
        </Col>
        <Col span={18}>
          <Radio.Group
            style={{ margin: '0 0 20px 0', paddingLeft: '0' }}
            onChange={(e) => {
              setAppType(e.target.value);
            }}
            value={appType}
          >
            <Radio value={'route'}>路由级</Radio>
            <Radio value={'component'}>组件级</Radio>
          </Radio.Group>
        </Col>
      </Row>

      {renderForm()}
    </Modal>
  );
});

export interface IConfigSubModalValues {
  subId: string;
  subName: string;
  type: 'component' | 'route';
  activeRule: string;
  extras: string;
  container: string;
}

interface IConfigSubModalProps {
  visible: boolean;
  onOk: (values: IConfigSubModalValues) => void;
  onCancel: () => void;
  data: IConnectSubAppModel;
}

export const ConfigSubModal = React.memo((props: IConfigSubModalProps) => {
  const { visible, onCancel, onOk, data } = props;
  const [modalForm] = Form.useForm();
  useEffect(() => {
    modalForm.setFieldsValue({
      subId: data.subApp?.id,
      subName: data.subApp?.subName,
      env: data.env?.key,
      activeRule: data.activeRule,
      container: data.container,
      extras: data.extras,
      type: data.appType || 'route',
    });
    console.log('data', data);
  }, [modalForm, data]);

  const handleOk = async () => {
    try {
      const values = await modalForm.validateFields();
      onOk(values);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Modal
      title={'子应用参数配置'}
      open={visible}
      onCancel={onCancel}
      onOk={debounce(handleOk, 500)}
      maskClosable={false}
      destroyOnClose
      forceRender
      okText="确定"
      cancelText="取消"
    >
      <Form {...layout} form={modalForm}>
        <Form.Item name="subId" label="子应用id" hidden>
          <Input disabled bordered={false} />
        </Form.Item>
        <Form.Item name="subName" label="子应用名称">
          <Input disabled bordered={false} />
        </Form.Item>
        <Form.Item name="type" label="子应用类型">
          <Radio.Group>
            <Radio value={'route'}>路由级</Radio>
            <Radio value={'component'}>组件级</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="生效环境">
          <Input value={BASE_ENV[data?.env?.key as string]?.label} disabled bordered={false} />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            return type === 'route' ? (
              <Form.Item
                name="activeRule"
                label="访问规则"
                rules={[{ required: true, message: '请输入访问规则' }]}
              >
                <TextArea rows={3} placeholder="请输入" autoComplete="off" allowClear />
              </Form.Item>
            ) : null;
          }}
        </Form.Item>
        <Form.Item name="container" label="容器ID">
          <Input placeholder="非必填，默认#micro-container" autoComplete="off" allowClear />
        </Form.Item>
        <Form.Item
          name="extras"
          label="额外属性"
          rules={[
            {
              validator: async (rule, value) => {
                if (value?.isError) {
                  throw new Error(value.reason);
                }
              },
            },
          ]}
        >
          <JSONInput />
        </Form.Item>
      </Form>
    </Modal>
  );
});
