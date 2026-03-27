import {DatePicker, Input, message, Select} from "antd";
import styles from "./style.module.less"
import React, {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";
import {TodoItem} from "@/types/todoList";
import {TypeItem} from "@/types/typeList";
import TodoCenter from "@/pages/todoList/TodoCenter";
import TodoEditing from "@/pages/todoList/TodoEditing";
import {PlusOutlined} from "@ant-design/icons";
import CustomWeekPicker from "./components/CustomWeekPicker/CustomWeekPicker"
import ZglToolBar from "@/components/zglToolbar/ZglToolbar";

const TodoList = () => {
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const [todoList, setTodoList] = useState<TodoItem[]>([])
  const [todoInputVal, setTodoInputVal] = useState<string>('')
  const [visibleTodoEdit, setVisibleTodoEdit] = useState<boolean>(false)
  const [pickType, setPickType] = useState<number>(0)
  const [date, setDate] = useState('');
  const [sortType, setSortType] = useState<number>(1) // 1 创建时间倒序 2 优先级排序 3 自定义排序
  const [typeList, setTypeList] = useState<TypeItem[]>([])
  const [todoItem, setTodoItem] = useState<TodoItem>({
    id: 0,
    userId: 0,
    tid: "-",
    content: "-",
    desc: "-",
    done: 0,
    priority: 0,
    type_id: 0
  })

  // 获取分类
  const getTypeList = async () => {
    const res = await window.electronAPI?.dbQuery('type.getAllTypes');
    if(Array.isArray(res)){
      setTypeList(res)
    }
    return res
  };

  // 获取待办列表
  const getTodoList = async () => {
    const arr: TodoItem[] = await window.electronAPI?.dbQuery('todo.getTodosByDate',{
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
        // type_id: pickType,
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

  // 删除待办
  const deleteTodo = async (tid: string) => {
    const res = await window.electronAPI?.dbQuery('todo.deleteTodo', tid)
    try {
      if(res.changes){
        getTodoList()
        message.success('已移至回收站')
      }
    } catch (e) {
      message.warning('删除失败')
    }
  }

  useEffect(() => {
    getTodoList()
    getTypeList()
  }, [date,sortType])

  useEffect(() => {
    setDate(dayjs().format('YYYY-MM-DD'))
  }, [])

  return (
    <div className={styles.todoContainer}>
      {/*工具栏区域*/}
      <ZglToolBar
        title={'今日待办'}
        extra={
          <>
            <CustomWeekPicker
              onDateSelect={(date)=> setDate(date)}
            />
            <Select
              style={{width: '120px', marginLeft: '10px'}}
              value={sortType}
              onChange={(value) => setSortType(value)}
              options={[
                {value: 1, label: '按创建时间排序'},
                {value: 2, label: '按优先级排序'},
                {value: 3, label: '自定义排序'},
              ]}
            />
          </>
        }
      />
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
        deleteTodo={deleteTodo}
      />
      {/*待办项编辑区域*/}
      <TodoEditing
        visible={visibleTodoEdit}
        setVisible={setVisibleTodoEdit}
        todoItem={todoItem}
        typeList={typeList}
        getTodoList={getTodoList}
        getTypeList={getTypeList}
        deleteTodo={deleteTodo}
      />
    </div>
  )
}
export default TodoList
