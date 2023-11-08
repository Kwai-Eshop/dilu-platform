import React from 'react';
import classNames from 'classnames';
import Styles from './index.module.less';
// interface IScrollBarProps {
//   children?: ReactNode;
//   className?: any;
// }

// const ScrollBar: React.FC<IScrollBarProps> = ({ children, className }) => {
const ScrollBar = ({ children, className }) => {
  const cls = classNames(Styles.scrollbar, className);
  return <div className={cls}>{children}</div>;
};

export default ScrollBar;
