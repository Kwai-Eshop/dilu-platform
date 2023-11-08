import React, { useState } from 'react';
import { Input, message, Modal } from 'antd';
import { debounce } from 'lodash';
import { api_deleteSubApp } from '@/Apis';
import type { ISubApp } from '@/Common/interface';

interface IProps {
  visible: boolean;
  onOK: (values: any) => void;
  onCancel: () => void;
  data: ISubApp | any;
}

const ConfirmModal = (props: IProps) => {
  const { visible, onOK, onCancel, data } = props;
  const [confirmValue, setValue] = useState('');
  const handleOk = async () => {
    try {
      await api_deleteSubApp({
        id: data.id,
      });
      message.success('成功删除子应用' + data.name);
      onOK(data);
      setValue('');
      onCancel();
    } catch (e) {
      message.error(e.msg);
    }
  };

  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };
  return (
    <Modal
      title={'下线子应用'}
      open={visible}
      onCancel={handleCancel}
      onOk={debounce(handleOk, 500)}
      okButtonProps={{ disabled: confirmValue.trim() !== data?.name }}
      maskClosable={false}
      destroyOnClose
      forceRender
      okText="确定"
      cancelText="取消"
    >
      {data ? (
        <>
          <p>下线子应用 {data.name} 前需先解除与主应用的关联</p>
          <p>我已解除全部关联，确认下线</p>
          <Input
            value={confirmValue}
            onChange={handleChange}
            placeholder="请输入子应用名称，以确认"
          ></Input>
        </>
      ) : null}
    </Modal>
  );
};

export default ConfirmModal;
