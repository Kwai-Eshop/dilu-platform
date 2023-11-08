import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import DebounceSelect from '@/Components/DebounceSelect';
import { useBiz } from '@/Hooks/biz';

interface IProps {
  value?: number;
  onChange?: (val: number) => void;
}

const BizSelect = ({ value, onChange }: IProps) => {
  const [bizOptions, setBizOptions] = useState<
    {
      value: number;
      label: string;
    }[]
  >([]);
  const biz = useBiz();
  const handleBizSearch = async () => {
    try {
      const list = biz.map((item) => ({
        label: item.title,
        value: item.id,
      }));
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const updateBizOptions = async () => {
    try {
      const list = await handleBizSearch();
      setBizOptions(list);
    } catch (err) {
      message.error(err?.message || '请求失败，请稍后再试~');
    }
  };

  const handleBizFocus = async () => {
    if (!bizOptions.length) {
      await updateBizOptions();
    }
  };

  useEffect(() => {
    updateBizOptions();
  }, [biz]);

  return (
    <DebounceSelect
      showSearch={true}
      allowClear
      value={value}
      onChange={(val) => onChange && onChange(val && val.value)}
      placeholder="请选择业务线"
      onFocus={handleBizFocus}
      options={bizOptions}
    />
  );
};

export default BizSelect;
