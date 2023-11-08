import React from 'react';
import { Button, Checkbox, Form, Input, Space, message } from 'antd';

import styles from './index.module.less';
import { apiLogin, apiRegister, apiLogout } from '@/Apis/user';

export default function Login() {
  async function onFinish(params: any) {
    try {
      const res: any = await apiLogin(params);
      if (res?.code === 0) {
        window.location.pathname = '/';
      }
    } catch (err) {}
  }
  function onFinishFailed() {}

  async function onClickLogout() {
    try {
      const res: any = await apiLogout();
      console.log('res', res);
      if (res?.code === 0) {
        window.location.reload();
      } else {
        throw new Error(res?.msg);
      }
    } catch (err) {
      console.log('err', err);
      message.error(err.msg || err.message);
    }
  }

  return (
    <article className={styles.login}>
      <Form
        name="login"
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="请输入用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="请输入密码"
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>

        {/* <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item> */}

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Space>
            <Button href="/register">注册</Button>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
            <Button onClick={onClickLogout}>登出</Button>
          </Space>
        </Form.Item>
      </Form>
    </article>
  );
}
