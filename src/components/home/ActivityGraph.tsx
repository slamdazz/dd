import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { LineChart } from '../ui/LineChart';

interface ActivityDataPoint {
  day: string;
  minutes: number;
}

interface ActivityGraphProps {
  data: ActivityDataPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  lineColor?: string;
  activeDay?: string;
}

export const ActivityGraph: React.FC<ActivityGraphProps> = ({
  data,
  title = 'Активность',
  subtitle,
  className = '',
  gradientFrom = 'rgba(168, 85, 247, 0.6)',
  gradientTo = 'rgba(168, 85, 247, 0)',
  lineColor = 'rgba(168, 85, 247, 1)',
  activeDay
}) => {
  // Подготовка данных для графика
  const chartData = data.map(item => ({
    label: item.day,
    value: item.minutes
  }));
  
  return (
    <Card className={`${className}`} glassmorphism>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base text-white">{title}</h3>
          {subtitle && <span className="text-xs text-white/70">{subtitle}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <LineChart 
            data={chartData} 
            height={150}
            gradientFrom={gradientFrom}
            gradientTo={gradientTo}
            lineColor={lineColor}
            showLabels={false}
          />
          
          {/* Маркер активного дня */}
          {activeDay && (
            <div className="absolute bottom-0 top-0 flex items-center justify-center" 
                 style={{ 
                   left: `${(data.findIndex(d => d.day === activeDay) / (data.length - 1)) * 100}%`, 
                   width: '10px',
                   transform: 'translateX(-50%)'
                 }}>
              <div className="h-full w-0.5 bg-purple-300 opacity-50"></div>
              <div className="absolute w-3 h-3 bg-purple-600 rounded-full" 
                   style={{ 
                     bottom: `${(data.find(d => d.day === activeDay)?.minutes || 0) / Math.max(...data.map(d => d.minutes)) * 80}%`
                   }}>
              </div>
            </div>
          )}
          
          {/* Дни недели */}
          <div className="flex justify-between mt-2">
            {data.map((point, i) => (
              <div 
                key={i} 
                className={`text-xs ${activeDay === point.day ? 'text-white font-medium' : 'text-white/70'}`}
              >
                {point.day}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};