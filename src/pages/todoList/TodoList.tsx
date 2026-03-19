import {DatePicker, Input, message, Select} from "antd";
import styles from "./style.module.less"
import React, {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";
const Option = Select;
import {TodoItem} from "@/types/todoList";
import TodoCenter from "@/pages/todoList/TodoCenter";
import TodoSetting from "@/pages/todoList/TodoSetting";
import {PlusOutlined} from "@ant-design/icons";
import CustomWeekPicker from "./components/CustomWeekPicker/CustomWeekPicker"

const TodoList = () => {
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [todoInputVal, setTodoInputVal] = useState<string>('')
  const [visibleTodoEdit, setVisibleTodoEdit] = useState<boolean>(false)
  const [pickType, setPickType] = useState<number>(0)
  const [date, setDate] = useState('');
  const [sortType, setSortType] = useState<number>(1) // 1 创建时间倒序 2 优先级排序 3 自定义排序
  const [todoItem, setTodoItem] = useState<TodoItem>({
    id: 0,
    userId: 0,
    tid: "-",
    content: "-",
    desc: "-",
    done: 0,
    priority: 0,
    type: 0
  })

  // 获取待办列表
  const getTodoList = async () => {
    const arr = await window.electronAPI?.dbQuery('todo.getTodosByDate',{
      userId: userInfo.id,
      belongDay: date,
      sortType
    })
    if (Array.isArray(arr)) {
      setTodoList(arr)
    }
  }
  // 回车-添加待办
  const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const {value} = e.target as HTMLInputElement
    if (!value.trim()) return
    if (e.code === 'Enter') {
      const newTodo = {
        userId: userInfo.id,
        content: value.trim(),
        belongDay: date,
        type: pickType,
      }
      const res = await window.electronAPI?.dbQuery('todo.addTodo', newTodo)
      if(res.changes){
        getTodoList()
        setTodoInputVal('')
      }else{
        message.warning('新增失败')
      }
    }
  }

  useEffect(() => {
    getTodoList()
  }, [date,sortType])

  useEffect(() => {
    setDate(dayjs().format('YYYY-MM-DD'))
  }, [])

  return (
    <div className={styles.todoContainer}>
      {/*工具栏区域*/}
      <div className={styles.toolBar}>
        <h3>今日待办</h3>
        <div className={styles.toolBarOther}>
          <CustomWeekPicker
            onDateSelect={(date)=> setDate(date)}
          />
          <Select
            style={{width: '120px', marginLeft: '10px'}}
            value={sortType}
            onChange={(value) => setSortType(value)}
          >
            <Option value={1}>按创建时间排序</Option>
            <Option value={2}>按优先级排序</Option>
            <Option value={3}>自定义排序</Option>
          </Select>
        </div>
      </div>
      {/*输入区域*/}
      <div>
        <Input
          type='text'
          size='large'
          value={todoInputVal}
          className={styles.todoInput}
          placeholder='请输入待办事项'
          prefix={<PlusOutlined style={{width: '16px', height: '16px', color: '#666', opacity: 0.3}} />}
          onChange={(e) => setTodoInputVal(e.target.value)}
          onKeyDown={(e) => handleEnter(e)}
        />
      </div>
      {/*待办项区域*/}
      <TodoCenter
        todoList={todoList}
        setTodoList={setTodoList}
        getTodoList={getTodoList}
        setSortType={setSortType}
        setTodoItem={setTodoItem}
        setVisibleTodoEdit={setVisibleTodoEdit}
      />
      {/*待办项编辑区域*/}
      <TodoSetting
        visible={visibleTodoEdit}
        setVisible={setVisibleTodoEdit}
        todoItem={todoItem}
      />
    </div>
  )
}
export default TodoList
