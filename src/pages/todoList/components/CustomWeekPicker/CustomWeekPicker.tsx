import React, { useState, useEffect, useMemo } from 'react';
import {Button, DatePicker, Tooltip} from 'antd';
import styles from './style.module.less';
import dayjs from "dayjs";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

interface CustomWeekPickerProps {
  initialSelectedDate?: Date;
  onDateSelect?: (date: string) => void;
  onWeekChange?: (weekStart: string, weekEnd: string) => void;
}

const CustomWeekPicker: React.FC<CustomWeekPickerProps> = (props) => {
  const { initialSelectedDate, onDateSelect, onWeekChange } = props;
  // currentDate 决定当前视图显示哪一周
  const [currentViewDate, setCurrentViewDate] = useState<Date>(initialSelectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate || null);
  const [customSelectedDate, setCustomSelectedDate] = useState<Date | null>(null);

  // 获取当前视图周一的函数 (纯函数)
  const getStartOfWeek = (date: Date): Date => {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0); // 重置时间，避免时分秒干扰判断
    const day = tempDate.getDay();
    const diff = day === 0 ? -6 : 1 - day; // 周日为0，转为周一为起点
    tempDate.setDate(tempDate.getDate() + diff);
    return tempDate;
  };

  // 使用 useMemo 计算当前周的所有日期，只有当视图日期改变时才重新计算
  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentViewDate);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  }, [currentViewDate]);

  const startOfWeek = weekDays[0];
  const endOfWeek = weekDays[6];

  // 切换周的逻辑
  const changeWeek = (offset: number) => {
    const nextViewDate = new Date(currentViewDate);
    nextViewDate.setDate(nextViewDate.getDate() + offset);
    setCurrentViewDate(nextViewDate);

    // 触发周切换回调
    if (onWeekChange) {
      const nextStart = getStartOfWeek(nextViewDate);
      const nextEnd = new Date(nextStart);
      nextEnd.setDate(nextStart.getDate() + 6);
      onWeekChange(dayjs(nextStart).format('YYYY-MM-DD'), dayjs(nextEnd).format('YYYY-MM-DD'));
    }
  };

  // 跳转到指定日期
  const jumpToDate = (date: Date | string | dayjs.Dayjs): void => {
    // 1. 统一转换为 dayjs 对象方便处理
    const targetDayjs = dayjs(date);
    if (!targetDayjs.isValid()) return; // 防护：非法日期不处理
    const targetDate = targetDayjs.toDate();
    // 2. 更新视图：切换到目标日期所在的周
    setCurrentViewDate(targetDate);
    // 3. 选中目标日期
    setSelectedDate(targetDate);
    // 4. 触发选中回调
    if (onDateSelect) {
      onDateSelect(targetDayjs.format('YYYY-MM-DD'));
    }
    // 5. 触发周切换回调
    if (onWeekChange) {
      // 使用之前定义的 getStartOfWeek
      const start = getStartOfWeek(targetDate);
      const end = dayjs(start).add(6, 'day');

      onWeekChange(
        dayjs(start).format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD')
      );
    }
  };

  // 辅助函数优化
  const isSameDay = (d1: Date, d2: Date | null) =>
    d2 && d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const formatDate = (date: Date) =>
    `${date.getMonth() + 1}月${date.getDate()}日`;

  const getWeekdayName = (date: Date) => ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

  // 监听外部初始值变化
  useEffect(() => {
    if (initialSelectedDate) {
      setSelectedDate(initialSelectedDate);
      setCurrentViewDate(initialSelectedDate);
    }
  }, [initialSelectedDate]);

  return (
    <div className={styles.datePickerContainer}>
      <div className={styles.daysWrapper}>
        {/* 今天 */}
        <Button
          onClick={() => {
            setCustomSelectedDate(null);
            jumpToDate(dayjs());
          }}
          icon={<span>☀</span>}
          type="text"
        />

        {/* 左箭头 */}
        <Button
          className={styles.navButton}
          icon={<LeftOutlined />}
          onClick={() => changeWeek(-7)}
          type="text"
        />

        {/* 日期主体 */}
        <div className={styles.daysContainer}>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <Tooltip
                title={`${formatDate(day)} 周${getWeekdayName(day)}`}
                key={day.toISOString()}
              >
                <div className={styles.dayItem}>
                  <button
                    onClick={() => {
                      setCustomSelectedDate(null);
                      setSelectedDate(day);
                      if (onDateSelect) {
                        onDateSelect(dayjs(day).format("YYYY-MM-DD"));
                      }
                    }}
                    className={`${styles.dayButton} ${isSelected ? styles.selected : ""} ${isToday ? styles.today : ""}`}
                  >
                    {day.getDate()}
                  </button>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* 右箭头 */}
        <Button
          className={styles.navButton}
          icon={<RightOutlined />}
          onClick={() => changeWeek(7)}
          type="text"
        />

        {/*自定义选择日期*/}
        <DatePicker
          placeholder="自定义日期"
          showNow={false}
          style={{ marginBottom: -2 }}
          value={customSelectedDate}
          onChange={(date) => {
            setCustomSelectedDate(date);
            if (date) {
              jumpToDate(date);
            } else {
              jumpToDate(new Date());
            }
          }}
        />
      </div>
    </div>
  );
};

export default CustomWeekPicker;
