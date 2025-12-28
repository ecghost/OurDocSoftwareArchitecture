import React, { useState } from "react";
import { Layout, Input, List, Avatar, Switch } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import Editor, { type OnMount } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "../services/mainPage.ts";

interface ContentWithEditorAndPreviewProps {
  room_id: string | null;
  editorText: string;
  showPreview: boolean;
  handleEditorMount: OnMount;
  hasAccess?: boolean;
  editingEnabled: boolean;
  AIOpen: boolean;
}

interface AiMessage {
  role: "user" | "ai";
  content: string;
}

export const ContentWithEditorAndPreview: React.FC<
  ContentWithEditorAndPreviewProps
> = ({
  room_id,
  editorText,
  showPreview,
  handleEditorMount,
  hasAccess = true,
  editingEnabled,
  AIOpen,
}) => {
  /* -------------------- AI 状态 -------------------- */
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [includeDoc, setIncludeDoc] = useState(true);

  /* -------------------- 无权限遮罩 -------------------- */
  const NoAccessOverlay = () => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: 12 }}>无权查看文档内容</h3>
        <div style={{ color: "#666" }}>你没有查看该文档的权限。</div>
      </div>
    </div>
  );

  /* -------------------- 发送 AI 消息 -------------------- */
  const sendAiMessage = async () => {
    if (!aiInput.trim()) return;

    const prompt = aiInput;

    setAiMessages((prev) => [...prev, { role: "user", content: aiInput }]);

    setAiInput("");

    try {
      const res = await chatWithAI({
        room_content: editorText,
        message: prompt,
        include_doc: includeDoc,
      });
      console.log("chat", res);

      setAiMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: res.reply,
        },
      ]);
    } catch (err) {
      console.error("Error chatting with AI:", err);
      setAiMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: " AI 服务响应超时，请限制token",
        },
      ]);
    }
  };

  return (
    <Layout.Content
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          padding: 24,
          gap: 16,
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* -------------------- 编辑器 -------------------- */}
        <div
          style={{
            width: showPreview ? "50%" : "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            overflow: "hidden",
            transition: "width 0.3s ease",
          }}
        >
          <Editor
            defaultLanguage="markdown"
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              readOnly: !editingEnabled,
            }}
          />
        </div>

        {/* -------------------- 预览区 -------------------- */}
        <div
          style={{
            width: showPreview ? "50%" : 0,
            opacity: showPreview ? 1 : 0,
            background: "#1e1e1e",
            color: "#fff",
            padding: showPreview ? 16 : 0,
            overflowY: "auto",
            borderRadius: 8,
            transition: "all 0.3s ease",
          }}
        >
          <ReactMarkdown>{editorText}</ReactMarkdown>
        </div>

        {/* -------------------- AI 对话框 -------------------- */}
        {AIOpen && (
          <div
            style={{
              flex: "0 0 360px",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              background: "#f7f9fc",
              borderLeft: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
            }}
          >
            {/* Header */}
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              <RobotOutlined /> AI 助手
            </div>

            {/* 消息区 */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                paddingRight: 4,
              }}
            >
              <List
                dataSource={aiMessages}
                renderItem={(item) => {
                  const isUser = item.role === "user";

                  return (
                    <List.Item
                      style={{
                        border: "none",
                        padding: "8px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: isUser ? "flex-end" : "flex-start",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: isUser ? "row-reverse" : "row",
                            gap: 8,
                          }}
                        >
                          <Avatar
                            size={24}
                            icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                            style={{
                              background: isUser ? "#1677ff" : "#52c41a",
                            }}
                          />
                          <div
                            style={{
                              background: isUser ? "#e6f4ff" : "#f6ffed",
                              padding: "8px 12px",
                              borderRadius: 12,
                              fontSize: 13,
                              maxWidth: 240,
                            }}
                          >
                            <ReactMarkdown>{item.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>

            {/* 是否携带文档 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#555",
                marginTop: 6,
              }}
            >
              <Switch
                size="small"
                checked={includeDoc}
                onChange={setIncludeDoc}
              />
              让 AI 参考当前文档内容
            </div>

            {/* 输入区 */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                marginTop: 8,
              }}
            >
              <Input.TextArea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="向 AI 助手提问…"
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{
                  borderRadius: 20,
                  padding: "8px 12px",
                  resize: "none",
                }}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    sendAiMessage();
                  }
                }}
              />

              {/* 发送按钮 */}
              {aiInput.trim() && (
                <div
                  onClick={sendAiMessage}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#1677ff",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <ArrowUpOutlined />
                </div>
              )}
            </div>
          </div>
        )}

        {!hasAccess && <NoAccessOverlay />}
      </div>
    </Layout.Content>
  );
};
