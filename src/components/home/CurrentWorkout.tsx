import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import { ProgressCircle } from '../ui/ProgressCircle';
import { motion } from 'framer-motion';

interface CurrentWorkoutProps {
  workout?: {
    id: string;
    title: string;
    description: string;
    duration: number;
    courseTitle: string;
    progress: number;
  };
}

export const CurrentWorkout: React.FC<CurrentWorkoutProps> = ({ workout }) => {
  if (!workout) {
    return (
      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-5">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg\" className="h-8 w-8\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
                <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Нет активных тренировок</h3>
            <p className="text-white/80 mb-4">
              Выберите курс, чтобы начать заниматься
            </p>
            <Link to="/courses">
              <Button variant="gradient" className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20">
                Выбрать курс
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{workout.title}</h3>
          <div className="flex items-center text-white/80">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{workout.duration} мин</span>
          </div>
        </div>
        <p className="text-sm text-white/80">{workout.courseTitle}</p>
      </CardHeader>
      
      <CardContent className="flex items-center py-4">
        <div className="flex-1">
          <p className="text-white/90 text-sm line-clamp-2 mb-2">{workout.description}</p>
          <div className="relative">
            <div className="h-2 bg-white/20 rounded-full">
              <motion.div 
                className="h-2 bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${workout.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-white/70">Прогресс</span>
              <span className="text-white">{workout.progress}%</span>
            </div>
          </div>
        </div>
        
        <ProgressCircle 
          value={workout.progress} 
          size={80} 
          strokeWidth={6}
          color="#ffffff"
          trailColor="rgba(255,255,255,0.2)"
          className="ml-4"
          label={<span className="text-white font-bold text-xl">{workout.progress}%</span>}
        />
      </CardContent>
      
      <CardFooter className="bg-gradient-to-b from-transparent to-indigo-600/50 pt-2">
        <Link to={`/workout/${workout.id}`} className="w-full">
          <Button 
            variant="gradient" 
            fullWidth
            className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            Продолжить
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};