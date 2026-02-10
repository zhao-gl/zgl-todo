import {Input} from "antd";
import styles from "./style.module.less"
import React, {useEffect, useState} from "react";
import {TodoItem} from "@/types/todoList";
import TodoCenter from "@/pages/todoList/components/TodoCenter.tsx";
import TodoSetting from "@/pages/todoList/components/TodoSetting.tsx";
import {PlusOutlined} from "@ant-design/icons";

const TodoList = () => {
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [todoInputVal, setTodoInputVal] = useState<string>('')
  const [nowTime, setNowTime] = useState<string>('')
  const [visibleTodoSetting, setVisibleTodoSetting] = useState<boolean>(false)

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const {value} = e.target as HTMLInputElement
    if (!value.trim()) return
    if (e.code === 'Enter') {
      const item = {
        id: new Date().getTime(),
        content: value.trim(),
        done: false
      }
      setTodoList([...todoList, item])
      setTodoInputVal('')
    }
  }

  useEffect(() => {
    // setTodoInputVal('')
  }, [todoList])

  useEffect(() => {
    const timer = setTimeout(() => {
      setNowTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.todoContainer}>
      {/*工具栏区域*/}
      <div className={styles.toolBar}>
        <h3>今日待办</h3>
        <div className={styles.toolBarOther}>其他工具</div>
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
