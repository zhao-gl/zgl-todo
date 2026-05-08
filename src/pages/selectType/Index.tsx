import ZglToolbar from "@/components/zglToolbar/ZglToolbar";
import { useSearchParams } from "react-router-dom";
import {useEffect, useState} from "react";
import styles from "./style.module.less";
import {Checkbox, Empty} from "antd";
import {CalendarOutlined} from "@ant-design/icons";
import {TodoItem} from "@/types/todoList";
import { PRIORITY_MAP } from "@/global/Global";

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

  // 格式化日期显示
  const formatDay = (belongDay?: string) => {
    if (!belongDay) return null;
    const d = belongDay.split('-');
    return `${d[1]}/${d[2]}`;
  };

  // 获取优先级信息
  const getPriorityInfo = (priority?: number) => {
    if (priority === undefined || priority === null) return null;
    return PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP];
  };

  return (
    <>
      <ZglToolbar title={typeName} />
      <div className={styles.typeTodoList}>
        {typeTodoList.length > 0 &&
          typeTodoList.map((item) => {
            const priorityInfo = getPriorityInfo(item.priority);
            return (
              <div
                key={item.id}
                className={styles.typeTodoItem}
                style={{ borderLeft: `2px solid ${item.type_color}` }}
              >
                <Checkbox checked={item.done === 1} disabled />
                <div className={styles.typeTodoItemContent}>
                  <div
                    className={`${styles.typeTodoItemText} ${item.done === 1 ? styles.textDone : ""}`}
                  >
                    {item.content}
                  </div>
                  {item.desc && (
                    <div className={styles.typeTodoItemDesc}>{item.desc}</div>
                  )}
                </div>
                <div className={styles.typeTodoMeta}>
                  {priorityInfo && (
                    <div
                      className={styles.priorityTag}
                      style={{ backgroundColor: priorityInfo.color }}
                    >
                      {priorityInfo.name}
                    </div>
                  )}
                  {item.belong_day && (
                    <span className={styles.dayTag}>
                      <CalendarOutlined style={{ marginRight: 2 }} />
                      {formatDay(item.belong_day)}
                    </span>
                  )}
                </div>
              </div>
            );})
        }
        {typeTodoList.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
    </>
  );
}

export default SelectType
