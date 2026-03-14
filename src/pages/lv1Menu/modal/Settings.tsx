import {Menu, Modal, Form, Input, Button, message} from "antd";
import {SettingOutlined, UserOutlined} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
type MenuItem = Required<MenuProps>['items'][number];
type SettingsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  defSettingArea: string;
};

const Settings = (props: SettingsProps) => {
  const {open, setOpen, defSettingArea} = props;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([defSettingArea]);
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  // 个人信息
  const [userForm] = Form.useForm();
  const [isChangePwd, setIsChangePwd] = useState(false); // 修改密码
  const items: MenuItem[] = [
    {
      key: '1',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      label: '设置',
      icon: <SettingOutlined />,
    },
  ];

  // 点击保存
  const handleOk = () => {
    const activeKey = selectedKeys[0];
    if(activeKey === '1'){
      userForm.validateFields().then(async (values) => {
        // 用户名相同则不修改
        if(!isChangePwd && values.username === userInfo.username){
          setOpen(false);
          return;
        }
        const res = await window.electronAPI?.dbQuery(
          'user.updateUser',
          userInfo.id,
          values.username,
          values.password
        );
        if(res?.changes === 1){
          message.success('修改成功！');
          setOpen(false);
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        }else{
          message.error('修改失败！');
        }
      })
    }
    if(activeKey === '2'){
      console.log('设置')
    }
  };

  // 获取用户信息
  const echoUserinfo = async () => {
    if(userInfo){
      userForm.setFieldsValue({
        username: userInfo.username,
      });
    }
  }

  useEffect(() => {
    if(open){
      echoUserinfo()
    }
  }, [open])

  return (
    <Modal
      title="设置"
      width={"65%"}
      open={open}
      cancelText="取消"
      okText="保存"
      onOk={() => handleOk()}
      onCancel={() => setOpen(false)}
    >
      <div style={{display: 'flex', height: 'calc(100vh - 300px)'}}>
        <Menu
          style={{ width: 180 }}
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          onSelect={(keys) => setSelectedKeys(keys.selectedKeys)}
        />
        {/*个人信息*/}
        <div style={{width: '100%', padding: '16px',marginLeft: '16px'}}>
          {selectedKeys[0] === '1' &&
            <>
              <Form form={userForm} labelCol={{span:4}}>
                <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input placeholder="请输入用户名" />
                </Form.Item>
                {isChangePwd &&
                  <>
                    <Form.Item label="新密码" name="password" rules={[{ required: true, message: '请输入新密码' }]}>
                      <Input.Password placeholder="请输入新密码" />
                    </Form.Item>
                    <Form.Item
                      label="确认密码"
                      name="checkPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: '请再次输入确认密码'},
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const password = userForm.getFieldValue('password');
                            if (value !== password) {
                              return Promise.reject(new Error('两次输入的密码不一致！'));
                            }
                            return Promise.resolve();
                        }},
                      ]}
                    >
                      <Input.Password placeholder="请再次输入确认密码" />
                    </Form.Item>
                  </>
                }
              </Form>
              <div style={{textAlign: 'right'}}>
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    if(isChangePwd){
                      setIsChangePwd(false)
                      userForm.resetFields(['password', 'checkPassword'])
                      return
                    }
                    Modal.confirm({
                      title: '修改密码',
                      content: '确定要修改密码吗？',
                      okText: '确定',
                      cancelText: '取消',
                      onOk: () => {
                        setIsChangePwd(true)
                      },
                    });
                  }}
                >
                  {isChangePwd ? '取消修改密码' : '修改密码'}
                </Button>
              </div>
            </>
          }
          {selectedKeys[0] === '2' &&
            <div>
              {}
            </div>
          }
        </div>
      </div>
    </Modal>
  );
}
export default Settings;
