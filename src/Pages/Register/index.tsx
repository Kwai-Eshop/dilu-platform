import React from 'react';
import { Button, Checkbox, Form, Input, Space, message } from 'antd';

import styles from './index.module.less';
import { apiRegister, apiLogout } from '@/Apis/user';

export default function Register() {
  async function onFinish(params: any) {
    try {
      const res: any = await apiRegister(params);
      console.log('res', res);
      if (res?.code === 0) {
        window.location.pathname = '/';
      } else {
        throw new Error(res?.msg);
      }
    } catch (err) {
      console.log('err', err);
      message.error(err.msg || err.message);
    }
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
    <article className={styles.register}>
      <Form
        name="register"
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
          label="请输入昵称"
          name="displayname"
          rules={[{ required: true, message: '请输入昵称' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="请输入邮箱地址"
          name="mail"
          rules={[{ required: true, message: '请输入邮箱地址' }]}
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

        <Form.Item
          label="请再次输入密码"
          name="repeatPassword"
          rules={[{ required: true, message: '请再次输入密码' }]}
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
            <Button type="primary" htmlType="submit">
              注册
            </Button>
            <Button href="/login">登录</Button>
            <Button onClick={onClickLogout}>登出</Button>
          </Space>
        </Form.Item>
      </Form>
    </article>
  );
}
