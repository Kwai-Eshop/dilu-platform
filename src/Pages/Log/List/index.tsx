import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, message, Form, Button, Tag, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import DebounceSelect from '@/Components/DebounceSelect';
import { api_getLogList, api_queryStaffInfoByStr } from '@/Apis';
import styles from './index.module.less';
import { LOG_OPERATE_TYPE } from '@/Constants/index';
import type { ColumnType, TableProps } from 'antd/es/table';
import type { ILogInfo } from '@/Common/interface';

function LogList() {
  const [form] = Form.useForm();
  const [data, setData] = useState<ILogInfo[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [operator, setOperator] = useState(); // 操作人

  const pagination = useMemo(() => {
    return {
      current: pageNo,
      total,
      pageSize,
      showTotal: (num: number) => {
        return `共 ${num} 条`;
      },
    };
  }, [pageNo, total, pageSize]);

  const columns: ColumnType<ILogInfo>[] = useMemo(() => {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
      },
      {
        title: '操作名称',
        dataIndex: 'interfaceDesc',
        key: 'interfaceDesc',
        align: 'center',
      },
      {
        title: '操作记录',
        dataIndex: 'customRecord',
        key: 'customRecord',
        align: 'center',
        render: (_, record) => {
          if (!record.customRecord || !record.customRecord?.length) return '-';
          return (
            <div>{record.customRecord?.map?.((item, index) => <div key={index}>{item}</div>)}</div>
          );
        },
      },
      {
        title: '操作人',
        dataIndex: 'operateUser',
        key: 'operateUser',
        align: 'center',
        render: (v) => v || '-',
      },
      {
        title: '操作类型',
        key: 'operateType',
        align: 'center',
        render: (_, record) => {
          const item = LOG_OPERATE_TYPE.find((e) => String(e.value) === String(record.operateType));
          if (item) return <Tag color={item.color}>{item.label}</Tag>;
          return '-';
        },
      },
      {
        title: '操作时间',
        key: 'operateTime',
        align: 'center',
        render: (_, record) => {
          return <span>{dayjs(+record.operateTime)?.format?.('YYYY-MM-DD HH:mm:ss')}</span>;
        },
      },
    ];
  }, []);
  // 获取操作人数据
  const handleOperatorSearch = async (nameStr: string) => {
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
  const getLogList = useCallback(
    async (pageNum = 1) => {
      try {
        const params = form.getFieldsValue();
        const operatorVal = params.operator?.value; // 操作人
        let [startTime, endTime] = params.timer || [];
        startTime = startTime ? startTime.valueOf() : undefined;
        endTime = endTime ? endTime.valueOf() : undefined;
        const res = await api_getLogList({
          pageNo: pageNum,
          pageSize,
          operator: operatorVal,
          startTime,
          endTime,
        });
        const { list, total: totalCount } = res?.data || {};
        setData(list);
        setTotal(totalCount);
        setPageNo(pageNum);
      } catch (err) {
        console.error(err);
        message.error(err?.message || '请求失败，请稍后再试~');
      }
    },
    [form, pageSize],
  );
  useEffect(() => {
    getLogList(1);
  }, [getLogList]);

  const handleReset = useCallback(() => {
    form.resetFields();
    getLogList(1);
  }, [form, getLogList]);

  const handleSearch = useCallback(() => {
    getLogList(1);
  }, [getLogList]);

  const handleTableChange: TableProps<ILogInfo>['onChange'] = (pageConfig) => {
    const { current, pageSize: currentPageSize } = pageConfig;
    if (currentPageSize !== pageSize) {
      setPageSize(currentPageSize || 10);
    } else {
      getLogList(current);
    }
  };

  return (
    <div className={styles.container}>
      <Form className={styles.searchForm} layout="inline" form={form} onFinish={handleSearch}>
        <div style={{ flex: 1, display: 'flex' }}>
          <Form.Item key="operator" name="operator" label="操作人">
            {/* <Input placeholder="请输入操作人" allowClear autoComplete="off" /> */}
            <DebounceSelect
              value={operator}
              allowClear
              showSearch
              placeholder="请选择操作人"
              fetchOptions={handleOperatorSearch}
              style={{ width: '220px' }}
              onChange={(value) => {
                setOperator(value);
              }}
            />
          </Form.Item>
          <Form.Item key="timer" name="timer" label="操作时间(默认近7天)">
            <DatePicker.RangePicker showTime />
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

export default React.memo(LogList);
