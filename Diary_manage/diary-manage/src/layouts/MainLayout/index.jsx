import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    FileTextOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import styles from './index.module.css';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                个人信息
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                退出登录
            </Menu.Item>
        </Menu>
    );

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: '审核列表',
        },
        {
            key: '/reports',
            icon: <FileTextOutlined />,
            label: '统计报表',
        },
    ];

    return (
        <Layout className={styles.layout}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className={styles.logo}>审核系统</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header className={styles.header}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className={styles.trigger}
                    />
                    <div className={styles.headerRight}>
                        <Dropdown overlay={userMenu} placement="bottomRight">
                            <div className={styles.userInfo}>
                                <Avatar icon={<UserOutlined />} />
                                <span className={styles.username}>{user?.username}</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className={styles.content}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout; 