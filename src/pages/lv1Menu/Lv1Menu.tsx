import { RouteObject, useNavigate, useLocation } from 'react-router-dom';
import { getTargetRoute } from "@/router"
import { useEffect, useState } from "react";
import styles from "./style.module.less"
import { Avatar, Button, Divider, Dropdown } from "antd";
import {DeleteOutlined, LogoutOutlined, MoreOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import Settings from "./modal/Settings";

const Lv1Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabList, setTabList] = useState<RouteObject[]>([])
  const [typeList, setTypeList] = useState<any[]>([])
  const [currentMenu, setCurrentMenu] = useState<string>('/menu/todo')
  const userinfo = JSON.parse(localStorage.getItem('user') || '{}');
  // 设置区域
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const [defSettingArea, setDefSettingArea] = useState('1');

  // 菜单项
  const items: MenuProps['items'] = [
    {
      label: '个人信息',
      key: '1',
      icon: <UserOutlined />,
      onClick: () => {
        openSetting('1')
      },
    },
    {
      label: '设置',
      key: '2',
      icon: <SettingOutlined />,
      onClick: () => {
        openSetting('2')
      },
    },
    {
      label: (<span style={{color: '#f5222d'}}>退出登录</span>),
      key: '3',
      icon: <LogoutOutlined />,
      onClick: () => {
        console.log('退出登录')
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      },
    },
  ];

  // 点击tab
  const handleTabClick = (path: string = '') => {
    setCurrentMenu(path)
    if (!path) return
    navigate(path, { replace: false });
  };

  // 点击标签
  const handleTypeClick = (type: string) => {
    setCurrentMenu(type)
    navigate({
      pathname: '/menu/type',
      search: `?type=${encodeURIComponent(type)}`
    }, { replace: false });
  };

  // 点击回收站
  const handleRecycleClick = () => {
    setCurrentMenu('recycle')
    navigate('/menu/recycle', { replace: false });
  };
  // 打开设置
  const openSetting = (area: string) => {
    setDefSettingArea(area)
    setIsOpenSetting(true)
  };

  useEffect(() => {
    setTabList(getTargetRoute('/menu')
      ?.children
      ?.filter(child => {
        return child.path && child.path !== '' && child.handle
      }) || [])
    setTypeList(() => {
      const newTypeList = [];
      for (let i = 0; i < 5; i++) {
        const type = {
          type: `类别${i}`,
          color: `#${Math.floor(Math.random() * 0xffffff).toString(16)}`
        }
        newTypeList.push(type);
      }
      return newTypeList;
    })
  }, [])

  return (
    <div className={styles.lv1Menu}>
      {/*用户区域*/}
      <div className={styles.user}>
        {/*<Avatar size={32} icon={<UserOutlined />} style={{ marginRight: 16 }} />*/}
        <div className={styles.username}>{userinfo?.username}</div>
        <div className={styles.more}>
          <Dropdown menu={{ items }} trigger={['click']}>
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>
      <Divider />
      {/*菜单区域*/}
      <div className={styles.tab}>
        {tabList.map((item) => (
          <Button
            type="text"
            onClick={() => handleTabClick(item.path)}
            key={item.path}
            className={currentMenu === item.path ? styles.activeMenu : ''}
          >
            {item.handle?.icon}
            {item.handle?.title}
          </Button>
        ))}
      </div>
      <Divider />
      {/*分类区域*/}
      <div className={styles.type}>
        <div className={styles.typeTitle}>
          <div>分类</div>
          <div className={styles.typeSettingBtn}><a href="#">管理</a></div>
        </div>
        <div className={`${styles.typeList} custom-scrollbar`}>
          {typeList.map((item) => (
            <Button
              type="text"
              className={currentMenu === item.type ? styles.activeMenu : ''}
              key={item.type}
              onClick={() => handleTypeClick(item.type)}
            >
              <div className={styles.typeColor} style={{ backgroundColor: item.color }} />
              {item.type}
            </Button>
          ))}
        </div>
      </div>
      <Divider />
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
      {/*设置-弹窗*/}
      <Settings open={isOpenSetting} setOpen={setIsOpenSetting} defSettingArea={defSettingArea} />
    </div>
  );
};

export default Lv1Menu;
