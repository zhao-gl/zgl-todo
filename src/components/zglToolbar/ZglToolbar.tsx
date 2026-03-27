import React from 'react';
import styles from './style.module.less';

interface ZglToolBarProps {
  title: React.ReactNode;
  /** 右侧额外内容 */
  extra?: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 通用工具栏组件
 * @description 左侧显示标题，右侧显示额外内容（可选）
 */
const ZglToolBar: React.FC<ZglToolBarProps> = ({title, extra, className = '', style}) => {
  return (
    <div
      className={`${styles.toolBar} ${className}`}
      style={style}
    >
      <h3>{title}</h3>
      {extra && (
        <div className={styles.toolBarExtra}>
          {extra}
        </div>
      )}
    </div>
  );
};

export default ZglToolBar;
