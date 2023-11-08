import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd/es/select';
import { DefaultOptionType } from 'antd/es/select';
// import debounce from '@/Utils/debounce';

export default (props: SelectProps) => {
  const handleClear = () => {
    if (props?.options) {
      // setOptions([]);
      props?.onClear && props.onClear();
    }
  };
  return (
    <Select
      labelInValue
      filterOption={(input, option) => (option?.label as string)?.includes(input)}
      notFoundContent={null}
      {...props}
      options={props?.options}
      onClear={handleClear}
    />
  );
};
