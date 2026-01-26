import { Layout } from 'antd';
import React from "react";
const { Sider, Content } = Layout;
import styles from "./globalLayout.module.less"
import Lv1Menu from "@/pages/lv1Menu/Lv1Menu";
import Main from "@/pages/main/Main";

const GlobalLayout = () => {
  return (
    <Layout className={styles.layoutStyle}>
      <Sider theme={'light'} className={styles.siderStyle} width={300}>
        <Lv1Menu />
      </Sider>
      <Content className={styles.contentStyle}>
        <Main />
      </Content>
    </Layout>
  );
};

export default GlobalLayout;
