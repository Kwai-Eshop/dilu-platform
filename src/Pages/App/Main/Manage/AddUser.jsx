import React, { useState, useRef } from 'react';
import { Form, Modal } from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import { api_queryStaffInfoByStr } from '@/Apis';
import { debounce } from 'lodash-es';

const AddUser = (props) => {
  const { visible, onOk, onCancel } = props;
  const [modalForm] = Form.useForm();
  const usersRef = useRef(new Map());
  const [value, setValue] = useState({});
  const handleOk = async () => {
    try {
      const values = await modalForm.validateFields();
      const us = values.user?.map?.((v) => usersRef?.current?.get?.(v.value)?.username);
      onOk(us);
      modalForm.resetFields();
    } catch (e) {
      //
    }
  };

  const handleCancel = () => {
    modalForm.resetFields();
    onCancel();
  };

  const handleSearch = async (e) => {
    try {
      const { data } = await api_queryStaffInfoByStr({ nameStr: e });
      if (data) {
        data.forEach((item) => {
          usersRef.current?.set?.(item.username, item);
        });
      }
      const list =
        data?.map((item) => ({
          label: `${item.name}${item.username}`,
          value: item.username,
          photo: item.photo,
          data: item,
        })) || [];
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  return (
    <Modal
      title={'添加管理员'}
      open={visible}
      onCancel={handleCancel}
      onOk={debounce(handleOk, 500)}
      maskClosable={false}
      destroyOnClose
      forceRender
      okText="确定"
      cancelText="取消"
    >
      <Form form={modalForm}>
        <Form.Item name="user" label="用户" rules={[{ required: true, message: '请选择用户' }]}>
          <DebounceSelect
            mode="multiple"
            value={value}
            allowClear
            placeholder="请选择"
            fetchOptions={handleSearch}
            onChange={setValue}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUser;
