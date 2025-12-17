import {Layout, Segmented, Input, Menu, Button} from 'antd'
import type {SiderMenuItem} from './MainPage'
import type React from 'react'
import {PlusOutlined} from '@ant-design/icons';

interface SiderMenuProps {
    collapsed: boolean;
    onCollapse: (value: boolean) => void;
    mode: 'user' | 'room';
    setMode: React.Dispatch<React.SetStateAction<"user" | "room">>;
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    filteredItems: SiderMenuItem[];
    setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>;
    handleSyncButtonClick: Promise<void>;
}

const SiderMenu: React.FC<SiderMenuProps> = ({
                                                 collapsed,
                                                 onCollapse,
                                                 mode,
                                                 setMode,
                                                 searchText,
                                                 setSearchText,
                                                 filteredItems,
                                                 setSelectedRoom,
                                                 handleSyncButtonClick

                                             }) => {
    return (
        <Layout.Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}>
                <div style={{padding: 12}}>
                    <Segmented
                        options={[
                            {label: '用户名', value: 'user'},
                            {label: '房间名', value: 'room'},
                        ]}
                        value={mode}
                        onChange={(val) => setMode(val as 'user' | 'room')}
                        block
                    />
                    <Input
                        placeholder="搜索..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{marginTop: 12}}
                    />
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    items={filteredItems}
                    onClick={(e) => {
                        setSelectedRoom(e.key)
                        handleSyncButtonClick(e.key)
                    }}
                    style={{flex: 1, overflow: 'auto'}}
                />
            </div>
        </Layout.Sider>
    )
}

export default SiderMenu
