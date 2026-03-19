
import {TodoCenterProps, TodoItem} from "@/types/todoList";
import styles from "@/pages/todoList/style.module.less";
import React, {useState} from "react";
import {Checkbox} from "antd";
import {PRIORITY_MAP} from "@/global/Global"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {DeleteOutlined, HolderOutlined} from "@ant-design/icons";

// 单个可排序项
interface SortableItemProps {
  id: string;
  item: TodoItem;
  onEdit: (item: TodoItem) => void;
  onChangeStatus: (checked: boolean, item: TodoItem) => void;
  onDelete: (tid: string) => void;
}

const SortableItem = ({ id, item, onEdit, onChangeStatus, onDelete }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const priorityInfo = PRIORITY_MAP[item.priority as keyof typeof PRIORITY_MAP];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // 移除内联样式，改用 className 控制外观
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.todoItem} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      onClick={(e) => {
        // 防止与 Checkbox 冲突
        if (!(e.target as HTMLElement).closest('input[type="checkbox"]')) {
          onEdit(item);
        }
      }}
    >
      {/*拖拽手柄*/}
      <div className={styles.dragHandle} {...listeners}>
        <HolderOutlined />
      </div>
      {/* 左侧 Checkbox */}
      <div className={styles.checkboxWrapper}>
        <Checkbox
          checked={item.done === 1}
          onChange={(e) => {
            e.stopPropagation();
            onChangeStatus(e.target.checked, item);
          }}
          onClick={(e) => e.stopPropagation()} // 阻止触发父级 onClick
        />
      </div>

      {/* 右侧内容 */}
      <div className={styles.contentWrapper}>
        <div className={styles.contentRow}>
          <div className={`${styles.content} ${item.done ? styles.contentDone : ''}`}>
            {item.content}
          </div>
          <div className={styles.actions}>
            {priorityInfo && (
              <div className={styles.priority} style={{ backgroundColor: priorityInfo.color }}>
                {priorityInfo.name}
              </div>
            )}
            <div className={styles.delete} onClick={(e) => {
              e.stopPropagation();
              onDelete(item.tid)
            }}>
              <DeleteOutlined />
            </div>
          </div>
        </div>
        <p className={styles.description}>{item.desc}</p>
      </div>
    </div>
  );
};


type TodoCenterProps = {
  todoList: TodoItem[],
  setTodoList: (todoList: TodoItem[]) => void
  getTodoList: () => void,
  setSortType: (sortType: number) => void,
  setTodoItem: (item: TodoItem) => void
  setVisibleTodoEdit: (visible: boolean) => void
}

const TodoCenter = (props: TodoCenterProps) => {
  const {todoList, setTodoList, getTodoList, setSortType, setTodoItem, setVisibleTodoEdit} = props

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
    setTodoItem(item)
    setVisibleTodoEdit(true)
  }
  // 删除待办
  const deleteTodo = async (tid: string) => {
    const res = await window.electronAPI?.dbQuery('todo.deleteTodo', tid)
    if(res?.changes){
      getTodoList()
    }
  }
  // 拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todoList.findIndex(item => item.tid === active.id);
    const newIndex = todoList.findIndex(item => item.tid === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    let newTodoList = arrayMove(todoList, oldIndex, newIndex);
    newTodoList = newTodoList.map((item, index) => ({
      ...item,
      sort: index,
    }));
    setTodoList(newTodoList);
    // 同步到数据库
    try {
      await window.electronAPI?.dbQuery('todo.batchUpdateTodosSort', newTodoList);
      console.log('排序已保存');
      setSortType(3) // 拖拽保存成功则自动变为自定义排序
    } catch (error) {
      console.error('保存排序失败:', error);
      // 可选：回滚 UI
      setTodoList(todoList);
    }
  };
  // 配置传感器（支持鼠标、触摸、键盘）
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className={`${styles.todoList} custom-scrollbar`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={todoList.map(i => i.tid)} // 确保 tid 是 string
          strategy={verticalListSortingStrategy}
        >
          {todoList.map(item => (
            <SortableItem
              key={item.tid}
              id={item.tid}
              item={item}
              onEdit={openTodoEdit}
              onChangeStatus={changeTodoStatus}
              onDelete={deleteTodo}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
};
export default TodoCenter;
