type TodoItem = {
  id?: number
  tid: string
  userId?: number
  content: string
  done?: number
  type?: number
  desc?: string
  priority?: number
  belong_day?: string
}

export {
  TodoItem,
  TodoCenterProps,
  TodoSettingProps
}
