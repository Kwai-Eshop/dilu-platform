import React, { useState, useEffect, useCallback } from 'react';
import { Form, Switch, InputNumber, Select } from 'antd';
import CustomSlider from './CustomSlider';
function Index(props) {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});
  const FormConfig = [
    {
      label: '开启放量',
      name: 'needGray',
      type: 'switch',
      valuePropName: 'checked',
    },
    {
      label: '放量百分比',
      name: 'grayPersentage',
      type: 'slider',
      dependence: [{ key: 'needGray', value: true }],
    },
    {
      label: '白名单',
      extra: {
        placeholder: '输入一个之后回车确认',
        mode: 'tags',
        open: false,
      },
      name: 'accessList',
      type: 'select',
      dependence: [{ key: 'needGray', value: true }],
    },
  ];

  const getComponent = useCallback(
    (type, extra = {}) =>
      ({
        number: <InputNumber {...extra} style={{ width: '100%' }} />,
        slider: <CustomSlider {...extra}></CustomSlider>,
        select: <Select {...extra} />,
        switch: <Switch {...extra} />,
      })[type],
    [formData],
  );

  const onValuesChange = (target, allFields) => {
    setFormData(allFields);
    props.onChange && props.onChange(allFields);
  };

  const renderFormItem = (item) => (
    <Form.Item
      label={item.label}
      name={item.name}
      key={item.label}
      labelCol={{ span: 5 }}
      valuePropName={item.valuePropName}
      rules={item.rules}
    >
      {getComponent(item.type, item.extra || {})}
    </Form.Item>
  );

  useEffect(() => {
    if (props.initValue?.needGray) {
      form.setFieldsValue(props.initValue);
      setFormData(props.initValue);
    }
  }, [props.initValue?.needGray]);

  return (
    <>
      <Form form={form} onValuesChange={onValuesChange}>
        {FormConfig.map((item) => {
          if (item?.dependence?.length) {
            const targetValue = formData;
            const shouldShowComponent = item.dependence?.find?.(
              (item) => targetValue[item.key] === item.value,
            );
            if (!shouldShowComponent) {
              return null;
            }
          }
          return renderFormItem(item);
        })}
      </Form>
      <p>使用说明：</p>
      <p>1，不开启放量默认全量发布</p>
      <p>2，白名单添加输入之后userId/userName之后回车确认，不支持特殊字符</p>
      <p>3, 放量百分比为100时，则为全量发布，无法再设置白名单与放量比</p>
    </>
  );
}
export default Index;
