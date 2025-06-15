import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';
import { Course } from '../../types';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
  usersCount?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  usersCount = 0,
  isFavorite = false,
  onToggleFavorite
}) => {
  // Определение цвета метки в зависимости от уровня сложности
  const getLevelColor = () => {
    switch (course.level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Перевод уровня сложности на русский
  const getLevelName = () => {
    switch (course.level) {
      case 'beginner':
        return 'Начинающий';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return 'Неизвестно';
    }
  };

  // Предотвращаем переход при клике на кнопку избранного
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(course.id);
    }
  };
  
  return (
    <Link to={`/courses/${course.id}`} className="block">
      <motion.div 
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
      >
        <div className="relative h-48">
          <img 
            src={course.image_url || 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium ${getLevelColor()}`}>
            {getLevelName()}
          </div>
          <button 
            onClick={handleFavoriteClick}
            className={`absolute top-3 left-3 p-1.5 rounded-full ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-600 hover:bg-white hover:text-red-500'} backdrop-blur-sm transition-colors`}
          >
            <Heart size={18} className={isFavorite ? 'fill-white' : ''} />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{course.duration} мин</span>
            </div>
            
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>{usersCount}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};