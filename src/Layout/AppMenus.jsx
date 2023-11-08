import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';

// 处理 pathname
const getOpenKeys = (string) => {
  let newStr = '',
    newArr = [],
    arr = string?.split('/')?.map?.((i) => '/' + i);
  for (let i = 1; i < arr.length - 1; i++) {
    newStr += arr[i];
    newArr.push(newStr);
  }
  return newArr;
};

const AppMenus = (props) => {
  const [keys, setKeys] = useState({
    openKeys: [],
    selectedKeys: [],
  });

  const { openKeys, selectedKeys } = keys;

  // 页面刷新的时候可以定位到 menu 显示
  useEffect(() => {
    const { pathname } = props.location;
    setKeys((prevState) => {
      return {
        ...prevState,
        selectedKeys: [pathname],
        openKeys: getOpenKeys(pathname),
      };
    });
  }, [props]);

  // 只展开一个 SubMenu
  const onOpenChange = useCallback((changedOpenKeys) => {
    setKeys((prevState) => {
      if (changedOpenKeys.length === 0 || changedOpenKeys.length === 1) {
        return { ...prevState, openKeys: changedOpenKeys };
      }
      const latestOpenKey = changedOpenKeys[changedOpenKeys.length - 1];

      // 这里与定义的路由规则有关
      if (latestOpenKey.includes(changedOpenKeys?.[0])) {
        return { ...prevState, openKeys: changedOpenKeys };
      } else {
        return { ...prevState, openKeys: [latestOpenKey] };
      }
    });
  }, []);

  const renderMenuItem = ({ key, icon, title }) => (
    <Menu.Item key={key}>
      <Link to={key}>
        {icon}
        <span>{title}</span>
      </Link>
    </Menu.Item>
  );

  // 循环遍历数组中的子项 subs ，生成子级 menu
  const renderSubMenu = ({ key, icon, title, subs }) => {
    return (
      <Menu.SubMenu
        key={key}
        title={
          <span>
            {icon}
            <span>{title}</span>
          </span>
        }
      >
        {subs &&
          subs.map((item) => {
            return item.subs && item.subs.length > 0 ? renderSubMenu(item) : renderMenuItem(item);
          })}
      </Menu.SubMenu>
    );
  };

  return (
    <Menu
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onClick={({ key }) => setKeys((prevState) => ({ ...prevState, selectedKeys: [key] }))}
      onOpenChange={onOpenChange}
    >
      {props?.menus?.map((item) => {
        return item.subs && item.subs.length > 0 ? renderSubMenu(item) : renderMenuItem(item);
      })}
    </Menu>
  );
};

AppMenus.propTypes = {
  menus: PropTypes.array?.isRequired,
};

export default withRouter(AppMenus);
