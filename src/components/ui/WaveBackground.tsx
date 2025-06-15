import React from 'react';

interface WaveBackgroundProps {
  className?: string;
  color?: string;
  opacity?: number;
  height?: number;
  width?: number;
  animationDuration?: number;
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({
  className = '',
  color = '#3B82F6',
  opacity = 0.5,
  height = 20,
  width = 100,
  animationDuration = 25,
}) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 overflow-hidden ${className}`} style={{ height: `${height}%` }}>
      <svg
        className="absolute bottom-0 w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
        shapeRendering="auto"
        style={{ width: `${width + 50}%`, height: '100%', transform: 'translateX(-25%)' }}
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g>
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="0"
            fill={color}
            fillOpacity={opacity - 0.2}
            style={{
              animation: `waveAnimation ${animationDuration}s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite`,
              animationDelay: `-${animationDuration * 0.1}s`,
            }}
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="3"
            fill={color}
            fillOpacity={opacity - 0.1}
            style={{
              animation: `waveAnimation ${animationDuration * 0.8}s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite`,
              animationDelay: `-${animationDuration * 0.2}s`,
            }}
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="5"
            fill={color}
            fillOpacity={opacity}
            style={{
              animation: `waveAnimation ${animationDuration * 0.6}s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite`,
              animationDelay: `-${animationDuration * 0.3}s`,
            }}
          />
          <use
            xlinkHref="#gentle-wave"
            x="48"
            y="7"
            fill={color}
            fillOpacity={opacity + 0.1}
            style={{
              animation: `waveAnimation ${animationDuration * 0.4}s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite`,
              animationDelay: `-${animationDuration * 0.4}s`,
            }}
          />
        </g>
        <style>
          {`
          @keyframes waveAnimation {
            0% {
              transform: translateX(-10%);
            }
            50% {
              transform: translateX(-35%);
            }
            100% {
              transform: translateX(-60%);
            }
          }
        `}
        </style>
      </svg>
    </div>
  );
};