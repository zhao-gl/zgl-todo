import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, Tag, Tooltip, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import ZglToolbar from '@/components/zglToolbar/ZglToolbar';
import { PRIORITY_MAP } from '@/global/Global';
import type { TodoItem } from '@/types/todoList';
import styles from './style.module.less';

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

const Overview = () => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const userInfo = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);

  // 加载当月待办
  const fetchMonthTodos = useCallback(async (month: Dayjs) => {
    if (!userInfo.id) return;
    setLoading(true);
    try {
      const yearMonth = month.format('YYYY-MM');
      const res = await window.electronAPI?.dbQuery('todo.getTodosByMonth', { userId: userInfo.id, yearMonth });
      if (Array.isArray(res)) {
        setTodos(res);
      }
    } catch (e) {
      console.error('加载月视图数据失败:', e);
    } finally {
      setLoading(false);
    }
  }, [userInfo.id]);

  useEffect(() => {
    fetchMonthTodos(currentMonth);
  }, [currentMonth, fetchMonthTodos]);

  // 按日期分组待办
  const todosByDay = useMemo(() => {
    const map: Record<string, TodoItem[]> = {};
    todos.forEach(t => {
      if (t.belong_day) {
        (map[t.belong_day] ??= []).push(t);
      }
    });
    return map;
  }, [todos]);

  // 生成日历网格
  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDayOfWeek = startOfMonth.day(); // 0=周日
    const daysInMonth = currentMonth.daysInMonth();

    const days: (Dayjs | null)[] = [];

    // 上月填充
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(startOfMonth.subtract(i + 1, 'day'));
    }

    // 当月日期
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(currentMonth.date(d));
    }

    // 下月填充到满6行
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(endOfMonth.add(i, 'day'));
    }

    return days;
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'));
  const goToday = () => setCurrentMonth(dayjs());

  const isToday = (d: Dayjs) => d.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  const isCurrentMonth = (d: Dayjs) => d.month() === currentMonth.month();

  // 获取优先级标签
  const getPriorityTag = (priority?: number) => {
    if (priority === undefined || priority === null) return null;
    const info = PRIORITY_MAP[priority as keyof typeof PRIORITY_MAP];
    if (!info) return null;
    return (
      <span
        style={{
          display: 'inline-block',
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: info.color,
          color: '#fff',
          fontSize: 10,
          lineHeight: '18px',
          textAlign: 'center',
          marginRight: 4,
          flexShrink: 0,
        }}
      >
        {info.name}
      </span>
    );
  };

  return (
    <div className={styles.overviewContainer}>
      <ZglToolbar
        title="日程概览"
        extra={
          <div className={styles.monthNav}>
            <Button type="text" icon={<LeftOutlined />} onClick={prevMonth} />
            <Typography.Text strong style={{ fontSize: 16, minWidth: 120, textAlign: 'center' }}>
              {currentMonth.format('YYYY年 M月')}
            </Typography.Text>
            <Button type="text" icon={<RightOutlined />} onClick={nextMonth} />
            <Button type="link" size="small" onClick={goToday}>今天</Button>
          </div>
        }
      />

      {/* 星期头 */}
      <div className={styles.weekHeader}>
        {WEEK_HEADERS.map(w => (
          <div key={w} className={styles.weekCell}>{w}</div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className={styles.calendarGrid}>
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={idx} className={styles.dayCell} />;
          const dateStr = day.format('YYYY-MM-DD');
          const dayTodos = todosByDay[dateStr] || [];
          const doneCount = dayTodos.filter(t => t.done === 1).length;
          const totalCount = dayTodos.length;

          return (
            <div
              key={idx}
              className={[
                styles.dayCell,
                !isCurrentMonth(day) ? styles.otherMonth : '',
                isToday(day) ? styles.today : '',
              ].join(' ')}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayNum}>{day.date()}</span>
                {totalCount > 0 && (
                  <span className={styles.dayCount}>
                    {doneCount}/{totalCount}
                  </span>
                )}
              </div>
              <div className={styles.dayTodos}>
                {dayTodos.slice(0, 4).map(todo => (
                  <Tooltip
                    key={todo.id}
                    title={
                      <div style={{ maxWidth: 200 }}>
                        {todo.desc ? <div style={{ marginBottom: 4 }}>{todo.desc}</div> : null}
                        {todo.type_color && (
                          <Tag color={todo.type_color} style={{ marginTop: 4 }}>
                            {todo.type_color}
                          </Tag>
                        )}
                      </div>
                    }
                  >
                    <div className={[
                      styles.todoItem,
                      todo.done === 1 ? styles.todoDone : '',
                    ].join(' ')}>
                      {getPriorityTag(todo.priority)}
                      <span className={styles.todoText}>{todo.content}</span>
                    </div>
                  </Tooltip>
                ))}
                {dayTodos.length > 4 && (
                  <div className={styles.moreTodos}>
                    +{dayTodos.length - 4} 项
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Overview;
