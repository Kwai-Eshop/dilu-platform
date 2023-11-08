import React from 'react';
import { Layout } from 'antd';
import styles from './index.module.less';

const { Footer } = Layout;

export default () => (
  <Footer className={styles.footer}>微前端应用管理平台 &copy;2021 Created By KwaiShop</Footer>
);
