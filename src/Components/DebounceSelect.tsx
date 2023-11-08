import React from 'react';
import { Select, Spin } from 'antd';
import { debounce } from 'lodash';
import './index.less';

const prefix = 'debounceSelect';
const { Option } = Select;

type IOptions = {
  value: string | number;
  label: string;
  photo?: string;
}[];

interface IProps {
  mode?: 'multiple' | 'tags';
  fetchOptions?: (value: any) => Promise<IOptions>;
  debounceTimeout?: number;
  showSearch?: boolean;
  allowClear?: boolean;
  value: any;
  onChange?: (val: any) => void;
  placeholder: string;
  onFocus?: () => void;
  options?: IOptions;
  onClear?: () => void;
  style?: React.CSSProperties;
}

export default ({ fetchOptions, debounceTimeout = 800, ...props }: IProps) => {
  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState<IOptions>([]);
  const fetchRef = React.useRef(0);
  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value: any) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions &&
        fetchOptions(value)
          .then((newOptions) => {
            if (fetchId !== fetchRef?.current) {
              return;
            }
            setOptions(newOptions);
            setFetching(false);
          })
          .catch((err) => console.error(err));
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const handleClear = () => {
    if (props?.options) {
      setOptions([]);
      props?.onClear && props.onClear();
    }
  };
  return (
    <Select
      labelInValue
      filterOption={(input, option) => !!option?.label?.includes(input)}
      optionLabelProp="label"
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      // options={options.length ? options : props?.options || []}
      onClear={handleClear}
    >
      {(options.length ? options : props?.options || []).map((item, index) => {
        return (
          <Option key={`${item.value}-${index}`} label={item.label} value={item.value}>
            <div className={`${prefix}-item`}>
              <div className={`${prefix}-item-pic`}>
                {item.photo && item.photo !== 'null' ? (
                  <img src={item.photo} />
                ) : (
                  <div className={`${prefix}-item-pic-bg`}></div>
                )}
              </div>
              <div>{item.label}</div>
            </div>
          </Option>
        );
      })}
    </Select>
  );
};
