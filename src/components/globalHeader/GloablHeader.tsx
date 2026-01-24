import styles from './style.module.less'

interface GlobalHeaderProps {
  hasControl?: boolean; // 是否显示控制按钮
}

const GlobalHeader = (props: GlobalHeaderProps) => {
  const { hasControl } = props;
  return (
    <div className={styles.globalHeader}>
      {hasControl && (
        <div className={styles.control}>
          <button id="window-min-btn" style={{fontSize: 12,verticalAlign: 'bottom'}}>—</button>
          <button id="window-max-btn" style={{fontSize: 18}}>◻</button>
          <button id="window-close-btn" style={{fontSize: 18}}>×</button>
        </div>
      )}
    </div>
  );
}

export default GlobalHeader;
