import {
  Button,
  ColorPicker,
  type ColorPickerProps,
  Form,
  type GetProp,
  Input,
  List,
  message,
  Modal,
  Tag,
  Tooltip,
  type ModalFuncProps
} from "antd";
import {useEffect, useState} from "react";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {TypeItem} from "@/types/typeList";
type TypeSettingProps = {
  activeKey: string,
  setOpen: (open: boolean) => void;
}
type ColorValue = GetProp<ColorPickerProps, 'value'>;
type Color = Extract<GetProp<ColorPickerProps, 'value'>, string | { cleared: any }>;

const TypeSetting = (props: TypeSettingProps) => {
  const {activeKey, setOpen} = props;
  const [typesForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [types, setTypes] = useState<TypeItem[]>([]);

  // 获取所有分类
  const getAllTypes = async () => {
    const res = await window.electronAPI?.dbQuery('type.getAllTypes');
    if(Array.isArray(res)){
      setTypes(res)
    }
  };

  // 添加分类
  const addTypes = async (values: any) => {
    try {
      const colorStr = getColorString(values.color);
      const res = await window.electronAPI?.dbQuery('type.addType', {
        ...values,
        color: colorStr,
      });
      if (res?.changes === 1) {
        message.success('添加成功！');
        typesForm.resetFields();
        getAllTypes();
      } else {
        message.error('添加失败！');
      }
    } catch (e) {
      console.error(e);
      message.error('发生未知错误');
    }
  };

  // 删除分类
  const deleteType = async (id: number) => {
    const res = await window.electronAPI?.dbQuery('type.deleteType',id);
    if(res?.changes === 1){
      message.success('删除成功！');
      getAllTypes()
    }else{
      message.error('删除失败！');
    }
  };

  // 修改分类
  const updateType = (item: TypeItem) => {
    // 在打开弹窗前，先填充表单数据（回显）
    editForm.setFieldsValue({
      name: item.name,
      color: item.color,
    });

    Modal.confirm({
      title: '修改分类',
      icon: <EditOutlined />,
      content: (
        <Form
          form={editForm} // 绑定顶层定义的 form 实例
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          labelAlign="left"
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            label="分类颜色"
            name="color"
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <ColorPicker />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        // eslint-disable-next-line no-useless-catch
        try {
          // 验证并获取最新值
          const values = await editForm.validateFields();
          const colorStr = getColorString(values.color);
          const params = {
            id: item.id,
            name: values.name,
            color: colorStr,
          };
          const res = await window.electronAPI?.dbQuery('type.updateType', params);
          if (res?.changes === 1) {
            message.success('修改成功！');
            getAllTypes();
          } else {
            message.error('修改失败！');
          }
        } catch (error) {
          // 验证失败会进入这里，通常不需要提示，因为 Form 已经显示红字了
          throw error; // 阻止 Modal 关闭
        }
      },
      // 3. 关键：弹窗关闭后重置表单，防止下次打开残留数据
      afterClose: () => {
        editForm.resetFields();
      },
    } as ModalFuncProps);
  };

  // 辅助函数：统一将 Color 对象转换为 Hex 字符串
  const getColorString = (colorVal: ColorValue): string => {
    if (!colorVal) return '#ffffff';
    if (typeof colorVal === 'string') return colorVal;
    if ('cleared' in colorVal && colorVal.cleared) return '#ffffff';
    // AntD v5.12+ Color 对象
    return (colorVal as any).toHexString ? (colorVal as any).toHexString() : '#ffffff';
  };

  useEffect(()=>{
    if(activeKey === '2'){
      getAllTypes()
    }
  }, [activeKey])

  return (
    <>
      <Form form={typesForm} style={{position: 'relative'}} labelCol={{ span: 4 }} onFinish={addTypes}>
        <Form.Item label="分类名称" name="name" rules={[{ required: true, message: '请输入分类名称' }]}>
          <Input placeholder="请输入分类名称" />
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
        <div style={{marginBottom: '8px'}}>已有分类：</div>
        <div
          style={{
            height: 300,
            overflow: 'auto',
            padding: '8px',
            border: '1px solid #e1e1e1',
            borderRadius: '4px'
          }}
        >
          <List
            className="demo-loadmore-list"
            itemLayout="horizontal"
            dataSource={types}
            renderItem={item => (
              <List.Item
                actions={[
                  <a
                    key="delete"
                    onClick={() => updateType(item)}
                  ><EditOutlined /></a>,
                  <a
                    key="update"
                    onClick={() => deleteType(item.id)} style={{color: 'red'}}
                  ><DeleteOutlined /></a>
                ]}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    marginRight: '8px',
                    backgroundColor: item.color
                  }}
                ></div>
                <div
                  style={{
                    width: '230px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Tooltip title={item.name}>{item.name}</Tooltip>
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
    </>
  )
}

export default TypeSetting;
