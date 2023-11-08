import React from 'react';
import { Result } from 'antd';

export default class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  };
  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }
  render() {
    const { hasError } = this.state;
    if (!hasError) {
      return this.props.children;
    }
    return (
      <Result
        status="404"
        title="页面异常"
        subTitle={
          '非常抱歉给您造成的不便，我们的工程师会尽快修复，如果方便请联系我们的客服把您的浏览器版本、页面地址以及用户Id反馈给我们，谢谢'
        }
      />
    );
  }
}
