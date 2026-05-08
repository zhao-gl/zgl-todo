import ZglToolbar from "@/components/zglToolbar/ZglToolbar";
import styles from "./style.module.less";
import {Checkbox, Empty, message, Tooltip} from "antd";
import {RollbackOutlined, UpCircleOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {TodoItem} from "@/types/todoList";

const Recycle = () => {
  const userinfo = localStorage.getItem('user') as string
  const [recycleTodoList, setRecycleTodoList] = useState<TodoItem[]>([])

  // 获取列表
  const getTodoList = async () => {
    const arr = await window.electronAPI?.dbQuery('todo.getDeletedTodos',{userId: JSON.parse(userinfo).id})
    if(Array.isArray(arr)){
      setRecycleTodoList(arr)
    }else{
      console.log(arr)
    }
  }

  // 恢复
  const recoverFromRecycle = async (item: TodoItem) => {
    const res = await window.electronAPI?.dbQuery('todo.restoreTodo',{
      id: item.id,
    })
    if (res.changes > 0) {
      message.success('恢复成功')
      getTodoList()
    }else{
      console.log(res)
    }
  }

  useEffect(() => {
    getTodoList()
  }, [])

  return (
    <>
      <ZglToolbar title="回收站" />
      <div className={styles.recycleList}>
        {recycleTodoList.length > 0 &&
          recycleTodoList.map((item) => (
            <div
              key={item.id}
              className={styles.recycleItem}
              style={{ borderLeft: `2px solid ${item.type_color}` }}
            >
              <Checkbox checked={item.done === 1} disabled />
              <div className={styles.recycleItemContent}>
                <div
                  className={`${styles.recycleItemText} ${item.done === 1 ? styles.textDone : ""}`}
                >
                  {item.content}
                </div>
                {item.desc && (
                  <div className={styles.recycleItemDesc}>{item.desc}</div>
                )}
              </div>
              <div
                className={styles.recycleItemBtn}
                onClick={() => recoverFromRecycle(item)}
              >
                <Tooltip title={"恢复待办"}>
                  <RollbackOutlined />
                </Tooltip>
              </div>
            </div>
          ))
        }
        {recycleTodoList.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </>
  );
}
export default Recycle
