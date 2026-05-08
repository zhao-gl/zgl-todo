import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import styles from './style.module.less';
import GlobalHeader from '@/components/globalHeader/GloablHeader';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const loginResult = await window.electronAPI?.dbQuery('user.login', values.username, values.password);
      if (loginResult) {
        if (loginResult === 401) {
          message.error('用户名或密码错误');
          return;
        }
        message.success('登录成功！');
        localStorage.setItem('user', JSON.stringify(loginResult));
        navigate('/menu');
      } else {
        await register(values.username, values.password);
      }
    } catch (error) {
      console.error('登录过程出错:', error);
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    const res = await window.electronAPI?.dbQuery('user.addUser', username, password);
    if (res) {
      message.success('注册成功，正在自动登录...');
      const loginResult = await window.electronAPI?.dbQuery('user.login', username, password);
      localStorage.setItem('user', JSON.stringify(loginResult));
      navigate('/menu');
    } else {
      message.error('注册失败，请重试');
    }
  };

  return (
    <>
      <GlobalHeader hasControl={true} />
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          {/* 品牌区 */}
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <CheckCircleOutlined />
            </div>
            <h1 className={styles.title}>ZGL Todo</h1>
            <p className={styles.subtitle}>高效管理你的每一天</p>
          </div>

          {/* 表单 */}
          <Form onFinish={onFinish} className={styles.form} size="large">
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={styles.submitBtn}
              >
                开始使用
              </Button>
            </Form.Item>
          </Form>

          {/* 底部提示 */}
          <div className={styles.footerHint}>
            <span>首次输入自动注册账号</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
