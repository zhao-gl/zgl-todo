import { useEffect, useState } from "react";
import { Select, Switch, Typography } from "antd";
import { CalendarOutlined, FlagOutlined } from "@ant-design/icons";

export interface OverviewSettings {
  weekStartDay: 0 | 1; // 0=周日, 1=周一
  showPriority: boolean;
}

const DEFAULT_SETTINGS: OverviewSettings = {
  weekStartDay: 0,
  showPriority: true,
};

const STORAGE_KEY = "overviewSettings";

export const getOverviewSettings = (): OverviewSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
};

const OverviewSetting = () => {
  const [settings, setSettings] = useState<OverviewSettings>(getOverviewSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={5} style={{ marginBottom: 24 }}>
        <CalendarOutlined style={{ marginRight: 8 }} />
        概览设置
      </Typography.Title>

      {/* 周开始日 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          marginBottom: 12,
          background: "var(--bg-secondary)",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
        }}
      >
        <div>
          <Typography.Text strong style={{ fontSize: 15 }}>
            周开始日
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            设置日历每周从周日还是周一开始
          </Typography.Text>
        </div>
        <Select
          value={settings.weekStartDay}
          onChange={(val) =>
            setSettings((prev) => ({ ...prev, weekStartDay: val }))
          }
          style={{ width: 100 }}
          options={[
            { value: 0, label: "周日" },
            { value: 1, label: "周一" },
          ]}
        />
      </div>

      {/* 显示优先级 */}
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
            <FlagOutlined style={{ marginRight: 6 }} />
            显示优先级
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            在日程概览中显示待办事项的优先级标签
          </Typography.Text>
        </div>
        <Switch
          checked={settings.showPriority}
          onChange={(val) =>
            setSettings((prev) => ({ ...prev, showPriority: val }))
          }
        />
      </div>
    </div>
  );
};

export default OverviewSetting;