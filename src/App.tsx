import {Suspense, useEffect} from 'react';
import { Outlet } from "react-router-dom";
import { ConfigProvider } from 'antd';

function App() {
  // 关闭所有 antd 动画
  const disabledMotion = {
    motion: false,
  };
  // 校验是否存在用户
  const checkUser = () => {
    window?.electronAPI?.dbQuery('getAllUsers').then(res => {
      if(res.length === 0){
        // window.electronAPI?.dbQuery('addUser', 'zhaogl', '123456')
      }
    })
  }

  useEffect(() => {
    checkUser()
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
