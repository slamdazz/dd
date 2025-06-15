import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { Course } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { addCourseToFavorites, removeCourseFromFavorites, isCourseFavorite, getCourseEnrollmentCount } from '../../lib/supabase';

interface CourseListProps {
  courses: Course[];
  isLoading?: boolean;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterDuration, setFilterDuration] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteCourses, setFavoriteCourses] = useState<Record<string, boolean>>({});
  const [enrolledUsers, setEnrolledUsers] = useState<Record<string, number>>({});
  const { user } = useAuthStore();
  
  // Получение избранных курсов пользователя
  useEffect(() => {
    if (!user) return;
    
    const fetchFavorites = async () => {
      const favorites: Record<string, boolean> = {};
      
      for (const course of courses) {
        const { isFavorite } = await isCourseFavorite(user.id, course.id);
        favorites[course.id] = isFavorite;
      }
      
      setFavoriteCourses(favorites);
    };
    
    fetchFavorites();
  }, [courses, user]);
  
  // Получение реального количества записанных пользователей
  useEffect(() => {
    const fetchEnrollmentCounts = async () => {
      const enrollmentCounts: Record<string, number> = {};
      
      for (const course of courses) {
        const { count } = await getCourseEnrollmentCount(course.id);
        enrollmentCounts[course.id] = count;
      }
      
      setEnrolledUsers(enrollmentCounts);
    };
    
    fetchEnrollmentCounts();
  }, [courses]);
  
  // Фильтрация курсов
  const filteredCourses = courses.filter(course => {
    // Поиск по названию и описанию
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по уровню сложности
    const matchesLevel = filterLevel === '' || course.level === filterLevel;
    
    // Фильтр по продолжительности
    let matchesDuration = true;
    if (filterDuration === 'short') {
      matchesDuration = course.duration <= 7;
    } else if (filterDuration === 'medium') {
      matchesDuration = course.duration > 7 && course.duration <= 14;
    } else if (filterDuration === 'long') {
      matchesDuration = course.duration > 14;
    }
    
    return matchesSearch && matchesLevel && matchesDuration;
  });
  
  // Обработчик добавления/удаления из избранного
  const handleToggleFavorite = async (courseId: string) => {
    if (!user) return;
    
    try {
      if (favoriteCourses[courseId]) {
        // Удаляем из избранного
        await removeCourseFromFavorites(user.id, courseId);
        setFavoriteCourses({ ...favoriteCourses, [courseId]: false });
      } else {
        // Добавляем в избранное
        await addCourseToFavorites(user.id, courseId);
        setFavoriteCourses({ ...favoriteCourses, [courseId]: true });
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса избранного:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-4 text-gray-600">Загрузка курсов...</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Поиск курсов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter size={18} className="mr-2" />
            Фильтры
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уровень сложности</label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="">Все уровни</option>
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Продолжительность</label>
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="">Любая продолжительность</option>
                  <option value="short">Короткие (до 7 дней)</option>
                  <option value="medium">Средние (7-14 дней)</option>
                  <option value="long">Длинные (более 14 дней)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterLevel('');
                  setFilterDuration('');
                }}
                className="mr-2"
              >
                Сбросить
              </Button>
              <Button
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Применить
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {filteredCourses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Курсы не найдены</p>
          <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              usersCount={enrolledUsers[course.id] || 0}
              isFavorite={favoriteCourses[course.id] || false}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};