import React, { useState, useMemo } from 'react';
import { Space, Tabs } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Query from './Query';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'query-string';

const { TabPane } = Tabs;

function HistoryVersion() {
  const [tabKey, setTab] = useState('test');
  const history = useHistory();
  const { search } = useLocation();
  const urlObj = useMemo(() => {
    return qs.parse(search);
  }, []);
  // 返回上一页
  const goBack = () => {
    history.go(-1);
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <PageHeader
        title={`子应用名称：${urlObj.subName}`}
        onBack={goBack}
        style={{ padding: 0 }}
        subTitle={
          <>
            <span style={{ marginRight: '10px' }}>子应用ID：{urlObj.id}</span>
            <span style={{ marginRight: '10px' }}>负责人：{urlObj.principal}</span>
          </>
        }
      />
      <Tabs activeKey={tabKey} onChange={setTab}>
        <TabPane tab="测试版本池（staging）" key="test" />
        <TabPane tab="预发版本池" key="prt" />
        <TabPane tab="线上版本池" key="prod" />
      </Tabs>
      <Query env={tabKey} />
    </Space>
  );
}

export default HistoryVersion;
