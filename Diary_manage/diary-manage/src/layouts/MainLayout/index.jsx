import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    HomeOutlined,
    LogoutOutlined,
    FileTextOutlined,
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
            key: '/mainindex',
            icon: <HomeOutlined key="home-icon" />,
            label: '首页',
        },
        {
            key: '/diary',
            icon: <FileTextOutlined key="diary-icon" />,
            label: '审核管理',
            children: [
                {
                    key: '/dashboard',
                    icon: <FileTextOutlined key="diary-list-icon" />,
                    label: '游记列表',
                }
            ]
        },
        {
            key: '/logout',
            icon: <LogoutOutlined key="logout-submenu-icon" />,
            label: '退出登录',
            onClick: handleLogout,
        }
    ];

    useEffect(() => {
        const fetchAvatarIcon = async () => {
            try {
                if (user?.user.user.avatar) {
                    const imageUrl = `http://localhost:5001/api/images/image?filename=${user.user.user.avatar}`;
                    setAvatarIcon(<Avatar key="user-avatar" src={imageUrl} />);
                } else {
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
                width={250}
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
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={['/diary', '/permission']}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
                <Header className={styles.header}>
                    {/* <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className={styles.trigger}
                    /> */}
                    <div className={styles.headerRight}>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className={styles.userInfo}>
                                {avatarIcon}
                                <span className={styles.username}>{user?.user.user.nickname}</span>
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