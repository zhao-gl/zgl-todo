import { useTheme } from "@/global/ThemeContext";
import { BulbOutlined } from "@ant-design/icons";
import { Switch, Typography } from "antd";

const CommonSetting = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={5} style={{ marginBottom: 24 }}>
        <BulbOutlined style={{ marginRight: 8 }} />
        外观设置
      </Typography.Title>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "var(--bg-secondary)",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
        }}
      >
        <div>
          <Typography.Text strong style={{ fontSize: 15 }}>
            {theme === "dark" ? "🌙 深色模式" : "☀️ 浅色模式"}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {theme === "dark"
              ? "适合低光环境，减少眼部疲劳"
              : "明亮清晰，适合日间使用"}
          </Typography.Text>
        </div>
        <Switch
          checked={theme === "dark"}
          onChange={toggleTheme}
          checkedChildren="深色"
          unCheckedChildren="浅色"
        />
      </div>
    </div>
  );
};

export default CommonSetting;