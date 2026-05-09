; 安装前关闭正在运行的应用
!macro customInit
  ; 使用 nsExec::Exec 隐藏窗口执行 taskkill
  ; /NOLOGO 防止 taskkill 输出额外信息
  nsExec::Exec 'taskkill /f /im "${PRODUCT_NAME}.exe" /NOLOGO'
  Sleep 500
!macroend

; 卸载前关闭正在运行的应用
!macro customUnInit
  nsExec::Exec 'taskkill /f /im "${PRODUCT_NAME}.exe" /NOLOGO'
  Sleep 500
!macroend