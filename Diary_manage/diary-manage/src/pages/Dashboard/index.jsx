import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Input, Select, Space, Button, Modal, Form, message, Image, Typography } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getDiaryList, approveDiary, rejectDiary, deleteDiary } from '../../services/api';
import styles from './index.module.css';
import DiaryCard from '../../components/diaryCard';

const { Option } = Select;
const { Paragraph } = Typography;

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${day} ${h}:${min}:${s}`;
}

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
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedDiaryDetail, setSelectedDiaryDetail] = useState(null);

    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const { current, pageSize } = params.page ? params : { current: 1, pageSize: 10 };

            const response = await getDiaryList({
                page: current,
                pageSize,
                search: searchText,
                status: status,
                ...params,
            });
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
            await approveDiary(record._id);
            message.success('审核通过成功');
            fetchData();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleReject = async (values) => {
        try {
            await rejectDiary(selectedDiary._id, values.reason);
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
                    await deleteDiary(record._id);
                    message.success('删除成功');
                    fetchData();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleViewDetail = (record) => {
        setSelectedDiaryDetail(record);
        setDetailModalVisible(true);
    };

    const columns = [
        {
            title: '作者',
            dataIndex: ['author', 'nickname'],
            key: 'author',
            width: 180,
            style: { fontSize: '18px' },
        },
        {
            title: '内容预览',
            key: 'preview',
            render: (_, record) => (
                <DiaryCard
                    onViewDetail={() => handleViewDetail(record)}
                    title={record.title}
                    image={record.images && record.images.length > 0 ? record.images[0] : ''}
                    content={record.content}
                    video={record.video}
                    status={record.status}
                    createdAt={record.createdAt}
                    onApprove={() => handleApprove(record)}
                    onReject={() => {
                        setSelectedDiary(record);
                        setRejectModalVisible(true);
                    }}
                    onDelete={() => handleDelete(record)}
                    canDelete={user?.user.user.role === 'admin'}
                    canAudit={user?.user.user.role === 'reviewer' || user?.user.user.role === 'admin'}
                />
            ),
        },

        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const statusMap = {
                    pending: { text: '待审核', color: '#faad14' },
                    approved: { text: '已通过', color: '#52c41a' },
                    rejected: { text: '未通过', color: '#ff4d4f' },
                    deleted: { text: '已删除', color: '#aaa' },
                };
                const statusObj = statusMap[status] || statusMap['pending'];

                return (

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                border: `3px solid ${statusObj.color}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: statusObj.color,
                                fontWeight: 500,
                                fontSize: 18,
                                background: '#fff',
                            }}
                        >
                            {statusObj.text}
                        </div>
                    </div>
                );
            },
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
                            <Option key="deleted" value="deleted">已删除</Option>
                        </Select>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data.map(item => ({ ...item, key: item._id }))}
                    rowKey="_id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1100 }}
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

            <Modal
                title="游记详情"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                width={800}
                footer={null}
            >
                {selectedDiaryDetail && (
                    <div className={styles.diaryDetail}>
                        <h2>{selectedDiaryDetail.title}</h2>
                        <div className={styles.authorInfo}>
                            <span>作者：{selectedDiaryDetail.author?.nickname}</span>
                            <span>发布时间：{formatDate(selectedDiaryDetail.createdAt)}</span>
                        </div>
                        <div className={styles.imageGallery} style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                            {selectedDiaryDetail.video ? (
                                <>
                                    <video
                                        src={`http://localhost:5001/api/images/video?filename=${selectedDiaryDetail.video}`}
                                        controls
                                        className={styles.coverVideo}
                                        style={{ zIndex: 2 }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </>
                            ) : (
                                selectedDiaryDetail.images?.map((image, index) => (
                                    <span key={index} style={{ display: 'inline-block' }}>
                                        <Image
                                            src={`http://localhost:5001/api/images/image?filename=${image}`}
                                            alt={`图片 ${image}`}
                                            width={200}
                                            style={{ margin: '8px' }}
                                        />
                                    </span>
                                )))}
                        </div>
                        <div className={styles.content}>
                            <Paragraph>{selectedDiaryDetail.content}</Paragraph>
                        </div>
                        {selectedDiaryDetail.status === 'rejected' && (
                            <div className={styles.rejectionReason}>
                                <h3>拒绝原因：</h3>
                                <p>{selectedDiaryDetail.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Dashboard;