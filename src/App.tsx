import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { ConfigProvider } from 'antd';

function App() {
  const navigate = useNavigate();
  const disabledMotion = {
    motion: false,
  };
  // 检测用户是否存在
  const checkUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/menu');
    } else {
      navigate('/login');
    }
  };

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
