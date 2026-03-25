import {DatePicker, Drawer, Form, Input, Radio} from "antd";
import {useEffect, useState} from "react";
import {TodoItem} from "@/types/todoList";
import {PRIORITY_MAP} from "@/global/Global"
import dayjs from "dayjs";
import styles from './style.module.less'
import {TypeItem} from "@/types/typeList";

type TodoSettingProps = {
  visible: boolean,
  setVisible?: (visible: boolean) => void
  todoItem: TodoItem
  getTodoList: () => void
  typeList: TypeItem[]
  // todoList: TodoItem[]
  // setTodoList: (todoList: TodoItem[]) => void
}
const defaultPriorityOptions = [
  { label: PRIORITY_MAP[0].name, value: 0, activeColor: PRIORITY_MAP[0].color },
  { label: PRIORITY_MAP[1].name, value: 1, activeColor: PRIORITY_MAP[1].color },
  { label: PRIORITY_MAP[2].name, value: 2, activeColor: PRIORITY_MAP[2].color },
  { label: PRIORITY_MAP[3].name, value: 3, activeColor: PRIORITY_MAP[3].color },
]

const defBelongDayOptions = [
  { label: '今天', value: 1},
  { label: '明天', value: 2},
  { label: '自定义', value: 99},
]

const TodoSetting = (props: TodoSettingProps) => {
  const { visible, setVisible, todoItem, typeList, getTodoList } = props
  const [form] = Form.useForm()
  const [typeOptions, setTypeOptions] = useState<any[]>(typeList);
  const [priorityOptions, setPriorityOptions] = useState(defaultPriorityOptions);
  const [belongDayOptions, setBelongDayOptions] = useState(defBelongDayOptions);
  const [customBelongDay, setCustomBelongDay] = useState<any>('')

  // 回显表单值
  const echoFormValues = () => {
    setCustomBelongDay(dayjs(todoItem.belong_day))
    form.setFieldsValue(todoItem)
  };

  // 更新待办
  const updateTodoItem = async (_: any, allValues: any) => {
    const newTodoItem = {...todoItem, ...allValues}
    console.log("newTodoItem:", newTodoItem)
    // 处理所属日期
    if(newTodoItem.belong_day){
      const value = newTodoItem.belong_day
      switch (value) {
        case 1:
          newTodoItem.belong_day = dayjs().format('YYYY-MM-DD')
          break;
        case 2:
          newTodoItem.belong_day = dayjs().add(1, 'day').format('YYYY-MM-DD')
          break;
        default:
          console.log(newTodoItem.belong_day)
          break;
      }
    }
    newTodoItem.type_color = typeOptions.find(item => item.id === newTodoItem.type)?.color
    const res = await window.electronAPI?.dbQuery?.('todo.updateTodo', newTodoItem)
    try {
      if (res.changes > 0) {
        getTodoList()
      }
    } catch (error) {
      console.log(error)
    }
  };

  // 改变分类
  const changeType = (e: any) => {
    const value = e.target.value
    setTypeOptions(typeOptions.map(item => {
      return item.id === value
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

  // 改变所属日期
  // const changeBelongDay = (e: any) => {
  //   const value = e.target.value
  // };

  useEffect(() => {
    if (visible) {
      // getTypeOptions()
      if (todoItem) echoFormValues()
    }else{
      setPriorityOptions(defaultPriorityOptions) // 重置优先级
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
        form.resetFields();
        if (setVisible) setVisible(false);
      }}
    >
      <Form form={form} labelCol={{span: 4}} labelAlign="left" onValuesChange={updateTodoItem}>
        <Form.Item name="content">
          <Input placeholder="请输入待办内容" variant="underlined" />
        </Form.Item>
        <Form.Item name="desc">
          <Input.TextArea
            placeholder="请输入描述"
            variant="underlined"
            autoSize={{ minRows: 1, maxRows: 3 }}
            maxLength={100}
          />
        </Form.Item>
        <Form.Item name="belong_day" label="移动到">
          <Radio.Group
            block
            size="small"
            optionType="button"
            buttonStyle="outline"
          >
            {defBelongDayOptions.map((option) => {
              if(option.value === 99) {
                return (
                  <DatePicker
                    key={option.value}
                    style={{height: '28px', marginTop: '2px'}}
                    value={customBelongDay}
                    showNow={false}
                    onChange={(date)=>{
                      setCustomBelongDay(date);
                      const currentValues = form.getFieldsValue();
                      updateTodoItem(null, { ...currentValues, belong_day: dayjs(date).format('YYYY-MM-DD') });
                      // setFieldValue 保持表单状态同步
                      form.setFieldValue('belong_day', date);
                    }}
                  />
                )
              }
              return (
                <Radio.Button
                  key={option.value}
                  value={option.value}
                  style={{borderRadius: '30px', margin: '4px 4px 0 0'}}
                >
                  {option.label}
                </Radio.Button>
              )
            })}
          </Radio.Group>
        </Form.Item>
        <Form.Item name="type" label="分类">
          <Radio.Group
            block
            size="small"
            onChange={changeType}
            optionType="button"
            buttonStyle="outline"
          >
            {typeOptions.map((item) => (
              <Radio.Button
                key={item.id}
                value={item.id}
                style={{ borderRadius: '30px', margin: '0 4px', backgroundColor: item.color }}
              >
                {item.name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <Radio.Group
            block
            size="small"
            options={priorityOptions}
            onChange={changePriority}
            optionType="button"
            buttonStyle="outline"
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}

export default TodoSetting
