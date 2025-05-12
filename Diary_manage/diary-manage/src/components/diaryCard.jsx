import React, { useState, useRef } from 'react';
import { Typography } from 'antd';
import styles from './diaryCard.module.css';

const { Title, Paragraph } = Typography;

const DiaryCard = ({ title, image, content, video }) => {
    const [showVideo, setShowVideo] = useState(!!video);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hover, setHover] = useState(false);
    const videoRef = useRef(null);

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

    const handleVideoClick = (e) => {
        e.stopPropagation();
    };

    const handleVideoPlay = () => setIsPlaying(true);
    const handleVideoPause = () => setIsPlaying(false);

    return (
        <div className={styles.cardWrapper}>
            <div className={styles.imageBox} style={{ position: 'relative' }}>
                {video ? (
                    <>
                        <video
                            ref={videoRef}
                            src={`http://localhost:5001/api/images/video?filename=${video}`}
                            controls
                            className={styles.coverVideo}
                            style={{ zIndex: 2 }}
                            onClick={handleVideoClick}
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onPlay={handleVideoPlay}
                            onPause={handleVideoPause}
                        />
                        {hover && isPlaying && (
                            <div
                                className={styles.playButton}
                                style={{ zIndex: 4 }}
                                onClick={handlePauseClick}
                            >
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.4)" />
                                    <rect x="16" y="16" width="5" height="16" rx="2" fill="#fff" />
                                    <rect x="27" y="16" width="5" height="16" rx="2" fill="#fff" />
                                </svg>
                            </div>
                        )}
                        {!isPlaying && (
                            <div
                                className={styles.playButton}
                                style={{ zIndex: 4 }}
                                onClick={handlePlayClick}
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
