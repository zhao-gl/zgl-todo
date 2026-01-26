import {RouteObject, useNavigate, useLocation} from 'react-router-dom';
import {getTargetRoute} from "@/router"
import {useEffect, useState} from "react";
import styles from "./style.module.less"
import {Avatar, Button, Divider} from "antd";
import {MoreOutlined, UserOutlined} from "@ant-design/icons";

const Lv1Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabList, setTabList] = useState<RouteObject[]>([])

  // 点击tab
  const handleTabClick = (path: string = '') => {
    console.log(location.pathname, path)
    if(!path) return
    // 使用相对路径导航到子路由
    navigate(path, { replace: false });
  };

  useEffect(() => {
    setTabList(getTargetRoute('/menu')?.children?.filter(child => child.path && child.path !== '') || [])
  }, [])

  return (
    <div className={styles.lv1Menu}>
      <div className={styles.user}>
        <Avatar size={32} icon={<UserOutlined />} style={{marginRight: 16}} />
        <div className={styles.username}>zhaogl</div>
        <div className={styles.more}><MoreOutlined /></div>
      </div>
      <Divider/>
      <div className={styles.tab}>
        {tabList.map((item) => (
          <Button
            type="text"
            onClick={() => handleTabClick(item.path)}
            key={item.id}
            className={location.pathname === item.path ? styles.active : ''}
          >
            {item.handle?.icon}
            {item.handle?.title}
          </Button>
        ))}
      </div>
      <Divider/>
      <div className={styles.tag}>

      </div>
    </div>
  );
};

export default Lv1Menu;
