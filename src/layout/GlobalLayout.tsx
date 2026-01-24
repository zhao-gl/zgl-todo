import { Layout } from 'antd';
import React from "react";
const { Sider, Content } = Layout;
import styles from "./globalLayout.module.less"
import Lv1Menu from "@/pages/lv1Menu/Lv1Menu";
import Lv2Menu from "@/pages/lv2Menu/Lv2Menu";
import MainContent from "@/pages/mainContent/MainContent";

const GlobalLayout = () => {
  return (
    <Layout className={styles.layoutStyle}>
      <Sider width={50} theme={'light'} className={styles.siderIconStyle}>
        <Lv1Menu />
      </Sider>
      <Layout>
        <Sider theme={'light'} className={styles.siderStyle}>
          <Lv2Menu />
        </Sider>
        <Content className={styles.contentStyle}>
          <MainContent />
        </Content>
      </Layout>
    </Layout>
  );
};

export default GlobalLayout;
