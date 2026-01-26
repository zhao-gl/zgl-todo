import { Suspense } from 'react';
import { Outlet } from "react-router-dom";
import { ConfigProvider } from 'antd';

function App() {

  // 关闭所有 antd 动画
  const disabledMotion = {
    motion: false,
  };

  return (
    <ConfigProvider {...disabledMotion}>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
