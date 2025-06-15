import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ProgressCircle } from '../ui/ProgressCircle';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  progress?: number;
  color?: string;
  bgGradient?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  progress,
  color = '#4f46e5',
  bgGradient = 'from-indigo-50 to-purple-50',
  className = '',
}) => {
  return (
    <Card className={`bg-gradient-to-br ${bgGradient} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center">
          {progress !== undefined ? (
            <ProgressCircle 
              value={progress} 
              size={50} 
              strokeWidth={5}
              color={color}
              trailColor="rgba(229, 231, 235, 0.5)"
              label={
                <div className="w-8 h-8 rounded-full flex items-center justify-center\" style={{ backgroundColor: color }}>
                  <span className="text-white">{icon}</span>
                </div>
              }
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: color }}>
              <span className="text-white">{icon}</span>
            </div>
          )}
          
          <div className={progress !== undefined ? "ml-3" : "ml-3"}>
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};