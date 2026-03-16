
import {TodoCenterProps, TodoItem} from "@/types/todoList";
import styles from "@/pages/todoList/style.module.less";
import React from "react";
import {Checkbox} from "antd";

type TodoCenterProps = {
  todoList: TodoItem[],
  getTodoList: () => void,
  setVisibleTodoEdit: (visible: boolean) => void
}

const TodoCenter = (props: TodoCenterProps) => {
  const {todoList, getTodoList, setVisibleTodoEdit} = props

  // 修改待办状态
  const changeTodoStatus = async (checked: boolean, item: TodoItem) => {
    const updatedItem = {
      ...item,
      done: checked ? 1 : 0
    };
    const res = await window.electronAPI?.dbQuery('todo.updateTodo', updatedItem)
    if(res?.changes){
      getTodoList()
    }
  }
  // 打开待办编辑
  const openTodoEdit = (item: TodoItem) => {
    setVisibleTodoEdit(true)
  }

  return (
    <div className={`${styles.todoList} custom-scrollbar`}>
      {todoList.map((item, index) => {
        return (
          <div
            key={index}
            className={styles.todoItem}
            onClick={(e) => {
              openTodoEdit(item)
            }}
          >
            {/* 左侧 Checkbox */}
            <div className={styles.checkboxWrapper}>
              <Checkbox
                checked={item.done === 1}
                onChange={(e) => {
                  e.stopPropagation()
                  changeTodoStatus(e.target.checked, item)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              />
            </div>

            {/* 右侧内容：标题 + 描述 */}
            <div className={styles.contentWrapper}>
              <div className={` ${styles.content}  ${item.done ? styles.contentDone : ''}`}>
                {item.content}
              </div>
              <p className={styles.description}>{item.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
};
export default TodoCenter;
