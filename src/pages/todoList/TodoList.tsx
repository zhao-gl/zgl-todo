import {Input, message} from "antd";
import styles from "./style.module.less"
import React, {useEffect, useState} from "react";
import {TodoItem} from "@/types/todoList";
import TodoCenter from "@/pages/todoList/components/TodoCenter";
import TodoSetting from "@/pages/todoList/components/TodoSetting";
import {PlusOutlined} from "@ant-design/icons";

const TodoList = () => {
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [todoInputVal, setTodoInputVal] = useState<string>('')
  const [nowTime, setNowTime] = useState<string>('')
  const [visibleTodoSetting, setVisibleTodoSetting] = useState<boolean>(false)
  const [pickType, setPickType] = useState<number>(0)

  // 获取待办列表
  const getTodoList = async () => {
    const arr = await window.electronAPI?.dbQuery('todo.getTodosByDone',{
      userId: userInfo.id,
      done: 0
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
      const item = {
        userId: userInfo.id,
        content: value.trim(),
        type: pickType,
      }
      const res = await window.electronAPI?.dbQuery('todo.addTodo', item)
      if(res.changes){
        setTodoList([...todoList, item])
        setTodoInputVal('')
      }else{
        message.warning('新增失败')
      }
    }
  }

  useEffect(() => {
    // setTodoInputVal('')
    if(todoList.length === 0) getTodoList()
  }, [todoList])

  useEffect(() => {

  }, [])

  return (
    <div className={styles.todoContainer}>
      {/*工具栏区域*/}
      <div className={styles.toolBar}>
        <h3>今日待办</h3>
        <div className={styles.toolBarOther}>更多</div>
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
        setVisibleTodoSetting={setVisibleTodoSetting}
      />
      <div className={styles.todoFooter}>{nowTime}</div>
      {/*待办项配置区域*/}
      <TodoSetting
        visible={visibleTodoSetting}
        setVisible={setVisibleTodoSetting}
      />
    </div>
  )
}
export default TodoList
