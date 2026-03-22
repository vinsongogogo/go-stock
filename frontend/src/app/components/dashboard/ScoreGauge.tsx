import { useState, useEffect, useRef } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const getSentimentLabel = (score: number): string => {
  if (score <= 20) return '极度悲观';
  if (score <= 40) return '悲观';
  if (score <= 60) return '中性';
  if (score <= 80) return '乐观';
  return '极度乐观';
};

export function ScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef<number | null>(null);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    const startScore = prevScoreRef.current;
    const endScore = score;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = startScore + (endScore - startScore) * easeOut;
      setAnimatedScore(currentScore);
      setDisplayScore(Math.round(currentScore));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevScoreRef.current = endScore;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score]);

  const label = getSentimentLabel(score);

  const sizeConfig = {
    sm: { width: 100, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
    md: { width: 140, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
    lg: { width: 180, stroke: 12, fontSize: 'text-5xl', labelSize: 'text-base' },
  };

  const { width, stroke, fontSize, labelSize } = sizeConfig[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const progress = (animatedScore / 100) * arcLength;

  const sentimentConfig = {
    greed: {
      color: '#00d4ff',
      glow: 'rgba(0, 212, 255, 0.4)',
      glowFilter: 'rgba(0, 212, 255, 0.66)',
    },
    neutral: {
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.4)',
      glowFilter: 'rgba(168, 85, 247, 0.66)',
    },
    fear: {
      color: '#ff4466',
      glow: 'rgba(255, 68, 102, 0.4)',
      glowFilter: 'rgba(255, 68, 102, 0.66)',
    },
  };

  const getSentimentKey = (s: number): 'greed' | 'neutral' | 'fear' => {
    if (s >= 60) return 'greed';
    if (s >= 40) return 'neutral';
    return 'fear';
  };

  const sentimentKey = getSentimentKey(animatedScore);
  const colors = sentimentConfig[sentimentKey];
  const uniqueId = `gauge-${sentimentKey}-${score}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showLabel && (
        <span className="text-xs uppercase tracking-wider text-gray-400 mb-3">
          市场情绪指数
        </span>
      )}

      <div className="relative" style={{ width, height: width }}>
        <svg
          className="overflow-visible"
          width={width}
          height={width}
          style={{ filter: `drop-shadow(0 0 12px ${colors.glowFilter})` }}
        >
          <defs>
            <linearGradient id={`gradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors.color} stopOpacity="1" />
            </linearGradient>
            <filter id={`glow-${uniqueId}`}>
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景轨道 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(135 ${width / 2} ${width / 2})`}
          />

          {/* 发光层 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={colors.color}
            strokeWidth={stroke + 6}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(135 ${width / 2} ${width / 2})`}
            opacity="0.3"
            filter={`url(#glow-${uniqueId})`}
          />

          {/* 进度弧 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${uniqueId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            transform={`rotate(135 ${width / 2} ${width / 2})`}
          />
        </svg>

        {/* 中心数值 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold text-foreground ${fontSize}`}
            style={{ textShadow: `0 0 30px ${colors.glowFilter}` }}
          >
            {displayScore}
          </span>
          {showLabel && (
            <span
              className={`${labelSize} font-semibold mt-1`}
              style={{ color: colors.color }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
