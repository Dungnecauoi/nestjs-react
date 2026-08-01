import React, { useState, useRef } from 'react';
import { Button, Tag, Slider } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';

interface CustomAudioPlayerProps {
  url: string;
  filename: string;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ url, filename }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (val: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        backgroundColor: '#121215',
        color: '#ffffff',
        borderRadius: 16,
        border: '1px solid #27272a',
        padding: '16px 20px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={isPlaying ? <PauseOutlined style={{ fontSize: 20 }} /> : <CaretRightOutlined style={{ fontSize: 20 }} />}
          onClick={togglePlay}
          style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', width: 48, height: 48, minWidth: 48 }}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#ffffff', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
              {filename}
            </h4>
            <Tag color="purple" style={{ fontWeight: 700, borderRadius: 6, margin: 0 }}>
              AUDIO
            </Tag>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#a1a1aa', minWidth: 36 }}>{formatTime(currentTime)}</span>
            <Slider
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              tooltip={{ formatter: (val) => formatTime(val || 0) }}
              style={{ flex: 1, margin: 0 }}
            />
            <span style={{ fontSize: 11, color: '#a1a1aa', minWidth: 36 }}>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
