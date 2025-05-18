import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Table, Card, Input, Select, Space, Button, Modal, Form, message, Image, Typography, Carousel } from 'antd';
import { SearchOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { getDiaryList, approveDiary, rejectDiary, deleteDiary } from '../../services/api';
import { fetchAndCacheMedia, fetchAndCacheVideo, cleanupObjectURLs } from '../../utils/mediaCache';
import styles from './index.module.css';
import DiaryCard from '../../components/diaryCard';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

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
    const [carouselRef, setCarouselRef] = useState(null);
    const mediaUrls = useRef({});
    const [mediaUrlsVersion, setMediaUrlsVersion] = useState(0);
    const [refresh, setRefresh] = useState(false);

    const handleModalClose = useCallback(() => {
        setDetailModalVisible(false);
    }, []);

    const handleApprove = useCallback(async (record) => {
        try {
            await approveDiary(record._id);
            message.success('审核通过成功');
            setRefresh(prev => !prev);
        } catch (error) {
            message.error('操作失败');
        }
    }, []);

    const handleDelete = useCallback(async (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这篇游记吗？此操作不可恢复。',
            onOk: async () => {
                try {
                    await deleteDiary(record._id);
                    message.success('删除成功');
                    setRefresh(prev => !prev);
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    }, []);

    const handleReject = async (values) => {
        try {
            await rejectDiary(selectedDiary._id, values.reason);
            message.success('已拒绝该游记');
            setRejectModalVisible(false);
            rejectForm.resetFields();
            setRefresh(prev => !prev);
        } catch (error) {
            message.error('操作失败');
        }
    };

    const loadMediaUrl = useCallback(async (filename, isVideo = false) => {
        if (!filename) return;
        if (mediaUrls.current[filename]) return;

        try {
            const url = isVideo
                ? await fetchAndCacheVideo(filename)
                : await fetchAndCacheMedia(filename);

            if (url) {
                mediaUrls.current[filename] = url;
                setMediaUrlsVersion(v => v + 1);
            }
        } catch (error) {
            console.error('Error loading media:', error);
            message.error('加载媒体文件失败');
        }
    }, []);

    const handleViewDetail = useCallback((record) => {
        setSelectedDiaryDetail(record);
        setDetailModalVisible(true);
    }, []);

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

            // 预加载所有媒体文件
            response.data.forEach(record => {
                if (record.video) {
                    loadMediaUrl(record.video, true);
                } else if (record.images && record.images.length > 0) {
                    record.images.forEach(image => loadMediaUrl(image));
                }
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
    }, [searchText, status, loadMediaUrl]);

    const handleTableChange = useCallback((newPagination) => {
        console.log('useEffect triggered2');
        fetchData({
            page: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    }, [fetchData]);


    useEffect(() => {
        // console.log('useEffect triggered1:');
        fetchData();
    }, [fetchData, refresh]);

    useEffect(() => {
        return () => {
            cleanupObjectURLs();
        };
    }, []);

    const nextSlide = useCallback(() => {
        carouselRef?.next();
    }, [carouselRef]);

    const prevSlide = useCallback(() => {
        carouselRef?.prev();
    }, [carouselRef]);

    // Memoize columns definition
    const columns = useMemo(() => [
        {
            title: '作者',
            dataIndex: ['author', 'nickname'],
            key: 'author',
            width: 220,
            style: { fontSize: '18px' },
            render: (nickname, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar
                        size={46}
                        src={record.author.avatar ? `http://localhost:5001/api/images/image?filename=${record.author.avatar}` : null}
                        icon={<UserOutlined />}
                    />
                    <span style={{ fontSize: 20 }}>{nickname}</span>
                </div>
            )
        },
        {
            title: '内容预览',
            key: 'preview',
            render: (_, record) => (
                <DiaryCard
                    key={record._id}
                    onViewDetail={() => handleViewDetail(record)}
                    title={record.title}
                    image={record.images && record.images.length > 0 ? mediaUrls.current[record.images[0]] : ''}
                    content={record.content}
                    video={record.video ? mediaUrls.current[record.video] : null}
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
            )
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
    ], [handleViewDetail, handleApprove, handleDelete, user, mediaUrlsVersion]);

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
                {/* <Link ></Link> */}

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
                onCancel={handleModalClose}
                width={800}
                style={{ top: 20, padding: 0 }}
                footer={null}
            >
                {selectedDiaryDetail && (
                    <div className={styles.diaryDetail}>
                        <h2>{selectedDiaryDetail.title}</h2>
                        <div className={styles.authorInfo}>
                            <span>作者：{selectedDiaryDetail.author?.nickname}</span>
                            <span>发布时间：{formatDate(selectedDiaryDetail.createdAt)}</span>
                            <span>分类：{selectedDiaryDetail.category || '旅行'}</span>
                        </div>
                        <div className={styles.travelInfo}>
                            <div className={styles.travelInfoItem}>
                                <span className={styles.travelInfoLabel}>目的地：</span>
                                <span className={styles.travelInfoValue}>{selectedDiaryDetail.location || '未设置'}</span>
                            </div>
                            <div className={styles.travelInfoItem}>
                                <span className={styles.travelInfoLabel}>出行时间：</span>
                                <span className={styles.travelInfoValue}>{selectedDiaryDetail.when || '未设置'}</span>
                            </div>
                            <div className={styles.travelInfoItem}>
                                <span className={styles.travelInfoLabel}>出行天数：</span>
                                <span className={styles.travelInfoValue}>{selectedDiaryDetail.days || '0'} 天</span>
                            </div>
                            <div className={styles.travelInfoItem}>
                                <span className={styles.travelInfoLabel}>花费金额：</span>
                                <span className={styles.travelInfoValue}>¥ {selectedDiaryDetail.money || '0'}</span>
                            </div>
                            <div className={styles.travelInfoItem}>
                                <span className={styles.travelInfoLabel}>和谁出行：</span>
                                <span className={styles.travelInfoValue}>{selectedDiaryDetail.who || '0'} 人</span>
                            </div>
                        </div>
                        <div className={styles.imageGallery}>
                            {selectedDiaryDetail.video ? (
                                <div style={{ display: 'block' }}>
                                    {mediaUrls.current[selectedDiaryDetail.video] ? (
                                        <video
                                            key={mediaUrls.current[selectedDiaryDetail.video]}
                                            src={mediaUrls.current[selectedDiaryDetail.video]}
                                            controls
                                            className={styles.coverVideo}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        <div className={styles.loading}>加载中...</div>
                                    )}
                                </div>
                            ) : selectedDiaryDetail.images && selectedDiaryDetail.images.length > 0 ? (
                                <div className={styles.carouselContainer}>
                                    <Button
                                        icon={<LeftOutlined />}
                                        onClick={prevSlide}
                                        className={styles.carouselButton}
                                        style={{
                                            position: 'absolute',
                                            left: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 40,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                    <Carousel
                                        ref={setCarouselRef}
                                        dots={{ className: styles.carouselDots }}
                                        autoplay
                                    >
                                        {selectedDiaryDetail.images.map((image, index) => (
                                            <div key={index}>
                                                {mediaUrls.current[image] ? (
                                                    <Image
                                                        src={mediaUrls.current[image]}
                                                        alt={`图片 ${index + 1}`}
                                                        className={styles.carouselImage}
                                                        preview={false}
                                                    />
                                                ) : (
                                                    <div className={styles.loading}>加载中...</div>
                                                )}
                                            </div>
                                        ))}
                                    </Carousel>
                                    <Button
                                        icon={<RightOutlined />}
                                        onClick={nextSlide}
                                        className={styles.carouselButton}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 2,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 40,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                </div>
                            ) : null}
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