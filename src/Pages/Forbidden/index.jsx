import React from 'react';
import { Result } from 'antd';

export default function () {
  return (
    <Result
      status="403"
      title="403"
      subTitle="对不起，您暂时没有权限访问该系统"
    />
  );
}
