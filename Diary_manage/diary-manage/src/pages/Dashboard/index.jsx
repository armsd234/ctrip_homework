import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Select, Space, Button, Modal, Form, message } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getDiaryList, approveDiary, rejectDiary, deleteDiary } from '../../services/api';
import styles from './index.module.css';

const { Option } = Select;

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchText, setSearchText] = useState('');
    const [status, setStatus] = useState('all');
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [rejectForm] = Form.useForm();
    const { user } = useSelector((state) => state.auth);

    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const { current, pageSize } = params.page ? params : pagination;
            const response = await getDiaryList({
                page: current,
                pageSize,
                search: searchText,
                status: status !== 'all' ? status : undefined,
                ...params,
            });
            // console.log('Fetch Data Response:', response);
            setData(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                ...(params.page ? { current: params.page } : {}),
                ...(params.pageSize ? { pageSize: params.pageSize } : {})
            }));
        } catch (error) {
            message.error('获取数据失败');
        }
        setLoading(false);
    }, [searchText, status]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTableChange = (newPagination) => {
        fetchData({
            page: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };

    const handleApprove = async (record) => {
        try {
            await approveDiary(record.id);
            message.success('审核通过成功');
            fetchData();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleReject = async (values) => {
        try {
            await rejectDiary(selectedDiary.id, values.reason);
            message.success('已拒绝该游记');
            setRejectModalVisible(false);
            rejectForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleDelete = async (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这篇游记吗？此操作不可恢复。',
            onOk: async () => {
                try {
                    await deleteDiary(record.id);
                    message.success('删除成功');
                    fetchData();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const columns = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusMap = {
                    pending: { text: '待审核', color: 'orange' },
                    approved: { text: '已通过', color: 'green' },
                    rejected: { text: '未通过', color: 'red' },
                };
                return (
                    <span style={{ color: statusMap[status].color }}>
                        {statusMap[status].text}
                    </span>
                );
            },
        },
        {
            title: '发布时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'pending' && (
                        <>
                            <Button
                                key="approve"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => handleApprove(record)}
                            >
                                通过
                            </Button>
                            <Button
                                key="reject"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => {
                                    setSelectedDiary(record);
                                    setRejectModalVisible(true);
                                }}
                            >
                                拒绝
                            </Button>
                        </>
                    )}
                    {user?.role === 'admin' && (
                        <Button
                            key="delete"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        >
                            删除
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Card>
                <div className={styles.toolbar}>
                    <Space>
                        <Input
                            placeholder="搜索游记标题"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Select
                            value={status}
                            onChange={setStatus}
                            style={{ width: 120 }}
                        >
                            <Option key="all" value="all">全部状态</Option>
                            <Option key="pending" value="pending">待审核</Option>
                            <Option key="approved" value="approved">已通过</Option>
                            <Option key="rejected" value="rejected">未通过</Option>
                        </Select>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data.map(item => ({ ...item, key: item.id }))}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title="拒绝原因"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    rejectForm.resetFields();
                }}
                footer={null}
            >
                <Form form={rejectForm} onFinish={handleReject}>
                    <Form.Item
                        name="reason"
                        rules={[{ required: true, message: '请输入拒绝原因' }]}
                    >
                        <Input.TextArea rows={4} placeholder="请输入拒绝原因" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={() => setRejectModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                确认
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Dashboard; 