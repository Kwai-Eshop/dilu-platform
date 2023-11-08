import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, message, Form, Input, Button, Select, Space } from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import dayjs from 'dayjs';
import { api_getSubAppVersions, api_queryStaffInfoByStr } from '@/Apis';
import styles from './index.module.less';
import type { IGetSubAppVersionsResponse } from '@/Common/interface';
import type { ColumnType, TableProps } from 'antd/es/table';
import type { ISubAppVersionModel } from '@/Common/interface';

const pageSize = 10;

interface IFormValues {
  subAppName: string;
  buildOwner: {
    value: any;
    label: string;
  };
  versionType: string; // 版本池 prod | prt | test
}

function VersionList() {
  const [form] = Form.useForm();
  const [data, setData] = useState<IGetSubAppVersionsResponse['list']>([]);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [buildOwner, setBuildOwner] = useState(); // 构建人
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
  const { Option } = Select;
  const columns: ColumnType<ISubAppVersionModel>[] = useMemo(() => {
    return [
      {
        title: '应用ID',
        key: 'subAppId',
        render: (_, record) => {
          return <span>{record.subApp?.id}</span>;
        },
        align: 'center',
      },
      {
        title: '应用名称',
        key: 'subAppName',
        align: 'center',
        render: (_, record) => {
          return <span>{record.subApp?.subName}</span>;
        },
      },
      {
        title: 'Commit ID',
        key: 'commitId',
        align: 'center',
        render: (_, record) => <span>{record.buildRecord?.commitId}</span>,
      },
      {
        title: '构建分支',
        key: 'buildBranch',
        align: 'center',
        render: (_, record) => <span>{record.buildRecord?.buildBranch}</span>,
      },
      {
        title: '构建人',
        key: 'builder',
        align: 'center',
        render: (_, record) => <span>{record.buildRecord?.builder}</span>,
      },
      {
        title: 'entry',
        key: 'entry',
        align: 'center',
        width: 250,
        render: (_, record) => {
          return (
            <a href={record.entry} target="_blank" rel="noreferrer">
              {record.entry}
            </a>
          );
        },
      },
      {
        title: '版本发布时间',
        key: 'updatedAt',
        align: 'center',
        render: (_, record) => {
          return <span>{dayjs(record.updatedAt)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
    ];
  }, []);

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
  const getVersionList = useCallback(
    async (pageNo = 1) => {
      try {
        const params: IFormValues = form.getFieldsValue();
        const subAppName = params.subAppName?.trim();
        const versionType = params.versionType?.trim();
        const buildOwner = params.buildOwner?.value; // 构建人
        const res = await api_getSubAppVersions({
          pageNo,
          pageSize,
          buildOwner,
          envKey: versionType,
          subAppName,
        });
        const { list, total } = res?.data || {};
        setData(list);
        setTotal(total);
        setPageNo(pageNo);
      } catch (err) {
        console.error(err);
        message.error(err?.message || '请求失败，请稍后再试~');
      }
    },
    [form],
  );
  useEffect(() => {
    getVersionList(1);
  }, [getVersionList]);

  const handleReset = useCallback(() => {
    form.resetFields();
    getVersionList(1);
  }, [form, getVersionList]);

  const handleSearch = useCallback(() => {
    getVersionList(1);
  }, [getVersionList]);

  const handleTableChange: TableProps<ISubAppVersionModel>['onChange'] = (pagination) => {
    const { current } = pagination;
    getVersionList(current);
  };

  return (
    <div className={styles.container}>
      <Form className={styles.searchForm} layout="inline" form={form} onFinish={handleSearch}>
        <div style={{ flex: 1, display: 'flex' }}>
          <Form.Item name="subAppName" label="应用名称">
            <Input placeholder="请输入应用名称" allowClear autoComplete="off" />
          </Form.Item>
          {/* <Form.Item name="appId" label="应用ID">
            <Input placeholder="请输入应用ID" allowClear autoComplete="off" />
          </Form.Item> */}
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
          <Form.Item name="versionType" label="版本池" initialValue={'prod'}>
            <Select style={{ width: 135 }} placeholder={'请选择'}>
              <Option value="prod">线上</Option>
              <Option value="prt">PRT</Option>
              <Option value="test">测试</Option>
            </Select>
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
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
}

export default React.memo(VersionList);
