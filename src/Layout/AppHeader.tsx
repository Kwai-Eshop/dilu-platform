import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Avatar, Popover } from 'antd';
import { useHistory } from 'react-router-dom';
import styles from './index.module.less';
import type { ICheckLoginResponse } from '@/Common/interface';
const { Header } = Layout;

const AppHeader = (props: ICheckLoginResponse) => {
  const { avatar, displayname } = props;
  const history = useHistory();
  // const menus = (
  //   <Menu>
  //     <Menu.ItemGroup title="用户设置">
  //       <Menu.Item>
  //         <NormalHomeLine />
  //         退出登录
  //       </Menu.Item>
  //     </Menu.ItemGroup>
  //   </Menu>
  // );
  // 跳转首页
  const jumpHome = () => {
    history.push('/app/main/list');
  };
  return (
    <Header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo} onClick={jumpHome} />
        <h2 className={styles.title} onClick={jumpHome}>
          的(dí)卢 - 应用管理平台
        </h2>
      </div>
      <div className={styles.right}>
        {/* <Dropdown overlay={menus}> */}
        <div className="ant-dropdown-link">
          <Avatar src={avatar} alt="avatar" style={{ cursor: 'pointer' }} />
          <span className={styles.info}>{displayname}</span>
        </div>
        {/* </Dropdown> */}
      </div>
    </Header>
  );
};

AppHeader.propTypes = {
  avatar: PropTypes.string,
};

export default AppHeader;
