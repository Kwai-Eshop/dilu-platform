import React, { useState } from 'react';
import { Slider } from 'antd';
export default (props) => {
  const [value, setValue] = useState(props.value || 0);
  const onChange = (value) => {
    console.log(value);
    props.onChange && props.onChange(value);
    setValue(value);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Slider onChange={onChange} value={value} style={{ width: '85%' }}></Slider>
      <span style={{ lineHeight: '32px' }}>{value}</span>
    </div>
  );
};
