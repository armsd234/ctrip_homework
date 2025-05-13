import React, { useState, useEffect } from 'react';
import { UserOutlined, FileOutlined, EyeOutlined, FlagOutlined, LikeOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import { useCallback } from 'react';
import { message } from 'antd';
import { getStatistics } from '../../services/api';
import { Table, Avatar } from 'antd';
// import { DualAxes } from '@ant-design/plots';
import DualAxesChart from '../../components/mychart'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const Mainindex = () => {
    const [searchTime, setsearchTime] = useState({
        startDate: null, // 开始日期
        endDate: null, // 结束日期
    });

    const [data, setData] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const response = await getStatistics({ ...searchTime });
            setData(response.data);
        } catch (error) {
            message.error('获取数据失败');
        }
    }, [searchTime]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Styling ---
    const containerStyle = {
        padding: '20px',

        minHeight: 'calc(100vh - 64px)',
    };

    const sectionTitleStyle = { // Style for main section titles like "每日统计"
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '15px',
        marginTop: '20px',
        color: '#333',
    };

    const cardGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '40px',
    };

    const cardStyle = {
        backgroundColor: '#fff',
        // We'll apply padding *inside* the card to handle the header/content separation
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden', // Ensures border-radius clips children if needed
    };

    const cardTitleStyle = { // Style for the main stats card titles
        fontSize: '16px',
        color: '#666',
        marginBottom: '10px',
    };

    const statValueStyle = {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px 20px 20px', // Apply bottom padding here
    };

    const statIconStyle = {
        fontSize: '30px',
        marginRight: '10px',
        color: '#555',
    };

    // NEW Styles for Pending Card Structure
    const pendingCardHeaderStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        padding: '20px 20px 15px 20px', // Padding top, sides, and bottom before divider
        borderBottom: '1px solid #eee', // The divider line
    };

    const pendingCardContentStyle = {
        padding: '15px 20px 20px 20px', // Padding top (below divider), sides, and bottom
    };

    const pendingItemStyle = {
        fontSize: '16px',
        color: '#666',
        marginBottom: '8px', // Margin between pending items (if more than one)
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const pendingValueStyle = (color) => ({
        fontSize: '24px',
        fontWeight: 'bold',
        color: color,
    });

    const chartContainerStyle = {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        height: '400px',
        marginBottom: '20px',
    };

    // 热门笔记表格列配置
    const columns = [
        {
            title: '排名',
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_, __, index) => index + 1
        },
        {
            title: '游记标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
        },
        {
            title: '作者',
            dataIndex: ['author', 'nickname'],
            key: 'author',
            width: 200,
            render: (nickname, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar
                        src={record.author.avatar ? `http://localhost:5001/api/images/image?filename=${record.author.avatar}` : null}
                        icon={<UserOutlined />}
                    />
                    <span>{nickname}</span>
                </div>
            )
        },
        {
            title: '点赞数',
            dataIndex: 'likesCount',
            key: 'likesCount',
            width: 100,
            render: (likes) => (
                <span>
                    <LikeOutlined style={{ marginRight: 8 }} />
                    {likes}
                </span>
            )
        },
        {
            title: '浏览量',
            dataIndex: 'views',
            key: 'views',
            width: 100,
            render: (views) => (
                <span>
                    <EyeOutlined style={{ marginRight: 8 }} />
                    {views}
                </span>
            )
        }
    ];

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', margin: 0, color: '#333' }}>仪表盘</h1>

                {/* <DatePicker.RangePicker onChange={(dates) => { if (dates) { setsearchTime({ startDate: dates[0], endDate: dates[1] }); } }} /> */}
            </div>

            {/* 顶部统计信息 */}
            <div style={cardGridStyle}>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总用户数</div>
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><UserOutlined /></span>
                        {data.totalUsers?.toLocaleString()}
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总笔记数</div>
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><FileOutlined /></span>
                        {data.totalTravelNotes?.toLocaleString()}
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总浏览量</div> {/* 添加顶部/侧边内边距 */}
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><EyeOutlined /></span>
                        {data.totalViews?.toLocaleString()}
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总举报数</div> {/* 添加顶部/侧边内边距 */}
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><FlagOutlined /></span>
                        {data.totalReports?.toLocaleString()}
                    </div>
                </div>
            </div>

            <div style={cardGridStyle}>
                {/* 待审核笔记卡片 */}
                <div style={cardStyle}>

                    <div style={pendingCardHeaderStyle}>待处理</div>

                    <div style={pendingCardContentStyle}>
                        <div style={pendingItemStyle}>
                            待审核笔记
                        </div>
                        <span style={pendingValueStyle('#1890ff')}>{data.pendingReviews}</span> {/* 蓝色 */}
                    </div>
                </div>

                <div style={cardStyle}>
                    <div style={pendingCardHeaderStyle}>待处理</div>
                    <div style={pendingCardContentStyle}>
                        <div style={pendingItemStyle}>
                            待处理举报
                        </div>
                        <span style={pendingValueStyle('#f5222d')}>{data.pendingReports}</span>
                    </div>
                </div>
            </div>

            {/* 每日统计图表 */}
            <div style={sectionTitleStyle}>每日统计</div>
            <div style={{ ...chartContainerStyle, height: '400px', background: '#fff', padding: '24px', borderRadius: '8px' }}>
                <DualAxesChart barData={data.newTravelNotePerDay} lineData={data.newUserPerDay}></DualAxesChart>
            </div>

            {/* 热门笔记排行 */}
            <div style={sectionTitleStyle}>热门笔记排行</div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
                <Table
                    columns={columns}
                    dataSource={data.top10TravelNotes || []}
                    rowKey="_id"
                    pagination={false}
                    style={{ marginTop: '16px' }}
                />
            </div>

        </div>
    );
}

export default Mainindex;