type TodoItem = {
  id?: number
  userId?: number
  content: string
  done?: number
  type?: number
  desc?: string
  priority?: number
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
