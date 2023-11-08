import React from 'react';
import { AppstoreOutlined, FileSearchOutlined, ContainerOutlined } from '@ant-design/icons';
const menus = [
  {
    key: '/app',
    title: '应用管理',
    icon: <AppstoreOutlined />,
    subs: [
      {
        key: '/app/main/list',
        title: '主应用管理',
      },
      {
        key: '/app/sub/list',
        title: '子应用管理',
      },
    ],
  },
  {
    key: '/version/list',
    title: '应用版本',
    icon: <ContainerOutlined />,
  },
  {
    key: '/log/list',
    title: '操作日志',
    icon: <FileSearchOutlined />,
  },
];
export default menus;
