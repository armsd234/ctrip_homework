import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    LogoutOutlined,
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
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: '审核列表',
        }
    ];

    useEffect(() => {
        const fetchAvatarIcon = async () => {
            try {
                if (user?.avatar) {
                    // 使用正确的API路径
                    const imageUrl = `http://localhost:5001/api/images/image?filename=${user.avatar}`;
                    setAvatarIcon(<Avatar src={imageUrl} />);
                } else {
                    setAvatarIcon(<Avatar icon={<UserOutlined />} />);
                }
            } catch (error) {
                console.error('获取头像图标失败:', error);
                setAvatarIcon(<Avatar icon={<UserOutlined />} />);
            }
        };

        fetchAvatarIcon();
    }, []);

    return (
        <Layout className={styles.layout}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className={styles.logo}>游记审核</div>
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
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className={styles.userInfo}>
                                {avatarIcon}
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