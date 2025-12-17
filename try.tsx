import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Avatar, Button, Dropdown, Layout } from 'antd'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'

import SiderMenu from './SiderMenu'
import { CreateNewDocForm, ContentWithEditorAndPreview } from './ContentWithEditorAndPreview'
import styles from '../components.module.less'
import { useNavigate } from 'react-router-dom'

type AntdMenuItem = Required<MenuProps>['items'][number]

export type SiderMenuItem = AntdMenuItem & {
  label?: React.ReactNode,
  children?: SiderMenuItem[]
}

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: SiderMenuItem[],
): SiderMenuItem {
  return { label, key, icon, children } as SiderMenuItem
}

const userItems: SiderMenuItem[] = [
  getItem('Yaocheng', 'user-1', <UserOutlined />, [
    getItem('GuizhouHome', 'room-1'),
    getItem('ZhejiangHome', 'room-2'),
  ]),
  getItem('Xiaoyang', 'user-2', <TeamOutlined />, [
    getItem('ShaanxiHome', 'room-3'),
  ]),
]

const roomItems: SiderMenuItem[] = [
  getItem('GuizhouHome', 'room-1', <DesktopOutlined />),
  getItem('ZhejiangHome', 'room-2', <PieChartOutlined />),
  getItem('ShaanxiHome', 'room-3', <FileOutlined />),
]

const MainPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mode, setMode] = useState<'user' | 'room'>('room')
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [editorText, setEditorText] = useState('# 共享家园准备完毕')
  const [searchText, setSearchText] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // shared doc
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [binding, setBinding] = useState<MonacoBinding | null>(null)
  const [editor, setEditor] = useState<any | null>(null)
  // const [connected, setConnected] = useState(false)
  const [peers, setPeers] = useState<number>(1)

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRoom) return
    if (!editor) return

    console.log("selectedRoom", selectedRoom)
    // destroy old
    binding?.destroy()
    provider?.destroy()
    ydoc?.destroy()

    // create Y.Doc for new room
    const newYdoc = new Y.Doc()
    setYdoc(newYdoc)

    // create new provider
    const newProvider = new WebsocketProvider('ws://localhost:1234', selectedRoom, newYdoc)
    setProvider(newProvider)

    // set user status
    newProvider.awareness.setLocalStateField('user', {
      // 先随机在一个范围内生成name和color，后续接入后端读取name，随机分配一个color
      name: `User-${Math.floor(Math.random() * 10000)}`,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    })

    // bind editor
    let newBinding: MonacoBinding | null = null
    if (editor) {
      const type = newYdoc.getText('monaco')
      newBinding = new MonacoBinding(type, editor.getModel()!, new Set([editor]), newProvider.awareness)
      setBinding(newBinding)

      type.observe(() => {
        setEditorText(type.toString())
      })
    }

    // listen to peers
    const handleAwarenessChange = () => {
      const states = Array.from(newProvider.awareness.getStates().values())
      console.log("states", states)
      setPeers(states.length)
    }
    newProvider.awareness.on('change', handleAwarenessChange)

  }, [selectedRoom, editor])

  const filteredItems = useMemo(() => {
    const filterMenu = (items: SiderMenuItem[]): SiderMenuItem[] =>
      items
        .map((item) => {
          if (item?.children) {
            const filteredChildren = filterMenu(item.children)
            if (
              filteredChildren.length > 0 ||
              String(item.label).toLowerCase().includes(searchText.toLowerCase())
            ) {
              return { ...item, children: filteredChildren }
            }
            return null
          }
          return String(item.label).toLowerCase().includes(searchText.toLowerCase())
            ? item
            : null
        })
        .filter(Boolean) as SiderMenuItem[]

    return filterMenu(mode === 'user' ? userItems : roomItems)
  }, [searchText, mode])

  const siderMenuProps = {
    collapsed,
    onCollapse: (value: boolean) => setCollapsed(value),
    mode,
    setMode,
    searchText,
    setSearchText,
    filteredItems,
    setSelectedRoom,
  }

  const contentWithEditorAndPreviewProps = {
    editorText,
    setEditor,
    selectedRoom,
    showPreview,
    setShowPreview,
    peers
  }

  const accountMenuItems: MenuProps['items'] = [
    { key: 'docs', label: '个人文档管理' },
    { type: 'divider' },
    { key: 'logout', label: '退出登录' },
  ]

  const handleAccountMenuClick = useCallback(({ key }: { key: string }) => {
    if (key === 'docs') {
      navigate('../mydocs')
    } else if (key === 'logout') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ------------------ SIDER ------------------ */}
      <SiderMenu {...siderMenuProps} />
      {/* ------------------ MAIN AREA ------------------ */}
      <Layout style={{ flex: 1 }}>
        {/* 顶部 Header */}
        <Layout.Header className={styles.header}>
          <div style={{ fontWeight: 600 }}>Markdown 实时协作编辑器</div>
          <Dropdown menu={{ items: accountMenuItems, onClick: handleAccountMenuClick }} placement="bottomRight" trigger={['click']}>
            <Button type="text" style={{ padding: 0 }}>
              <Avatar icon={<UserOutlined />} />
            </Button>
          </Dropdown>
        </Layout.Header>
        {/* 主内容区 */}
        {selectedRoom ? <ContentWithEditorAndPreview {...contentWithEditorAndPreviewProps} /> : <CreateNewDocForm />}
        <Layout.Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Layout.Footer>
      </Layout>
    </Layout>
  )
}

export default MainPage