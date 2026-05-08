import {Menu, Modal, Form, Input, Button, message, Tag, Row, Col, ColorPicker, Switch, Typography} from "antd";
import {GroupOutlined, PlusOutlined, SettingOutlined, UserOutlined, BulbOutlined} from "@ant-design/icons";
import type { ColorPickerProps, GetProp } from 'antd';
import type { MenuProps } from 'antd';
import {useEffect, useRef, useState} from "react";
import UserSetting from "@/pages/lv1Menu/modal/settings/UserSetting";
import TypeSetting from "@/pages/lv1Menu/modal/settings/TypeSetting";
import { useTheme } from "@/global/ThemeContext";
type MenuItem = Required<MenuProps>['items'][number];
type SettingsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  defSettingArea: string;
  getTypeList: () => void;
};

const Settings = (props: SettingsProps) => {
  const {open, setOpen, defSettingArea, getTypeList} = props;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const { theme, toggleTheme } = useTheme();
  // 个人信息
  const userSettingRef = useRef<any>(null);
  // 分类管理
  const items: MenuItem[] = [
    {
      key: '1',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: '分类管理',
      icon: <GroupOutlined />,
    },
    {
      key: '3',
      label: '通用设置',
      icon: <SettingOutlined />,
    },
  ];

  // 点击确认
  const handleOk = () => {
    const activeKey = selectedKeys[0];
    if(activeKey === '1'){
      userSettingRef.current?.handleSubmit()
    }
    if(activeKey === '2'){
      setOpen(false)
    }
    if(activeKey === '3'){
      setOpen(false);
    }
  };

  useEffect(()=>{
    setSelectedKeys([defSettingArea])
  },[defSettingArea])

  useEffect(()=>{
    if(!open){
      if(selectedKeys[0] === '2') getTypeList()
    }
  }, [open])

  return (
    <Modal
      title="设置"
      width={"65%"}
      open={open}
      destroyOnHidden={true}
      maskClosable={false}
      cancelText="取消"
      okText={"确认"}
      onOk={() => handleOk()}
      onCancel={() => setOpen(false)}
    >
      <div style={{display: 'flex', height: 'calc(100vh - 300px)'}}>
        <Menu
          style={{ width: '30%' }}
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          onSelect={(keys) => setSelectedKeys(keys.selectedKeys)}
        />
        <div style={{width: '100%', padding: '8px'}}>
          {/*个人信息*/}
          {selectedKeys[0] === '1' &&
            <UserSetting
              ref={userSettingRef}
              activeKey={selectedKeys[0]}
              userInfo={userInfo}
              setOpen={setOpen}
            />
          }
          {/*分类管理*/}
          {selectedKeys[0] === '2' &&
            <TypeSetting
              activeKey={selectedKeys[0]}
            />
          }
          {/* 通用设置 */}
          {selectedKeys[0] === '3' &&
            <div style={{ padding: '16px' }}>
              <Typography.Title level={5} style={{ marginBottom: 24 }}>
                <BulbOutlined style={{ marginRight: 8 }} />
                外观设置
              </Typography.Title>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
              }}>
                <div>
                  <Typography.Text strong style={{ fontSize: 15 }}>
                    {theme === 'dark' ? '🌙 深色模式' : '☀️ 浅色模式'}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {theme === 'dark' ? '适合低光环境，减少眼部疲劳' : '明亮清晰，适合日间使用'}
                  </Typography.Text>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  checkedChildren="深色"
                  unCheckedChildren="浅色"
                />
              </div>
            </div>
          }
        </div>
      </div>
    </Modal>
  );
}
export default Settings;
