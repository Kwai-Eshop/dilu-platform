import React, { useEffect, useRef, useState } from 'react';
import { Space, Form, Input, Button, Table, message, Tooltip } from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';
import { api_getSubAppVersions, api_queryStaffInfoByStr } from '@/Apis';
import dayjs from 'dayjs';
import type {
  IGetSubAppVersionsParams,
  IGetSubAppVersionsResponse,
  ISubAppVersionModel,
} from '@/Common/interface';
import type { ColumnsType, TableProps } from 'antd/es/table';

interface IProps {
  env: string;
}

interface IFormValues {
  buildBranch: string;
  commitId: string;
  buildOwner: {
    label: string;
    value: string;
    key: string;
  };
}

const pageSize = 10;

function Query({ env }: IProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setData] = useState<IGetSubAppVersionsResponse['list']>([]);
  const pageNo = useRef(1);
  const [total, setTotal] = useState(0);
  const { search } = useLocation();
  const subAppId = qs?.parse(search)?.id as string;
  const [buildOwner, setBuildOwner] = useState(); // 构建人

  // 获取构建人数据
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

  const getTableList = async (params?: IFormValues) => {
    const mergedParams: IGetSubAppVersionsParams = {
      subAppId,
      envKey: env,
      pageNo: pageNo.current,
      pageSize,
      ...params,
      buildOwner: params?.buildOwner?.value, // 构建人参数
    };
    try {
      setLoading(true);
      const res = await api_getSubAppVersions(mergedParams);
      setData(res.data?.list || []);
      setTotal(res.data?.total);
    } catch (e) {
      setLoading(false);
      message.error('网络异常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pageNo.current = 1;
    getTableList();
  }, [env]);

  //  查询重置
  const onReset = () => {
    form.resetFields();
    getTableList();
  };
  //  查询
  const onFinish = (values: IFormValues) => {
    getTableList(values);
  };

  const handleTableChange: TableProps<ISubAppVersionModel>['onChange'] = (pageConfig) => {
    if (pageConfig.current) {
      pageNo.current = pageConfig.current;
      getTableList();
    }
  };

  const columns: ColumnsType<ISubAppVersionModel> = [
    {
      title: 'CommitId',
      key: 'commitId',
      render: (_, record) => record.buildRecord?.commitId,
    },
    {
      width: 200,
      title: '构建分支',
      key: 'buildBranch',
      render: (_, record) => record.buildRecord?.buildBranch,
    },
    {
      width: 120,
      title: '构建人',
      key: 'buildOwner',
      render: (_, record) => record.buildRecord?.builder,
    },
    {
      width: 300,
      title: 'entry',
      dataIndex: 'entry',
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
              {entry.slice(0, 5) + '...' + entry.slice(-20)}
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: '构建时间',
      dataIndex: 'updatedAt',
      render: (updatedAt) => {
        return <span>{dayjs(updatedAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
  ];
  // 翻页
  const pagination = {
    current: pageNo.current,
    defaultCurrent: 1,
    total,
    pageSize,
    showSizeChanger: false,
    showTotal: (num: number) => {
      return `共 ${num} 条`;
    },
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <section>
        <Form layout="inline" form={form} onFinish={onFinish}>
          <Form.Item name="buildBranch" label="构建分支">
            <Input placeholder="请输入构建分支" allowClear autoComplete="off" />
          </Form.Item>
          <Form.Item name="commitId" label="commitId">
            <Input placeholder="请输入commitId" allowClear autoComplete="off" />
          </Form.Item>
          <Form.Item name="buildOwner" label="构建人">
            <DebounceSelect
              value={buildOwner}
              allowClear
              showSearch
              placeholder="请选择构建人"
              fetchOptions={handleBuildOwnerSearch}
              style={{ width: '220px' }}
              onChange={(value) => {
                setBuildOwner(value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button htmlType="button" onClick={onReset} style={{ marginLeft: '10px' }}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </section>
      <Table
        loading={loading}
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Space>
  );
}

export default Query;
