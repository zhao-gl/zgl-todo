import {RouteObject, useNavigate, useLocation} from 'react-router-dom';
import {getTargetRoute} from "@/router"
import {useEffect, useState} from "react";
import styles from "./style.module.less"
import {Avatar, Button, Divider} from "antd";
import {DeleteOutlined, MoreOutlined, UserOutlined} from "@ant-design/icons";

const Lv1Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabList, setTabList] = useState<RouteObject[]>([])
  const [tagList, setTagList] = useState<any[]>([])
  const [currentMenu, setCurrentMenu] = useState<string>('/menu/todo')

  // 点击tab
  const handleTabClick = (path: string = '') => {
    setCurrentMenu(path)
    if(!path) return
    navigate(path, { replace: false });
  };

  // 点击标签
  const handleTagClick = (tag: string) => {
    setCurrentMenu(tag)
    navigate({
      pathname: '/menu/tag',
      search: `?tag=${encodeURIComponent(tag)}`
    }, {replace: false});
  };

  // 点击回收站
  const handleRecycleClick = () => {
    setCurrentMenu('recycle')
    navigate('/menu/recycle', { replace: false });
  };

  useEffect(() => {
    setTabList(getTargetRoute('/menu')
      ?.children
      ?.filter(child => {
        return child.path && child.path !== '' && child.handle
      }) || [])
    setTagList(() => {
      const newTagList = [];
      for (let i = 0; i < 20; i++) {
        const tag = {
          tag: `标签${i}`,
          color: `#${Math.floor(Math.random() * 0xffffff).toString(16)}`
        }
        newTagList.push(tag);
      }
      return newTagList;
    })
  }, [])

  return (
    <div className={styles.lv1Menu}>
      {/*用户区域*/}
      <div className={styles.user}>
        <Avatar size={32} icon={<UserOutlined />} style={{marginRight: 16}} />
        <div className={styles.username}>zhaogl</div>
        <div className={styles.more}><MoreOutlined /></div>
      </div>
      <Divider/>
      {/*菜单区域*/}
      <div className={styles.tab}>
        {tabList.map((item) => (
          <Button
            type="text"
            onClick={() => handleTabClick(item.path)}
            key={item.id}
            className={currentMenu === item.path ? styles.activeMenu : ''}
          >
            {item.handle?.icon}
            {item.handle?.title}
          </Button>
        ))}
      </div>
      <Divider/>
      {/*标签区域*/}
      <div className={styles.tag}>
        <div className={styles.tagTitle}>
          <div>标签</div>
          <div className={styles.tagSettingBtn}><a href="#">管理</a></div>
        </div>
        <div className={`${styles.tagList} custom-scrollbar`}>
          {tagList.map((item) => (
            <Button
              type="text"
              className={currentMenu === item.tag ? styles.activeMenu : ''}
              key={item.tag}
              onClick={() => handleTagClick(item.tag)}
            >
              <div className={styles.tagColor} style={{backgroundColor: item.color}} />
              {item.tag}
            </Button>
          ))}
        </div>
      </div>
      <Divider/>
      {/*回收站区域*/}
      <div className={styles.recycle}>
        <Button
          type="text"
          className={currentMenu === 'recycle' ? styles.activeMenu : ''}
          onClick={() => handleRecycleClick()}
        >
          <DeleteOutlined />
          回收站
        </Button>
      </div>
    </div>
  );
};

export default Lv1Menu;
