import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import {ConfigProvider, theme as antdTheme, App as AntdApp} from "antd";
import {router} from "@/router"
import "@/styles/reset.less"
import "@/styles/global.less"
import { ThemeProvider, useTheme } from "@/global/ThemeContext";
import { SettingsProvider, useSettings } from "@/global/SettingsContext";
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置 dayjs 的语言包
dayjs.locale('zh-cn');

/** 从 DB 设置中恢复主题 */
const ThemeRestorer = ({ children }: { children: React.ReactNode }) => {
  const { setTheme } = useTheme();
  const { settings, loaded } = useSettings();

  useEffect(() => {
    if (loaded && settings.common.theme) {
      setTheme(settings.common.theme);
    }
  }, [loaded, settings.common.theme, setTheme]);

  return <>{children}</>;
};

const ThemedApp = () => {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
        },
      }}
    >
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <ThemeRestorer>
          <ThemedApp />
        </ThemeRestorer>
      </SettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
