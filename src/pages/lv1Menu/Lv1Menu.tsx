import GlobalHeader from "@/components/globalHeader/GloablHeader";
import styles from "./style.module.less";
import {useEffect, useState} from "react";
import {Tabs} from "antd";
import {Lv1Tab} from "@/types/lv1Menu"
import {CarryOutOutlined, CheckCircleOutlined, CheckSquareOutlined, SettingOutlined} from "@ant-design/icons";

const Lv1Menu = () => {
  const [tabs, setTabs] = useState<Lv1Tab[]>([]);
  const [activeKey, setActiveKey] = useState("1");

  useEffect(() => {
    const tabs = [
      {
        label: '1',
        key: "1",
        icon: <CheckSquareOutlined />
      },
      {
        label: '2',
        key: "2",
        icon: <CarryOutOutlined />
      },
      {
        label: '9',
        key: "9",
        icon: <SettingOutlined />
      },
    ];
    setTabs(tabs);
    setActiveKey("1")
  }, []);
  return (
    <>
      <GlobalHeader />
      <div className={styles.Container}>
        <Tabs
          activeKey={activeKey}
          tabPlacement='start'
          items={tabs?.map((value: Lv1Tab) => value)}
          onChange={(key) => setActiveKey(key)}
        />
      </div>
    </>
  );
};

export default Lv1Menu;
