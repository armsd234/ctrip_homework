import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    LogoutOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import styles from './index.module.css';
import { UserOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [avatarIcon, setAvatarIcon] = useState(null);
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

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined key="logout-icon" />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined key="dashboard-icon" />,
            label: '首页',
        },
        {
            key: '/dashboard',
            icon: <BookOutlined key="dashboard-icon" />,
            label: '游记管理',
        },
        {
            key: '/dashboard',
            icon: <UserOutlined key="dashboard-icon" />,
            label: '用户管理',
        }
    ];

    useEffect(() => {
        const fetchAvatarIcon = async () => {
            try {
                console.log('mainlayout User:', user);
                if (user?.user.user.avatar) {
                    // 使用正确的API路径
                    console.log('mainlayout fetchAvatarIcon:', user);
                    const imageUrl = `http://localhost:5001/api/images/image?filename=${user.user.user.avatar}`;
                    setAvatarIcon(<Avatar key="user-avatar" src={imageUrl} />);
                } else {
                    console.log('mainlayout fetchAvatarIcon:', user);
                    setAvatarIcon(<Avatar key="default-avatar" icon={<UserOutlined key="default-user-icon" />} />);
                }
            } catch (error) {
                console.error('获取头像图标失败:', error);
                setAvatarIcon(<Avatar key="error-avatar" icon={<UserOutlined key="error-user-icon" />} />);
            }
        };

        fetchAvatarIcon();
    }, [user]);

    return (
        <Layout className={styles.layout}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div className={styles.logo}>后台管理</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
                <Header className={styles.header}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className={styles.trigger}
                    />
                    <div className={styles.headerRight}>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className={styles.userInfo}>
                                {avatarIcon}
                                <span className={styles.username}>{user?.user.user.username}</span>
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