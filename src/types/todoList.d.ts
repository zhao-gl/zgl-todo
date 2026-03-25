type TodoItem = {
  id?: number
  tid: string
  userId?: number
  content: string
  done?: number
  type_id?: number
  type_color?: string
  desc?: string
  priority?: number
  belong_day?: string
}

export {
  TodoItem,
  TodoCenterProps,
  TodoSettingProps
}
