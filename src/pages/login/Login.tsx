import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import styles from './login.module.less';
import GlobalHeader from '@/components/globalHeader/GloablHeader';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      // 先尝试登录
      const loginResult = await window.electronAPI?.dbQuery('user.login', values.username, values.password);
      if (loginResult) {
        if(loginResult === 401){
          message.error('用户名或密码错误');
          return;
        }
        console.log('登录成功:', loginResult);
        message.success('登录成功！');
        navigate('/menu');
        localStorage.setItem('user', JSON.stringify(loginResult));
      } else {
        // 用户不存在，尝试注册
        register(values.username, values.password)
      }
    } catch (error) {
      console.error('登录过程出错:', error);
    }
  }

  // 注册
  const register = async (username: string, password: string) => {
    const res = await window.electronAPI?.dbQuery('user.addUser', username, password);
    if (res) {
      message.success('注册成功！');
      navigate('/menu');
      const loginResult = await window.electronAPI?.dbQuery('user.login', username, password)
      localStorage.setItem('user', JSON.stringify(loginResult));
    } else {
      message.error('注册失败，请重试');
    }
  }

  return (
    <>
      <GlobalHeader hasControl={true} />
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <h2 className={styles.title}>欢迎使用</h2>
          <Form onFinish={onFinish} className={styles.form}>
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="用户名" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="密码" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                开始使用
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
