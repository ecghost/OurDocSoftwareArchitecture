import React, { useMemo, useState } from "react";
import { Menu, Switch, Input } from "antd";
import { FolderOutlined, UserOutlined, FileTextOutlined, SearchOutlined } from "@ant-design/icons";

// 示例组件：展示用户列表 / 共享文档列表，点击用户会展开其文档子列表
// 使用方法：<DocumentMenu users={users} sharedDocs={sharedDocs} onSelect={handleSelect} />

export default function DocumentMenu({
  users = [], // [{ id, name, docs: [{ id, title }] }]
  sharedDocs = [], // [{ id, title, ownerId, ownerName }]
  onSelect = (key, meta) => console.log("selected", key, meta),
}) {
  const [showUsers, setShowUsers] = useState(true); // 切换显示模式：用户/共享文档
  const [filter, setFilter] = useState("");

  // 构造菜单项（antd v4/v5 兼容 items API）
  const items = useMemo(() => {
    const q = filter.trim().toLowerCase();

    if (showUsers) {
      // 按用户分组：每个用户是一个 SubMenu，子项是该用户的文档
      return users
        .map((u) => {
          const children = (u.docs || [])
            .filter((d) => !q || d.title.toLowerCase().includes(q))
            .map((d) => ({
              key: `doc:${d.id}`,
              icon: <FileTextOutlined />,
              label: d.title,
              item: d,
            }));

          // 如果用户没有任何匹配文档，且有 filter，则可以隐藏该用户
          if (children.length === 0 && q) return null;

          return {
            key: `user:${u.id}`,
            icon: <UserOutlined />,
            label: u.name,
            children,
          };
        })
        .filter(Boolean);
    } else {
      // 显示共享文档列表（按文档展示，可在 label 显示所属用户）
      return (sharedDocs || [])
        .filter((d) => !q || d.title.toLowerCase().includes(q) || (d.ownerName || "").toLowerCase().includes(q))
        .map((d) => ({
          key: `doc:${d.id}`,
          icon: <FolderOutlined />,
          label: (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{d.title}</span>
              <small style={{ opacity: 0.6 }}>{d.ownerName}</small>
            </div>
          ),
          item: d,
        }));
    }
  }, [users, sharedDocs, showUsers, filter]);

  // 点击处理（Menu onClick 返回 {key, keyPath, item, domEvent}）
  const handleClick = ({ key, keyPath, domEvent, item }) => {
    // key 范例： 'user:123' 或 'doc:456'
    onSelect(key, { keyPath, domEvent, item });
  };

  return (
    <div className="p-4 rounded-lg shadow-sm bg-white" style={{ width: 320 }}>
      <div className="mb-3 flex items-center justify-between">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Switch checked={showUsers} onChange={setShowUsers} />
          <span style={{ fontWeight: 600 }}>{showUsers ? "按用户查看" : "共享文档"}</span>
        </div>
        <Input
          placeholder="搜索用户或文档"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 160 }}
        />
      </div>

      <Menu
        mode="inline"
        selectable
        onClick={handleClick}
        items={items}
        style={{ borderRight: 0 }}
      />
    </div>
  );
}

/* 使用示例（父组件中）：

const users = [
  { id: 1, name: 'Alice', docs: [{ id: 'a1', title: '项目计划' }, { id: 'a2', title: '需求说明' }] },
  { id: 2, name: 'Bob', docs: [{ id: 'b1', title: '测试用例' }] },
];

const sharedDocs = [
  { id: 'a1', title: '项目计划', ownerId: 1, ownerName: 'Alice' },
  { id: 'b1', title: '测试用例', ownerId: 2, ownerName: 'Bob' },
];

<DocumentMenu
  users={users}
  sharedDocs={sharedDocs}
  onSelect={(key, meta) => {
    // 解析 key 或 使用 meta.item 来拿到完整对象
    console.log('selected key', key, meta.item);
  }}
/>

*/
