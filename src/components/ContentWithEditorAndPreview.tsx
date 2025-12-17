import React from 'react';
import { Button, Form, Input, Layout, message } from 'antd';
import Editor, { type OnMount } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';

interface ContentWithEditorAndPreviewProps {
    editorText: string;
    showPreview: boolean;
    handleEditorMount: OnMount;
    hasAccess?: boolean;
    editingEnabled: boolean;
}

// Main content component
export const ContentWithEditorAndPreview: React.FC<ContentWithEditorAndPreviewProps> = ({
    editorText,
    showPreview,
    handleEditorMount,
    hasAccess = true,
    editingEnabled,
}) => {
    // No-access overlay
    const NoAccessOverlay = () => (
        <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 30,
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#222',
                padding: 24,
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                textAlign: 'center',
                maxWidth: 520,
            }}>
                <h3 style={{ marginBottom: 12 }}>无权查看文档内容</h3>
                <div style={{ marginBottom: 16, color: '#666' }}>
                    你没有查看该文档的权限。
                </div>
            </div>
        </div>
    )

    return (
        <Layout.Content style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            position: 'relative',
        }}>
            {/* 编辑器 + 预览区 */}
            <div
                style={{
                    display: 'flex',
                    gap: showPreview ? '16px' : 0,
                    padding: 24,
                    flex: 1,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                }}
            >
                <div style={{
                    width: showPreview ? '50%' : '100%',
                    transition: 'width 0.3s ease',
                    minWidth: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Editor
                            defaultLanguage="markdown"
                            // defaultValue={editorText}
                            theme="vs-dark"
                            onMount={handleEditorMount}
                            options={{ automaticLayout: true, minimap: { enabled: false }, readOnly: !editingEnabled }}
                        />
                    </div>
                </div>

                <div
                    style={{
                        width: showPreview ? '50%' : 0,
                        opacity: showPreview ? 1 : 0,
                        background: '#1e1e1e',
                        color: '#fff',
                        padding: showPreview ? '16px' : 0,
                        overflowY: 'auto',
                        transition: 'all 0.3s ease',
                        borderRadius: '8px',
                    }}
                >
                    <ReactMarkdown>{editorText}</ReactMarkdown>
                </div>

                {/* Blur overlay when no view access */}
                {!hasAccess && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 99,
                        background: 'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <NoAccessOverlay />
                    </div>
                )}
            </div>
        </Layout.Content>
    );
};
