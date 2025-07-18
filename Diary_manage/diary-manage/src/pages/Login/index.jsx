import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate,useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import styles from './index.module.css';
import backgroundVideo from '../../assets/videos/background.gif';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            await dispatch(login(values)).unwrap();
            message.success('登录成功');
            console.log('location.state',location); // 打印 location.state 以确认其内容
            console.log('location.pathname',location.pathname);
            if (location.state?.from) {
                navigate(location.state.from);
                return;
            }
            console.log('das');
            navigate('/');
        } catch (error) {
            message.error(error.message || '登录失败');
        }
    };

    return (
        <div className={styles.container}>
            <img
                src={backgroundVideo}
                alt="background"
                className={styles.videoBackground}
            />
            <div className={styles.overlay} />
            <Card title="迹忆管理系统" className={styles.loginCard}>
                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input
                            prefix={<UserOutlined key="username-icon" />}
                            placeholder="用户名"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined key="password-icon" />}
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login; 