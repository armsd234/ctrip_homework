import React, { useState, useRef } from 'react';
import { Typography } from 'antd';
import styles from './diaryCard.module.css';

const { Title, Paragraph } = Typography;

const DiaryCard = ({ title, image, content, video }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hover, setHover] = useState(false);
    const videoRef = useRef(null);

    // 鼠标进入video或暂停按钮时都显示按钮，离开video和按钮区域才隐藏
    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = (e) => {
        // 只有当鼠标离开video和暂停按钮区域时才隐藏
        if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
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
        <div className={styles.cardWrapper}>
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
                <Title level={4} className={styles.title}>{title}</Title>
                <Paragraph className={styles.previewText} ellipsis={{ rows: 3, tooltip: true }}>{content}</Paragraph>
            </div>
        </div>
    );
};

export default DiaryCard;
