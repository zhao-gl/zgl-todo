import styles from './style.module.less'
import { useState, useEffect } from 'react';

interface GlobalHeaderProps {
  hasControl?: boolean; // 是否显示控制按钮
}

const GlobalHeader = (props: GlobalHeaderProps) => {
  const { hasControl } = props;
  const [isMaximized, setIsMaximized] = useState(false);

  // 监听窗口状态变化
  useEffect(() => {
    const handleWindowStateChange = (_event: any, state: { isMaximized?: boolean }) => {
      if (state.isMaximized !== undefined) {
        setIsMaximized(state.isMaximized);
        console.log('窗口状态更新:', state.isMaximized ? '最大化' : '普通状态');
      }
    };
    // 获取初始窗口状态
    const getInitialState = async () => {
      try {
        const state = await window.electronAPI?.getWindowState();
        if (state?.isMaximized !== undefined) {
          setIsMaximized(state.isMaximized);
        }
      } catch (error) {
        console.error('获取窗口初始状态失败:', error);
      }
    };
    // 绑定事件监听器
    window.electronAPI?.onWindowStateChange(handleWindowStateChange);
    // 获取初始状态
    getInitialState();
  }, []);

  return (
    <div className={styles.globalHeader}>
      {hasControl && (
        <div className={styles.control}>
          <button className="electron-window-min-btn" style={{fontSize: 12,verticalAlign: 'bottom'}}>—</button>
          <button className="electron-window-max-btn" style={{fontSize: 18}}>
            {isMaximized ? '❐' : '◻'}
          </button>
          <button className="electron-window-close-btn" style={{fontSize: 18}}>×</button>
        </div>
      )}
    </div>
  );
}

export default GlobalHeader;
