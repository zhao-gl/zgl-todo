import {
  App,
  Button,
  ColorPicker,
  type ColorPickerProps,
  Empty,
  Form,
  type GetProp,
  Input,
  message,
  Popconfirm,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { TypeItem } from "@/types/typeList";
import styles from "./typeSetting.module.less";

type TypeSettingProps = {
  activeKey: string;
};
type ColorValue = GetProp<ColorPickerProps, 'value'>;

const TypeSetting = (props: TypeSettingProps) => {
  const { activeKey } = props;
  const { modal } = App.useApp();
  const [typesForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [adding, setAdding] = useState(false);

  // 获取所有分类
  const getAllTypes = async () => {
    const res = await window.electronAPI?.dbQuery('type.getAllTypes');
    if (Array.isArray(res)) {
      setTypes(res);
    }
  };

  // 添加分类
  const addTypes = async (values: any) => {
    setAdding(true);
    try {
      const colorStr = getColorString(values.color);
      const res = await window.electronAPI?.dbQuery('type.addType', {
        ...values,
        color: colorStr,
      });
      if (res?.changes === 1) {
        message.success('添加成功');
        typesForm.resetFields();
        getAllTypes();
      } else {
        message.error('添加失败');
      }
    } catch {
      message.error('发生未知错误');
    } finally {
      setAdding(false);
    }
  };

  // 删除分类
  const deleteType = async (id: number) => {
    const res = await window.electronAPI?.dbQuery('type.deleteType', id);
    if (res?.changes === 1) {
      message.success('已删除');
      getAllTypes();
    } else {
      message.error('删除失败');
    }
  };

  // 修改分类
  const updateType = (item: TypeItem) => {
    editForm.setFieldsValue({
      name: item.name,
      color: item.color,
    });

    modal.confirm({
      title: '编辑分类',
      icon: null,
      width: 400,
      content: (
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            label="颜色"
            name="color"
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <ColorPicker showText />
          </Form.Item>
        </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: async () => {
        try {
          const values = await editForm.validateFields();
          const colorStr = getColorString(values.color);
          const params = { id: item.id, name: values.name, color: colorStr };
          const res = await window.electronAPI?.dbQuery('type.updateType', params);
          if (res?.changes === 1) {
            message.success('修改成功');
            getAllTypes();
          } else {
            message.error('修改失败');
          }
        } catch {
          throw new Error(); // 阻止关闭
        }
      },
      afterClose: () => editForm.resetFields(),
    });
  };

  // 颜色转字符串
  const getColorString = (colorVal: ColorValue): string => {
    if (!colorVal) return '#1677ff';
    if (typeof colorVal === 'string') return colorVal;
    if ('cleared' in colorVal && colorVal.cleared) return '#1677ff';
    return (colorVal as any).toHexString?.() ?? '#1677ff';
  };

  useEffect(() => {
    if (activeKey === '2') getAllTypes();
  }, [activeKey]);

  return (
    <div className={styles.container}>
      {/* 添加区域 */}
      <div className={styles.addSection}>
        <Form form={typesForm} layout="inline" onFinish={addTypes} className={styles.addForm}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入名称' }]}
            className={styles.nameItem}
          >
            <Input placeholder="分类名称" />
          </Form.Item>
          <Form.Item
            name="color"
            rules={[{ required: true, message: '请选择颜色' }]}
            className={styles.colorItem}
          >
            <ColorPicker showText style={{width: 100, justifyContent: 'start'}} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={adding}
              onClick={() => typesForm.submit()}
            >
              新建分类
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 分类列表 */}
      <div className={styles.listSection}>
        <Typography.Text strong className={styles.sectionTitle}>
          已有分类
          {types.length > 0 && (
            <span className={styles.countBadge}>{types.length}</span>
          )}
        </Typography.Text>

        {types.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无分类，快去创建一个吧"
            className={styles.empty}
          />
        ) : (
          <div className={styles.typeList}>
            {types.map(item => (
              <div key={item.id} className={styles.typeCard}>
                <div className={styles.typeInfo}>
                  <div
                    className={styles.colorDot}
                    style={{ backgroundColor: item.color }}
                  />
                  <Tooltip title={item.name}>
                    <span className={styles.typeName}>{item.name}</span>
                  </Tooltip>
                </div>
                <div className={styles.typeActions}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => updateType(item)}
                  />
                  <Popconfirm
                    title="确认删除？"
                    description={`确定要删除「${item.name}」吗？`}
                    onConfirm={() => deleteType(item.id)}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeSetting;
