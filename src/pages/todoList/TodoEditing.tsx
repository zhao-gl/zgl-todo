import {Button, DatePicker, Drawer, Form, Input, message, Radio, Tooltip} from "antd";
import {useEffect, useState} from "react";
import {TodoItem} from "@/types/todoList";
import {PRIORITY_MAP} from "@/global/Global"
import dayjs from "dayjs";
import styles from './style.module.less'
import {TypeItem} from "@/types/typeList";
import {BellOutlined, DeleteOutlined, InboxOutlined} from "@ant-design/icons";

type TodoEditingProps = {
  visible: boolean;
  setVisible?: (visible: boolean) => void;
  todoItem: TodoItem;
  getTodoList: () => void;
  typeList: TypeItem[];
  getTypeList: () => void;
  deleteTodo: (tid: string) => void;
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

const TodoEditing = (props: TodoEditingProps) => {
  const { visible, setVisible, todoItem, typeList, getTodoList, getTypeList, deleteTodo } = props
  const [form] = Form.useForm()
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
    // console.log("newTodoItem:", newTodoItem)
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
    newTodoItem.type_color = typeList.find(item => item.id === newTodoItem.type_id)?.color
    const res = await window.electronAPI?.dbQuery?.('todo.updateTodo', newTodoItem)
    try {
      if (res.changes > 0) {
        getTodoList()
      }
    } catch (error) {
      console.log(error)
    }
  };

  // 添加到收集箱
  const dropToCollectBox = async () => {
    const res = await window.electronAPI?.dbQuery?.('todo.dropToCollectBox', {id: todoItem.id})
    try {
      if (res.changes > 0) {
        message.success('已添加到收集箱')
        getTodoList()
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    if (visible) {
      // getTypeOptions()
      if (todoItem) echoFormValues()
      getTypeList()
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
      className={styles.todoEditing}
      maskClosable={true}
      closable={false}
      onClose={() => {
        form.resetFields();
        if (setVisible) setVisible(false);
      }}
    >
      <Form
        form={form}
        labelCol={{span: 4}}
        labelAlign="left"
        onValuesChange={updateTodoItem}
      >
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
        <Form.Item name="type_id" label="分类">
          <Radio.Group
            block
            size="small"
            optionType="button"
            buttonStyle="outline"
          >
            <div className={styles.typeRadioGroup}>
              {typeList.map((item) => (
                <Radio.Button
                  key={item.id}
                  value={item.id}
                  style={{ borderRadius: '30px', margin: '4px' }}
                >
                  <div className={styles.typeRadioButtonTextWrapper}>
                    <div style={{backgroundColor: item.color}} className={styles.typeRadioButtonIcon}></div>
                    <div className={styles.typeRadioButtonText}>{item.name}</div>
                  </div>
                </Radio.Button>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="priority" label="优先级">
          <Radio.Group
            block
            size="small"
            optionType="button"
            buttonStyle="outline"
          >
            <div className={styles.priorityRadioGroup}>
              {priorityOptions.map((item) => (
                <Radio.Button
                  key={item.value}
                  value={item.value}
                >
                  <div className={styles.priorityRadioWrapper}>
                    <div className={styles.priorityRadioIcon} style={{backgroundColor: item.activeColor}}></div>
                    <div className={styles.priorityRadioText}>{item.label}</div>
                  </div>
                </Radio.Button>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      </Form>
      <div className={styles.todoEditFooter}>
        <Tooltip title="添加到收集箱">
          <Button onClick={() => dropToCollectBox()}>
            <InboxOutlined />
          </Button>
        </Tooltip>
        <Tooltip title="移至回收站">
          <Button type='primary' danger onClick={() => deleteTodo(todoItem.tid)}>
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </div>
    </Drawer>
  )
}

export default TodoEditing
