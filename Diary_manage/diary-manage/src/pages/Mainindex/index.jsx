import React from 'react';
import { UserOutlined, FileOutlined, EyeOutlined, FlagOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { getStatistics } from '../../services/api';

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
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getStatistics({ ...searchTime });
            setData(response.data);
        } catch (error) {
            message.error('获取数据失败');
        }
        setLoading(false);
    }, [searchTime]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // --- Mock Data ---
    const stats = {
        totalUsers: 1254,
        totalNotes: 3872,
        totalViews: 58961,
        totalReports: 125,
    };

    const pending = {
        pendingReviewNotes: 37,
        pendingReports: 12,
    };

    // --- Daily Stats Chart Data and Options (Keep as before) ---
    const dailyStatsData = {
        labels: ['2025-04-30', '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05', '2025-05-06'],
        datasets: [
            {
                type: 'bar',
                label: '新用户',
                backgroundColor: '#6A7ECA',
                borderColor: '#6A7ECA',
                data: [45, 15, 20, 18, 43, 35, 45],
                yAxisID: 'y-count',
            },
            {
                type: 'bar',
                label: '新笔记',
                backgroundColor: '#92C68F',
                borderColor: '#92C68F',
                data: [48, 25, 30, 28, 68, 65, 45],
                yAxisID: 'y-count',
            },
            {
                type: 'line',
                label: '访问量',
                borderColor: '#F4C36B',
                backgroundColor: 'rgba(244, 195, 107, 0.2)',
                data: [750, 800, 1000, 820, 1400, 1350, 1300],
                yAxisID: 'y-visits',
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#F4C36B',
            },
        ],
    };

    const dailyStatsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            'y-count': {
                type: 'linear',
                position: 'left',
                title: {
                    display: true,
                    text: '数量',
                },
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20,
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            'y-visits': {
                type: 'linear',
                position: 'right',
                title: {
                    display: true,
                    text: '访问量',
                },
                min: 0,
                max: 1500,
                ticks: {
                    stepSize: 300,
                },
                grid: {
                    drawOnChartArea: true,
                },
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
    };


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

    return (
        <div style={containerStyle}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', margin: 0, color: '#333' }}>仪表盘</h1>
                {/* Date Range Picker Placeholder */}
                <DatePicker.RangePicker onChange={(dates) => { if (dates) { setsearchTime({ startDate: dates[0], endDate: dates[1] }); } }} />
            </div>

            {/* Top Statistics */}
            <div style={cardGridStyle}>
                <div style={cardStyle}> {/* Use cardStyle for the outer container */}
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总用户数</div> {/* Add top/side padding */}
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><UserOutlined /></span>
                        {stats.totalUsers.toLocaleString()}
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总笔记数</div> {/* Add top/side padding */}
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><FileOutlined /></span>
                        {stats.totalNotes.toLocaleString()}
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总浏览量</div> {/* Add top/side padding */}
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><EyeOutlined /></span>
                        {stats.totalViews.toLocaleString()}
                    </div>
                </div>
                <div style={cardStyle}>
                    <div style={{ ...cardTitleStyle, padding: '20px 20px 0 20px' }}>总举报数</div> {/* Add top/side padding */}
                    <div style={statValueStyle}>
                        <span style={statIconStyle}><FlagOutlined /></span>
                        {stats.totalReports.toLocaleString()}
                    </div>
                </div>
            </div>


            <div style={cardGridStyle}>
                {/* Pending Reviews Card */}
                <div style={cardStyle}> {/* Outer card container */}
                    {/* Header Area with Title and Divider */}
                    <div style={pendingCardHeaderStyle}>待处理</div>
                    {/* Content Area */}
                    <div style={pendingCardContentStyle}>
                        <div style={pendingItemStyle}>
                            待审核笔记

                        </div>
                        <span style={pendingValueStyle('#1890ff')}>{pending.pendingReviewNotes}</span> {/* Blue color */}
                        {/* Add more pending items here using pendingItemStyle if needed */}
                    </div>
                </div>

                {/* Pending Reports Card */}
                <div style={cardStyle}> {/* Outer card container */}
                    {/* Header Area with Title and Divider */}
                    <div style={pendingCardHeaderStyle}>待处理</div>
                    {/* Content Area */}
                    <div style={pendingCardContentStyle}>
                        <div style={pendingItemStyle}>
                            待处理举报
                        </div>
                        <span style={pendingValueStyle('#f5222d')}>{pending.pendingReports}</span>
                        {/* Add more pending items here using pendingItemStyle if needed */}
                    </div>
                </div>
            </div>

            {/* Daily Statistics Chart */}
            <div style={sectionTitleStyle}>每日统计</div>
            <div style={chartContainerStyle}>
                {/* <ChartJS
                    type='bar'
                    data={dailyStatsData}
                    options={dailyStatsOptions}
                /> */}
            </div>

            {/* Popular Notes Ranking Title */}
            <div style={sectionTitleStyle}>热门笔记排行</div>
            {/* Content for popular notes ranking would go here */}

        </div>
    );
};

export default Mainindex;