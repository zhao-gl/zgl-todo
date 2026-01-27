type TodoItem = {
  id: number
  content: string
  done: boolean
  disabled?: boolean
}

type TodoCenterProps = {
  todoList: TodoItem[],
  setTodoList: (todoList: TodoItem[]) => void,
  setVisibleTodoSetting: (visible: boolean) => void
}

type TodoSettingProps = {
  visible: boolean,
  setVisible?: (visible: boolean) => void
  // todoList: TodoItem[]
  // setTodoList: (todoList: TodoItem[]) => void
}

export {
  TodoItem,
  TodoCenterProps,
  TodoSettingProps
}
