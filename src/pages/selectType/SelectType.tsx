import ZglToolbar from "@/components/zglToolbar/ZglToolbar";
import { useSearchParams } from "react-router-dom";
import {useEffect, useState} from "react";
import styles from "./style.module.less";
import {Checkbox, Tooltip} from "antd";
import {UpCircleOutlined} from "@ant-design/icons";
import {TodoItem} from "@/types/todoList";

const SelectType = () => {
  const [searchParams] = useSearchParams();
  const typeId = searchParams.get('id');
  const typeName = searchParams.get('name');
  const userinfo = localStorage.getItem('user');
  const [typeTodoList, setTypeTodoList] = useState<TodoItem[]>([]);

  // 根据分类获取待办列表
  const getTodosByTypeId = async (typeId: string) => {
    const arr = await window.electronAPI?.dbQuery('todo.getTodosByTypeId', {
      userId: JSON.parse(userinfo || '{}').id,
      typeId
    });
    if(Array.isArray(arr)){
      setTypeTodoList(arr);
    }
  }

  useEffect(() => {
    getTodosByTypeId(typeId || '');
  }, [typeId]);

  return (
    <>
      <ZglToolbar title={typeName} />
      <div className={styles.typeTodoList}>
        {typeTodoList.map((item) => (
          <div
            key={item.id}
            className={styles.typeTodoItem}
            style={{borderLeft:`2px solid ${item.type_color}`}}
          >
            <Checkbox checked={item.done === 1} disabled />
            <div className={styles.typeTodoItemContent}>
              <div className={`${styles.typeTodoItemText} ${item.done === 1 ? styles.textDone : ''}`}>{item.content}</div>
              {item.desc && <div className={styles.typeTodoItemDesc}>{item.desc}</div>}
            </div>
            {/*<div className={styles.typeTodoItemBtn} onClick={() => recoverFromRecycle(item)}>*/}
            {/*  <Tooltip title={'恢复待办'}>*/}
            {/*    <UpCircleOutlined />*/}
            {/*  </Tooltip>*/}
            {/*</div>*/}
          </div>
        ))}
      </div>
    </>
  )
}

export default SelectType
