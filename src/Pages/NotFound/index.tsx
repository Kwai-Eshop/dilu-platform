import React, { useCallback } from 'react';
import { Result, Button } from 'antd';
import { useHistory } from 'react-router-dom';

export default function () {
  const history = useHistory();
  const handleClick = useCallback(() => {
    history.replace('/app/main/list');
  }, [history]);
  return (
    <Result
      status="404"
      title="404"
      subTitle="对不起，您访问的页面暂时无法找到！"
      extra={
        <Button onClick={handleClick} type="primary">
          回到首页
        </Button>
      }
    />
  );
}
