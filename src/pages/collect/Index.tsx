import {TodoItem} from "@/types/todoList";
import {ReactNode, useEffect, useState} from "react";
import ZglToolBar from "@/components/zglToolbar/ZglToolbar";
import styles from './style.module.less'
import {Button, message, Tooltip} from "antd";
import {CaretRightOutlined, CloseCircleOutlined, RollbackOutlined, UpCircleOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const Collect = () => {
  const [noBelongTodoList, setNoBelongTodoList] = useState<TodoItem[]>([]);
  const userinfo = JSON.parse(localStorage.getItem('user') || '{}');
  const [belongDay, setBelongDay] = useState<string>('');

  // 获取无日期列表
  const getTodoList = async () => {
    const arr = await window.electronAPI?.dbQuery('todo.getCollectTodos',{
      userId: userinfo.id,
    })
    if (Array.isArray(arr)) {
      setNoBelongTodoList(arr)
    }
  }

  // 移出收集箱
  const removeFromCollectBox = async (item: TodoItem) => {
    const res = await window.electronAPI?.dbQuery('todo.removeFromCollectBox',{
      id: item.id,
      belongDay: belongDay ? belongDay : dayjs().format('YYYY-MM-DD'),
    })
    if (res.changes > 0) {
      message.success('移出成功')
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
      <ZglToolBar title={"收集箱"} />
      <div className={styles.collectList}>
        {noBelongTodoList.map((item) => (
          <div
            key={item.id}
            className={styles.collectItem}
            style={{ borderLeft: `2px solid ${item.type_color}` }}
          >
            <div className={styles.collectItemContent}>
              <div className={styles.collectItemText}>{item.content}</div>
              {item.desc && (
                <div className={styles.collectItemDesc}>{item.desc}</div>
              )}
            </div>
            <div
              className={styles.collectItemBtn}
              onClick={() => removeFromCollectBox(item)}
            >
              <Tooltip title={"移出收集箱"}>
                <CloseCircleOutlined />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Collect
