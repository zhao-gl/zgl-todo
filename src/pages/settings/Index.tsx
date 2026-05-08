import {Menu, Modal} from "antd";
import {CarryOutOutlined, GroupOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import {useEffect, useRef, useState} from "react";
import UserSetting from "@/pages/settings/userSetting/Index";
import TypeSetting from "@/pages/settings/typeSetting/Index";
import CommonSetting from "./commonSetting/Index";
import OverviewSetting from "./overviewSetting/Index";
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
  // 个人信息
  const userSettingRef = useRef<any>(null);
  // 分类管理
  const items: MenuItem[] = [
    {
      key: "1",
      label: "个人信息",
      icon: <UserOutlined />,
    },

    {
      key: "2",
      label: "概览设置",
      icon: <CarryOutOutlined />,
    },
    {
      key: "3",
      label: "分类管理",
      icon: <GroupOutlined />,
    },
    {
      key: "9",
      label: "通用设置",
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
    if(activeKey === '9'){
      setOpen(false);
    }
  };

  useEffect(()=>{
    setSelectedKeys([defSettingArea])
  },[defSettingArea])

  useEffect(()=>{
    if(!open){
      if(selectedKeys[0] === '3') getTypeList()
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
      <div style={{ display: "flex", height: "calc(100vh - 300px)" }}>
        <Menu
          style={{ width: "30%" }}
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          onSelect={(keys) => setSelectedKeys(keys.selectedKeys)}
        />
        <div style={{ width: "100%", padding: "8px" }}>
          {/*个人信息*/}
          {selectedKeys[0] === "1" && (
            <UserSetting
              ref={userSettingRef}
              activeKey={selectedKeys[0]}
              userInfo={userInfo}
              setOpen={setOpen}
            />
          )}
          {/*概览管理*/}
          {selectedKeys[0] === "2" && (
            <OverviewSetting />
          )}
          {/*分类管理*/}
          {selectedKeys[0] === "3" && (
            <TypeSetting activeKey={selectedKeys[0]} />
          )}
          {/* 通用设置 */}
          {selectedKeys[0] === "9" && <CommonSetting />}
        </div>
      </div>
    </Modal>
  );
}
export default Settings;
