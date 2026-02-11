import { Layout } from 'antd';
import React from "react";
const { Sider, Content } = Layout;
import styles from "./globalLayout.module.less"
import Lv1Menu from "@/pages/lv1Menu/Lv1Menu";
import {Outlet} from "react-router-dom";
import GlobalHeader from "@/components/globalHeader/GloablHeader";

const GlobalLayout = () => {
  return (
    <Layout className={styles.layoutStyle}>
      <Sider
        width={232}
        theme={'light'}
        className={styles.siderStyle}
      >
        <GlobalHeader />
        <Lv1Menu />
      </Sider>
      <Content>
        <GlobalHeader hasControl={true} />
        <div className={styles.outletContainer}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default GlobalLayout;
