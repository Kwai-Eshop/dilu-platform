import React from 'react';
import PropTypes from 'prop-types';
import ScrollBar from './ScrollBar';
// import AppMenus from './AppMenus.jsx';
import Styles from './index.module.less';
import { NavLink, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import {
  AppstoreOutlined,
  ContainerOutlined,
  FileSearchOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
const { Sider } = Layout;
export const siderConfig = [
  {
    path: '/app/main/list',
    activeRule: '/app/main',
    icon: AppstoreOutlined,
    text: '主应用',
  },
  {
    path: '/app/sub/list',
    activeRule: '/app/sub',
    icon: ClusterOutlined,
    text: '子应用',
  },
  {
    path: '/version/list',
    activeRule: '/version',
    icon: ContainerOutlined,
    text: '应用版本',
  },
  {
    path: '/log/list',
    activeRule: '/log',
    icon: FileSearchOutlined,
    text: '操作日志',
  },
];

const AppAside = (props) => {
  const { menuToggle } = props;

  const location = useLocation();
  return (
    <Sider theme="light" collapsed={menuToggle} className={Styles['layout-sider']} width={80}>
      <ScrollBar>
        {/* <AppMenus menus={menus} /> */}
        {siderConfig.map((sider, index) => (
          <NavLink
            to={sider.path}
            exact
            className={Styles['layout-sider-item']}
            key={`${index}-${sider.path}`}
            activeStyle={{ color: '#0075ff' }}
            isActive={() => {
              if (location?.pathname?.startsWith(sider.activeRule)) {
                return true;
              }
              return false;
            }}
          >
            <sider.icon />
            {/* <img src={current === index ? sider.activeIcon : sider.icon} className={Styles["layout-sider-icon"]} /> */}
            <div className={Styles['layout-sider-text']}>{sider.text}</div>
          </NavLink>
        ))}
      </ScrollBar>
    </Sider>
  );
};

AppAside.propTypes = {
  menuToggle: PropTypes.bool,
  menus: PropTypes.array?.isRequired,
};

export default AppAside;
