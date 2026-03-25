import {Button, Form, Input, message, Modal} from "antd";
import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {useNavigate} from "react-router-dom";

type UserSettingProps = {
  activeKey: string,
  userInfo: any,
  setOpen: (open: boolean) => void;
}

const UserSetting = forwardRef((props: UserSettingProps, ref) => {
  const {activeKey, userInfo, setOpen} = props
  const navigate = useNavigate();
  const [userForm] = Form.useForm();
  const [isChangePwd, setIsChangePwd] = useState(false); // 修改密码

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    // 提交
    handleSubmit: ()=> {
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
  }))

  // 获取用户信息
  const echoUserinfo = async () => {
    if(userInfo){
      userForm.setFieldsValue({
        username: userInfo.username,
      });
    }
  }

  useEffect(()=>{
    if(activeKey === '1') echoUserinfo()
  },[activeKey])

  return (
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
            setIsChangePwd(true)
          }}
        >
          {isChangePwd ? '取消修改密码' : '修改密码'}
        </Button>
      </div>
    </>
  )
})

export default UserSetting
