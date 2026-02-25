import {Menu, Modal} from "antd";
import {SettingOutlined, UserOutlined} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import {useState} from "react";
type MenuItem = Required<MenuProps>['items'][number];
type SettingsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  defSettingArea: string;
};

const Settings = (props: SettingsProps) => {
  const {open, setOpen, defSettingArea} = props;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([defSettingArea]);

  const items: MenuItem[] = [
    {
      key: '0',
      label: '用户',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '1',
      label: '设置',
      icon: <SettingOutlined />,
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  return (
    <Modal
      title="设置"
      width={"65%"}
      open={open}
      onCancel={() => setOpen(false)}
      okText="保存"
      cancelText="取消"
    >
      <Menu
        onClick={onClick}
        style={{ width: 256 }}
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
      />
      <div>
        {}
      </div>
    </Modal>
  );
}
export default Settings;
