import {Drawer, Form, Input, Radio} from "antd";
import {useEffect, useState} from "react";
import {TodoItem} from "@/types/todoList";
import {PRIORITY_MAP} from "@/global/Global"

type TodoSettingProps = {
  visible: boolean,
  setVisible?: (visible: boolean) => void
  todoItem: TodoItem
  // todoList: TodoItem[]
  // setTodoList: (todoList: TodoItem[]) => void
}
const defaultPriorityOptions = [
  { label: PRIORITY_MAP[0].name, value: 0, activeColor: PRIORITY_MAP[0].color },
  { label: PRIORITY_MAP[1].name, value: 1, activeColor: PRIORITY_MAP[1].color },
  { label: PRIORITY_MAP[2].name, value: 2, activeColor: PRIORITY_MAP[2].color },
  { label: PRIORITY_MAP[3].name, value: 3, activeColor: PRIORITY_MAP[3].color },
]

const TodoSetting = (props: TodoSettingProps) => {
  const { visible, setVisible, todoItem } = props
  const [form] = Form.useForm()
  const [typeOptions, setTypeOptions] = useState<any[]>([]);
  const [priorityOptions, setPriorityOptions] = useState(defaultPriorityOptions);

  // 获取分类
  const getTypeOptions = async () => {
    // return getCategoryList().map(item => {
    //   return {
    //     label: item.name,
    //     value: item.id,
    //     style: {color: '#1f1f1f'}
    //   }
    // })
    setTypeOptions(defaultPriorityOptions)
  };

  // 回显表单值
  const echoFormValues = () => {
    form.setFieldsValue({
      content: todoItem.content,
      desc: todoItem.desc
    })
  };

  // 更新待办
  const updateTodoItem = (_: any, allValues: any) => {
    console.log(allValues)
  };

  // 改变分类
  const changeType = (e: any) => {
    const value = e.target.value
    setTypeOptions(typeOptions.map(item => {
      return item.value === value
        ? {...item, style: {color: '#1f1f1f', backgroundColor: item.activeColor}}
        : {...item, style: {color: '#1f1f1f'}}
    }))
  };

  // 改变优先级
  const changePriority = (e: any) => {
    const value = e.target.value
    setPriorityOptions(priorityOptions.map(item => {
      return item.value === value
        ? {...item, style: {color: '#1f1f1f', backgroundColor: item.activeColor}}
        : {...item, style: {color: '#1f1f1f'}}
    }))
  };

  useEffect(() => {
    if (todoItem) {
      echoFormValues()
    }
  }, [todoItem])
  useEffect(() => {
    if (visible) {
      getTypeOptions()
    }else{
      form.resetFields()
      setPriorityOptions(defaultPriorityOptions)
    }
  }, [visible])

  return (
    <Drawer
      title="编辑待办"
      open={visible}
      mask={true}
      styles={{
        mask: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'none'
        }
      }}
      maskClosable={true}
      closable={false}
      onClose={() => {
        if (setVisible) setVisible(false)
      }}
    >
      <Form form={form} labelCol={{span: 4}} labelAlign="left" onValuesChange={updateTodoItem}>
        <Form.Item name="content">
          <Input placeholder="请输入待办内容" variant="underlined" />
        </Form.Item>
        <Form.Item name="desc">
          <Input placeholder="请输入描述" variant="underlined" />
        </Form.Item>
        <Form.Item name="type" label="分类">
          <Radio.Group
            block
            options={typeOptions}
            onChange={changeType}
            optionType="button"
            buttonStyle="outline"
          />
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <Radio.Group
            block
            options={priorityOptions}
            onChange={changePriority}
            optionType="button"
            buttonStyle="outline"
          />
        </Form.Item>
        <Form.Item name="belong_day" label="移动到">
          <Radio name="belong_day" value={0}>今天</Radio>
          <Radio name="belong_day" value={1}>明天</Radio>
          <Radio name="belong_day" value={3}>自定义</Radio>
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default TodoSetting
