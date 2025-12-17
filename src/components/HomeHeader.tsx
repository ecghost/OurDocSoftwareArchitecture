import React from 'react'
import {Layout, Space, Tooltip, Button, Badge, Dropdown, Avatar, Modal} from 'antd'
import {EyeOutlined, EyeInvisibleOutlined, EditOutlined, SaveOutlined, UserOutlined} from '@ant-design/icons'

export type HomeHeaderProps = {
    title?: string
    selectedRoom: string | null
    connectionStatus: 'connected' | 'disconnected' | 'connecting' | null
    peers: number
    // preview state & toggle
    showPreview: boolean
    setShowPreview: (v: boolean) => void
    // view/edit permissions & handlers
    hasAccess: boolean
    onEditClick: () => void
    onSaveClick: () => void
    editingEnabled: boolean
    // Avatar info
    avatarInitial: string
    avatarColor: string
    // Account menu items & click handler (same shape as antd Menu items)
    accountMenuItems: any[] // MenuProps['items']
    handleAccountMenuClick: (info: { key: string }) => void
    // optional classname / style
    className?: string
    style?: React.CSSProperties
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
                                                   title = 'Markdown 实时协作编辑器',
                                                   selectedRoom,
                                                   connectionStatus,
                                                   peers,
                                                   showPreview,
                                                   setShowPreview,
                                                   hasAccess,
                                                   onEditClick,
                                                   onSaveClick,
                                                   editingEnabled,
                                                   avatarInitial,
                                                   avatarColor,
                                                   accountMenuItems,
                                                   handleAccountMenuClick,
                                                   className,
                                                   style,
                                               }) => {
    // ActionButtons extracted here so we can reuse/arrange them easily
    const ActionButtons: React.FC = () => (
        <Space size="small" style={{display: 'flex', alignItems: 'center'}}>
            <Tooltip title={showPreview ? '关闭预览' : '预览'}>
                <Button
                    shape="circle"
                    type="default"
                    onClick={() => setShowPreview(!showPreview)}
                    icon={showPreview ? <EyeInvisibleOutlined/> : <EyeOutlined/>}
                />
            </Tooltip>

            <Tooltip title="编辑文档">
                <Button
                    shape="circle"
                    type="default"
                    onClick={() => {
                        if (!hasAccess) {
                            Modal.warning({title: '无权限', content: '你没有查看该文档的权限，无法编辑。'})
                            return
                        }
                        onEditClick()
                    }}
                    icon={<EditOutlined/>}
                />
            </Tooltip>

            <Tooltip title="保存文档">
                <Button
                    shape="circle"
                    type="default"
                    onClick={() => {
                        if (!editingEnabled) {
                            Modal.info({title: '只读模式', content: '当前为只读模式，无法保存。'})
                            return
                        }
                        onSaveClick()
                    }}
                    disabled={!editingEnabled}
                    icon={<SaveOutlined/>}
                />
            </Tooltip>
        </Space>
    )

    // Avatar dropdown trigger (keeps the dropdown semantics from your original header)
    const avatarTrigger = (
        <Button style={{padding: 0, borderRadius: 999}} type="text" aria-label="account">
            <Avatar style={{backgroundColor: avatarColor, verticalAlign: 'middle'}}>
                {String(avatarInitial) || <UserOutlined/>}
            </Avatar>
        </Button>
    )

    return (
        <Layout.Header
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                paddingLeft: 24,
                paddingRight: 24,
                ...style,
            }}
        >
            {/* Left title */}
            <div style={{fontWeight: 600, color: '#fff'}}>{title}</div>

            {/* center area: compact connection/room info */}
            <div style={{marginLeft: 12, color: '#fff', opacity: 0.95, flex: 1}}>
                <Space size="middle">
                    {selectedRoom ? (
                        <>
              <span style={{color: '#fff'}}>
                Room: <strong>{selectedRoom}</strong>
              </span>
                            <Space size={8}>
                                <Tooltip
                                    title={
                                        connectionStatus === 'connected'
                                            ? 'Connected'
                                            : connectionStatus === 'connecting'
                                                ? 'Connecting'
                                                : 'Disconnected'
                                    }
                                >
                                    <span style={{
                                        display: 'inline-block',
                                        transform: 'scale(1.6)',
                                        transformOrigin: 'center',
                                        marginRight: 6
                                    }}>
              <Badge
                  status={
                      connectionStatus === 'connected'
                          ? 'success'
                          : connectionStatus === 'connecting'
                              ? 'processing'
                              : 'error'
                  }
              />
            </span>
                                </Tooltip>
                                {/*<span style={{color: '#fff'}}>Peers: {peers}</span>*/}
                            </Space>
                        </>
                    ) : null}
                </Space>
            </div>

            {/* Right: action buttons + avatar dropdown (same visual line) */}
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <ActionButtons/>

                <Dropdown
                    menu={{items: accountMenuItems, onClick: handleAccountMenuClick}}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    {avatarTrigger}
                </Dropdown>
            </div>
        </Layout.Header>
    )
}

export default HomeHeader
