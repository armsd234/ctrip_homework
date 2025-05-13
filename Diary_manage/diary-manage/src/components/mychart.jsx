import React from 'react';
import ReactECharts from 'echarts-for-react';

const DualAxesChart = ({ barData = [], lineData = [] }) => {
    console.log('barData:', barData);
    console.log('lineData:', lineData);

    // 收集所有日期，去重并排序
    const dates = Array.from(
        new Set([...barData.map(d => d.date), ...lineData.map(d => d.date)])
    ).sort();

    // 提取柱状图数据
    const barCounts = dates.map(date => {
        const item = barData.find(d => d.date === date);
        return item ? item.count : 0;
    });

    // 提取折线图数据
    const lineCounts = dates.map(date => {
        const item = lineData.find(d => d.date === date);
        return item ? item.count : 0;
    });

    const option = {
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['新增笔记', '新增用户'],
        },
        xAxis: {
            type: 'category',
            data: dates,
        },
        yAxis: [
            {
                type: 'value',
                name: '笔记数',
            },
            {
                type: 'value',
                name: '用户数',
            },
        ],
        series: [
            {
                name: '新增笔记',
                type: 'bar',
                data: barCounts,
                yAxisIndex: 0,
                itemStyle: { color: '#73C0DE' },
            },
            {
                name: '新增用户',
                type: 'line',
                data: lineCounts,
                yAxisIndex: 1,
                smooth: true,
                itemStyle: { color: '#5470C6' },
            },
        ],
    };

    return <ReactECharts option={option} style={{ height: 400 }} />;
};

export default DualAxesChart;
