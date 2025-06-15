import React from 'react';
import { Activity, Clock, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';

interface StatsSummaryProps {
  totalWorkouts: number;
  totalTime: number;
  currentStreak: number;
  achievements: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  totalWorkouts,
  totalTime,
  currentStreak,
  achievements
}) => {
  // Преобразуем время из минут в часы и минуты
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;
  
  const stats = [
    {
      icon: <Activity size={16} />,
      label: "Трен-ка",
      value: totalWorkouts,
      bgGradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/20"
    },
    {
      icon: <Clock size={16} />,
      label: "Время",
      value: hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`,
      bgGradient: "from-green-500 to-teal-600",
      iconBg: "bg-green-400/20"
    },
    {
      icon: <Calendar size={16} />,
      label: "Серия",
      value: `${currentStreak} дн.`,
      bgGradient: "from-orange-500 to-amber-600",
      iconBg: "bg-orange-400/20"
    },
    {
      icon: <Trophy size={16} />,
      label: "Награды",
      value: achievements,
      bgGradient: "from-purple-500 to-violet-600",
      iconBg: "bg-purple-400/20"
    }
  ];
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-2 gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <Card className={`overflow-hidden bg-gradient-to-br ${stat.bgGradient} hover:shadow-md transition-shadow duration-300`}>
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.iconBg} text-white mr-3 flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/80">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};