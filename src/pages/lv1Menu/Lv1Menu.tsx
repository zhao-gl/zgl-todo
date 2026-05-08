import { RouteObject, useNavigate, useLocation } from 'react-router-dom';
import { getTargetRoute } from "@/router"
import { useEffect, useState } from "react";
import styles from "./style.module.less"
import { Avatar, Button, Divider, Dropdown, App } from "antd";
import {DeleteOutlined, ExclamationCircleOutlined, LogoutOutlined, MoreOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import Settings from "@/pages/settings/Index";

const Lv1Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal } = App.useApp();
  const [tabList, setTabList] = useState<RouteObject[]>([])
  const [typeList, setTypeList] = useState<any[]>([])
  const [currentMenu, setCurrentMenu] = useState<string>('/menu/todo')
  const userinfo = JSON.parse(localStorage.getItem('user') || '{}');
  // 设置区域
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const [defSettingArea, setDefSettingArea] = useState('1');

  // 退出登录
  const handleLogout = () => {
    modal.confirm({
      title: '确认退出',
      icon: <ExclamationCircleOutlined />,
      content: '退出登录后需要重新输入账号密码，确定要退出吗？',
      okText: '确认退出',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      },
    });
  };

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
        openSetting('3')
      },
    },
    {
      label: (<span style={{color: '#f5222d'}}>退出登录</span>),
      key: '3',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  // 获取分类列表
  const getTypeList = async () => {
    const res = await window.electronAPI?.dbQuery('type.getAllTypes');
    if(Array.isArray(res)){
      setTypeList(res)
    }
  }

  // 点击tab
  const handleTabClick = (path: string = '') => {
    setCurrentMenu(path)
    if (!path) return
    navigate(path, { replace: false });
  };

  // 点击标签
  const handleTypeClick = (item: typeof typeList[0]) => {
    setCurrentMenu(item.name)
    navigate({
      pathname: '/menu/type',
      search: `?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.name)}`
    }, { replace: true });
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
    getTypeList()
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
          <div className={styles.typeSettingBtn}>
            <Button
              type='link'
              size='small'
              style={{fontSize: '12px'}}
              onClick={()=>openSetting('2')}
            >管理</Button>
          </div>
        </div>
        <div className={`${styles.typeList} custom-scrollbar`}>
          {typeList.map((item) => (
            <Button
              type="text"
              className={currentMenu === item.name ? styles.activeMenu : ''}
              key={item.name}
              onClick={() => handleTypeClick(item)}
            >
              <div className={styles.typeColor} style={{ backgroundColor: item.color }} />
              {item.name}
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
      <Settings
        open={isOpenSetting}
        setOpen={setIsOpenSetting}
        defSettingArea={defSettingArea}
        getTypeList={getTypeList}
      />
    </div>
  );
};

export default Lv1Menu;
