import React, { useCallback } from 'react';
import JSONInput from 'react-json-editor-ajrm/index';
// @ts-ignore
import locale from 'react-json-editor-ajrm/locale/zh-cn';
import * as SafeJSON from 'safe-json-parse-and-stringify';

interface IOpts {
  value?: any;
  onChange?: (opts: { isError: boolean; originValue: any; reason: string; error: any }) => void;
  height?: string;
  width?: string;
  theme?: string;
}

const JSONInputWrapper = (opts: IOpts) => {
  const { value, onChange, height, width, theme = 'dark_vscode_tribute' } = opts;
  const handleJSONInputChange = useCallback(
    (e: any) => {
      if (e?.error) {
        return (
          onChange &&
          onChange({
            isError: true,
            reason: e?.error?.reason,
            error: e?.error,
            originValue: value,
          })
        );
      }
      onChange && onChange(e.jsObject);
    },
    [onChange],
  );
  return (
    <JSONInput
      placeholder={value?.error ? value.originValue : value} // data to display
      theme={theme}
      locale={locale}
      height={height || '200px'}
      width={width || 'auto'}
      onChange={handleJSONInputChange}
      error={value?.error ? value.error : null}
    />
  );
};

export default React.memo(JSONInputWrapper);
