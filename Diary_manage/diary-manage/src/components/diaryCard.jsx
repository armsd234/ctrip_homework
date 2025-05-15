import React, { useState, useRef } from 'react';
import { Typography, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './diaryCard.module.css';

const { Title, Paragraph } = Typography;

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

const DiaryCard = ({
    id,
    title,
    image,
    content,
    video,
    status,
    createdAt,
    onApprove,
    onReject,
    onDelete,
    canDelete,
    canAudit,
    onViewDetail
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hover, setHover] = useState(false);
    const videoRef = useRef(null);

    // 鼠标进入video或暂停按钮时都显示按钮，离开video和按钮区域才隐藏
    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = (e) => {
        // 检查 relatedTarget 是否存在且是有效的 DOM 节点
        const currentTarget = e.currentTarget;
        const relatedTarget = e.relatedTarget;

        if (!currentTarget || !relatedTarget || !(currentTarget instanceof Node)) {
            setHover(false);
            return;
        }

        // 安全地检查 contains 关系
        try {
            if (!currentTarget.contains(relatedTarget)) {
                setHover(false);
            }
        } catch (error) {
            // 如果出现任何错误，默认隐藏悬停状态
            setHover(false);
        }
    };

    const handlePlayClick = (e) => {
        e.stopPropagation();
        setIsPlaying(true);
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.play();
            }
        }, 0);
    };

    const handlePauseClick = (e) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);



    return (
        <div className={styles.cardWrapper} >
            <div
                className={styles.imageBox}
                style={{ position: 'relative' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {video ? (
                    <>
                        <video
                            ref={videoRef}
                            src={`http://localhost:5001/api/images/video?filename=${video}`}
                            controls
                            className={styles.coverVideo}
                            style={{ zIndex: 2 }}
                            onClick={e => e.stopPropagation()}
                            onPlay={handleVideoPlay}
                            onPause={handleVideoPause}
                        />
                        {/* 悬停且正在播放时显示暂停按钮 */}
                        {hover && isPlaying && (
                            <div
                                className={styles.playButton}
                                style={{ zIndex: 4 }}
                                onClick={handlePauseClick}
                                tabIndex={-1}
                            >
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.4)" />
                                    <rect x="16" y="16" width="5" height="16" rx="2" fill="#fff" />
                                    <rect x="27" y="16" width="5" height="16" rx="2" fill="#fff" />
                                </svg>
                            </div>
                        )}
                        {/* 初始暂停时显示播放按钮 */}
                        {!isPlaying && (
                            <div
                                className={styles.playButton}
                                style={{ zIndex: 4 }}
                                onClick={handlePlayClick}
                                tabIndex={-1}
                            >
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.4)" />
                                    <polygon points="20,16 34,24 20,32" fill="#fff" />
                                </svg>
                            </div>
                        )}
                    </>
                ) : image ? (
                    <img src={`http://localhost:5001/api/images/image?filename=${image}`} alt="封面图" className={styles.coverImg} />
                ) : (
                    <div className={styles.noImg} />
                )}
            </div>
            <div className={styles.contentBox}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                    <div onClick={() => onViewDetail && onViewDetail()}>
                        <Title level={4} className={styles.title}>{title}</Title>
                        <Paragraph className={styles.previewText} ellipsis={{ rows: 2, tooltip: true }}>{content}</Paragraph>
                        <div className={styles.timeText}>{formatDate(createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 90 }}>
                        {canAudit && status === 'pending' && (
                            <div style={{ marginRight: 12 }}>
                                <Button type="primary" style={{ marginRight: 8, fontSize: 22, padding: '8px 16px' }} onClick={onApprove}>通过</Button>
                                <Button style={{ fontSize: 22, padding: '8px 16px' }} onClick={onReject}>拒绝</Button>
                            </div>
                        )}
                        {canDelete && status !== 'deleted' && (
                            <Popconfirm title="确定删除吗？" onConfirm={onDelete} okText="删除" cancelText="取消">
                                <Button type="text" danger icon={<DeleteOutlined />} style={{ fontSize: 32, padding: '8px' }} />
                            </Popconfirm>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaryCard;
