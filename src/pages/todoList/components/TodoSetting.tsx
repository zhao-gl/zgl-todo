import {Drawer} from "antd";
import {useEffect, useState} from "react";
import {TodoSettingProps} from "@/types/todoList";

const TodoSetting = (props: TodoSettingProps) => {
  const { visible, setVisible } = props

  return (
    <Drawer
      title="TodoSetting"
      open={visible}
      mask={true}
      styles={{
        mask: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'none'
        }
      }}
      maskClosable={true}
      onClose={() => {
        if (setVisible) setVisible(false)
      }}
      closable={false}
    >
      <div>
        TodoSetting
      </div>
    </Drawer>
  )
}

export default TodoSetting
