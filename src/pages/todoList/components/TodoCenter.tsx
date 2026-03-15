
import {TodoCenterProps, TodoItem} from "@/types/todoList";
import styles from "@/pages/todoList/style.module.less";
import React from "react";
import {Checkbox} from "antd";

const TodoCenter = (props: TodoCenterProps) => {
  const {todoList, setTodoList, setVisibleTodoSetting} = props

  const changeTodoStatus = (checked: boolean, item: TodoItem) => {
    // setTodoList(todoList.map(todoItem => {
    //   if (todoItem.id === item.id) {
    //     return { ...todoItem, done: checked }
    //   }
    //   return todoItem
    // }))
  }

  const openTodoSetting = (item: TodoItem) => {
    setVisibleTodoSetting(true)
  }

  return (
    <div className={`${styles.todoList} custom-scrollbar`}>
      {todoList.map((item, index) => {
        return (
          <div
            key={index}
            className={styles.todoItem}
            onClick={(e) => {
              openTodoSetting(item)
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
