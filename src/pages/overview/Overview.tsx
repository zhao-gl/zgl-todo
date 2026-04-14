import ZglToolbar from "@/components/zglToolbar/ZglToolbar";
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Calendar } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import styles from './style.module.less'
import {TodoItem} from "@/types/todoList";
import {useEffect, useState} from "react";

const Overview = () => {
  const userInfo = localStorage.getItem('user');
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [date, setDate] = useState('');
  // 获取待办列表
  const getTodoList = async () => {
    const arr: TodoItem[] = await window.electronAPI?.dbQuery('todo.getTodosByDate',{
      userId: JSON.parse(userInfo || '{}').id,
      belongDay: date,
      sortType: 1
    })
    console.log(arr)
    if (Array.isArray(arr)) {
      setTodoList(arr)
    }
  }

  const getListData = (value: Dayjs) => {
    const selectDate = value.format('YYYY-MM-DD');
    const filteredTodos = todoList.filter(item => item.belong_day === selectDate);

    return filteredTodos.map(item => ({
      type: item.done === 1 ? 'success' : item.priority === 1 ? 'warning' : 'error',
      content: item.content,
      desc: item.desc,
      done: item.done,
      type_color: item.type_color
    }));
  };

  const getMonthData = (value: Dayjs) => {
    if (value.month() === 8) {
      return 1394;
    }
  };

  const monthCellRender = (value: Dayjs) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type as BadgeProps['status']} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    if (info.type === 'month') {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  useEffect(()=> {
    getTodoList()
  },[date])

  return (
    <>
      {/*<ZglToolbar title="日程概览" />*/}
      <Calendar
        cellRender={cellRender}
        className={styles.calendar}
        onChange={(date) => setDate(dayjs(date).format('YYYY-MM-DD'))}
      />
    </>
  )
}
export default Overview
