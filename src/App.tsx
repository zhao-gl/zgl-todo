import {Suspense, useEffect} from 'react';
import { Outlet } from "react-router-dom";
import { ConfigProvider } from 'antd';

function App() {

  // 关闭所有 antd 动画
  const disabledMotion = {
    motion: false,
  };

  useEffect(() => {
    window?.electronAPI?.dbQuery('getUser', 1).then(res => {
      console.log(res)
    })
  }, []);

  return (
    <ConfigProvider {...disabledMotion}>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
