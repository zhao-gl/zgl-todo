import {Menu, Modal, Form, Input, Button, message, Tag, Row, Col, ColorPicker} from "antd";
import {GroupOutlined, PlusOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import type { ColorPickerProps, GetProp } from 'antd';
import type { MenuProps } from 'antd';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
type MenuItem = Required<MenuProps>['items'][number];
type SettingsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  defSettingArea: string;
};
type Color = Extract<GetProp<ColorPickerProps, 'value'>, string | { cleared: any }>;

const Settings = (props: SettingsProps) => {
  const {open, setOpen, defSettingArea} = props;
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  // 个人信息
  const [userForm] = Form.useForm();
  const [isChangePwd, setIsChangePwd] = useState(false); // 修改密码
  // 分类管理
  const [typesForm] = Form.useForm();
  const [color, setColor] = useState<Color>('#fff');
  const items: MenuItem[] = [
    {
      key: '1',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      key: '2',
      label: '分类管理',
      icon: <GroupOutlined />,
    },
    {
      key: '3',
      label: '设置',
      icon: <SettingOutlined />,
    },
  ];

  const submitTypes = async (values: any) => {
    console.log(values)
    const res = await window.electronAPI?.dbQuery(
      'type.addType',
      values.name
    );
    if(res?.changes === 1){
      message.success('添加成功！');
      typesForm.resetFields();
    }else{
      message.error('添加失败！');
    }
  };

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
      console.log('分类管理')
    }
    if(activeKey === '3'){
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
      setSelectedKeys([defSettingArea])
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
          style={{ width: '30%' }}
          mode="inline"
          items={items}
          selectedKeys={selectedKeys}
          onSelect={(keys) => setSelectedKeys(keys.selectedKeys)}
        />
        <div style={{width: '100%', padding: '8px'}}>
          {/*个人信息*/}
          {selectedKeys[0] === '1' &&
            <>
              <Form form={userForm} labelCol={{ span: 4 }}>
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
          {/*分类管理*/}
          {selectedKeys[0] === '2' &&
            <>
              <Form form={typesForm} style={{position: 'relative'}} onFinish={submitTypes}>
                <Form.Item label="分类名称" name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
                  <Input style={{width: '80%'}} placeholder="请输入分类名称" />
                </Form.Item>
                <Form.Item label="分类颜色" name="color" rules={[{ required: true, message: '请选择分类颜色' }]}>
                  <ColorPicker style={{width: '10%'}} />
                </Form.Item>
                <Button
                  style={{width: '15%', marginLeft: '8px', position: 'absolute', right: '0', bottom: '2px'}}
                  onClick={() => typesForm.submit()}
                >添加</Button>
              </Form>
              <div style={{margin: '8px'}}>
                <div>已有分类：</div>
                <div>
                  <Tag color="blue">分类1</Tag>
                  <Tag color="blue">分类2</Tag>
                  <Tag color="blue">分类3</Tag>
                </div>
              </div>
            </>
          }
          {selectedKeys[0] === '3' &&
            <div>
              设置
              {}
            </div>
          }
        </div>
      </div>
    </Modal>
  );
}
export default Settings;
