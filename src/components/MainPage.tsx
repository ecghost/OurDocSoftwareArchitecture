// MainPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FileOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Modal, message, type MenuProps } from 'antd';
import * as monaco from 'monaco-editor';
import { useLocation, useNavigate } from 'react-router-dom';
import type { OnMount } from '@monaco-editor/react';

import SiderMenu from './SiderMenu';
import HomeHeader from './HomeHeader';
import { ContentWithEditorAndPreview } from './ContentWithEditorAndPreview';
import styles from '../components.module.less';

import {
    fetchRooms,
    getContent,
    getEditPermission,
    getReadPermission,
    saveContent,
    type Room,
} from '../services/mainPage';

// ---- helper types ----
type AntdMenuItem = Required<MenuProps>['items'][number];

export type SiderMenuItem = AntdMenuItem & {
    label?: React.ReactNode;
    children?: SiderMenuItem[];
};

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: SiderMenuItem[],
): SiderMenuItem {
    return { label, key, icon, children } as SiderMenuItem;
}

const MainPage: React.FC = () => {
    // userId
    const location = useLocation();
    const { userId, email } = (location.state || {}) as { userId?: string; email?: string };

    // Sider & rooms
    const [rooms, setRooms] = useState<Room[]>([]);
    const [menuLoading, setMenuLoading] = useState<boolean>(true);
    const [collapsed, setCollapsed] = useState(false);
    const [mode, setMode] = useState<'user' | 'room'>('room');
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null)

    // preview text (derived from editor)
    const [editorText, setEditorText] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Monaco editor instance ref
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    // Connection-like UI (kept simple)
    const [loading, setLoading] = useState(false);

    // Permission / editing toggle
    const [hasAccess, setHasAccess] = useState<boolean>(true);
    const [editingEnabled, setEditingEnabled] = useState<boolean>(false);

    const navigate = useNavigate();

    // -------------------- utils --------------------
    const fetchMenuData = async () => {
        try {
            setMenuLoading(true);
            const res = await fetchRooms(userId);
            setRooms(res);
        } catch (e) {
            console.error(e);
            message.error('加载文档列表失败');
        } finally {
            setMenuLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuData();
        setSelectedRoom('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -------------------- editor mount --------------------
    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor as monaco.editor.IStandaloneCodeEditor;

        // ensure preview text sync initially
        try {
            const val = editorRef.current.getValue();
            setEditorText(val ?? '');
        } catch (e) {
            setEditorText('');
        }
    };

    // -------------------- permission helpers --------------------
    const checkViewPermission = async (roomId: string | null): Promise<boolean> => {
        if (!roomId) return false;
        try {
            const res = await getReadPermission(roomId, userId);
            return !!res;
        } catch (e) {
            console.error('getReadPermission error', e);
            return false;
        }
    };
    const checkEditPermission = async (roomId: string | null, uId?: string): Promise<boolean> => {
        if (!roomId) return false;
        try {
            const res = await getEditPermission(roomId, uId || userId);
            return !!res;
        } catch (e) {
            console.error('getEditPermission error', e);
            return false;
        }
    };

    // -------------------- Sync (pull remote -> editor) --------------------
    const handleSyncButtonClick = async (selectedRoom: string) => {
        if (!selectedRoom) {
            message.warning('请先选择一个文档再同步');
            return;
        }
        setLoading(true);
        /////connecting
        setConnectionStatus('disconnected')
        try {
            const canView = await checkViewPermission(selectedRoom);
            setHasAccess(canView);
            if (!canView) {
                message.warning('您没有该文档的查看权限');
                return;
            }
            const res = await getContent(selectedRoom);
            const remote = res?.content ?? '';
            // set editor value
            if (editorRef.current) {
                // replace full text safely
                editorRef.current.setValue(remote);
            }
            setEditorText(remote);

            /////connect
            await new Promise(resolve => setTimeout(resolve, 300))
            setConnectionStatus('connected')
            message.success('同步完成');
        } catch (e) {
            console.error('handleSync error', e);
            message.error('同步失败');
        } finally {
            setLoading(false);
        }
    };

    // -------------------- Save (push editor -> remote) --------------------
    const handleSaveButtonClick = async () => {
        if (!selectedRoom) {
            message.warning('请先选择一个文档再保存');
            return;
        }
        try {
            const content = editorRef.current ? editorRef.current.getValue() : editorText;
            await saveContent({ room_id: selectedRoom, content });
            message.success('保存成功');
        } catch (e) {
            console.error('saveContent error', e);
            message.error('保存失败');
        }
    };

    // -------------------- Edit enable/disable --------------------
    const handleEditButtonClick = async () => {
        if (!selectedRoom) return;
        const ok = await checkEditPermission(selectedRoom, userId);
        if (!ok) {
            Modal.warning({ title: '权限不足', content: '你没有该文档的编辑权限' });
            editorRef.current?.updateOptions?.({ readOnly: true });
            setEditingEnabled(false);
            return;
        }
        // enable editing
        editorRef.current?.updateOptions?.({ readOnly: false });
        editorRef.current?.focus();
        setEditingEnabled(true);
    };

    // -------------------- handle selectedRoom changes --------------------
    useEffect(() => {
        if (!selectedRoom) {
            // clear editor/preview but do not auto-sync
            try {
                if (editorRef.current) {
                    editorRef.current.setValue('');
                }
            } catch (e) { /* ignore */ }
            setEditorText('');
            setHasAccess(true);
            setEditingEnabled(false);
            return;
        }

        // on selection change we do NOT auto-sync (per your request).
        // You can optionally auto-clear editor or keep previous content — we clear here.
        try {
            if (editorRef.current) {
                editorRef.current.setValue('');
            }
        } catch (e) { /* ignore */ }
        setEditorText('');
        setHasAccess(true);
        setEditingEnabled(false);
    }, [selectedRoom]);

    // -------------------- editor change -> update preview text --------------------
    // Use a small onDidChangeModelContent listener attached when mount
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const disposable = editor.onDidChangeModelContent(() => {
            try {
                const v = editor.getValue();
                setEditorText(v);
            } catch (e) { /* ignore */ }
        });
        return () => disposable.dispose();
    }, [editorRef.current]);

    // -------------------- SiderMenu helpers --------------------
    const groupRoomsByUser = (rooms: Room[]): SiderMenuItem[] => {
        const map = new Map<string, Room[]>();
        rooms.forEach((room) => {
            if (!map.has(room.owner_user_name)) map.set(room.owner_user_name, []);
            map.get(room.owner_user_name)!.push(room);
        });
        const items: SiderMenuItem[] = [];
        map.forEach((rooms, username) => {
            const children = rooms.map((room) => getItem(room.room_name, `${room.room_id}`));
            items.push(getItem(username, `user-${username}`, <UserOutlined />, children));
        });
        return items;
    };

    const mapRoomsToMenuItems = (rooms: Room[]): SiderMenuItem[] => {
        return rooms.map((room) => getItem(room.room_name, `${room.room_id}`, <FileOutlined />));
    };

    // search filter
    const [searchText, setSearchText] = useState('');
    const filteredItems = React.useMemo(() => {
        const filterMenu = (items: SiderMenuItem[]): SiderMenuItem[] =>
            items
                .map((item) => {
                    if (item?.children) {
                        const filteredChildren = filterMenu(item.children);
                        if (filteredChildren.length > 0 || String(item.label).toLowerCase().includes(searchText.toLowerCase()))
                            return { ...item, children: filteredChildren };
                        return null;
                    }
                    return String(item.label).toLowerCase().includes(searchText.toLowerCase()) ? item : null;
                })
                .filter(Boolean) as SiderMenuItem[];
        return filterMenu(mode === 'user' ? groupRoomsByUser(rooms) : mapRoomsToMenuItems(rooms));
    }, [searchText, mode, rooms]);

    const siderMenuProps = {
        collapsed,
        onCollapse: (value: boolean) => setCollapsed(value),
        mode,
        setMode,
        searchText,
        setSearchText,
        filteredItems,
        setSelectedRoom,
        handleSyncButtonClick
    };

    // -------------------- content & header props --------------------
    const contentWithEditorAndPreviewProps = {
        editorText,
        showPreview,
        handleEditorMount,
        hasAccess,
        editingEnabled,
    };

    const accountMenuItems: MenuProps['items'] = [
        { key: 'docs', label: '个人文档管理' },
        { type: 'divider' },
        { key: 'logout', label: '退出登录' },
    ];

    const displayName = userId || email || 'User';
    const avatarInitial = displayName.charAt(0).toUpperCase();
    const avatarColor = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
        return `hsl(${Math.abs(h) % 360} 70% 45%)`;
    };

    const homeHeaderProps = {
        title: 'Markdown 实时协作编辑器',
        selectedRoom,
        connectionStatus,
        peers: 0,
        showPreview,
        setShowPreview,
        hasAccess,
        onEditClick: handleEditButtonClick,
        onSaveClick: handleSaveButtonClick,
        // add Sync button handler to header props if you want header to show sync button
        onSyncClick: handleSyncButtonClick,
        editingEnabled,
        avatarInitial,
        avatarColor: avatarColor(displayName),
        accountMenuItems,
        handleAccountMenuClick: ({ key }: any) => {
            if (key === 'docs') {
                navigate('../mydocs', {
                    state: {
                        userId: userId,
                        email: email,
                    },
                });
            } else if (key === 'logout') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        },
    };

    // -------------------- render --------------------
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SiderMenu {...siderMenuProps} />
            <Layout style={{ flex: 1 }}>
                <HomeHeader {...homeHeaderProps} className={styles.header} />
                <ContentWithEditorAndPreview {...contentWithEditorAndPreviewProps} />
            </Layout>
        </Layout>
    );
};

export default MainPage;
