import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowLeft, Clock, Play, Check, Heart } from 'lucide-react';
import { ProgressCircle } from '../components/ui/ProgressCircle';
import { Course, Workout, UserProgress } from '../types';
import { getCourseById, getCourseWorkout, getUserCourseProgress, isUserEnrolledInCourse, enrollUserInCourse, 
  isCourseFavorite, addCourseToFavorites, removeCourseFromFavorites } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'program' | 'about'>('program');
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { user } = useAuthStore();
  
  // Анимация для компонентов
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
  
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id || !user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Получаем данные курса
        const { data: courseData, error: courseError } = await getCourseById(id);
        
        if (courseError) {
          console.error('Ошибка при получении данных курса:', courseError);
          setError('Не удалось загрузить данные курса');
          setIsLoading(false);
          return;
        }
        
        if (!courseData) {
          setError('Курс не найден');
          setIsLoading(false);
          return;
        }
        
        // Получаем тренировку курса
        const { data: workoutData, error: workoutError } = await getCourseWorkout(id);
        
        if (workoutError) {
          console.error('Ошибка при получении тренировки:', workoutError);
          // Не показываем ошибку, если просто нет тренировки
        }
        
        // Проверяем, записан ли пользователь на курс
        const { isEnrolled: userEnrolled, error: enrolledError } = await isUserEnrolledInCourse(user.id, id);
        
        if (enrolledError && enrolledError.code !== 'PGRST116') {
          console.error('Ошибка при проверке записи на курс:', enrolledError);
        }
        
        // Если пользователь записан на курс, получаем его прогресс
        let progressData = null;
        if (userEnrolled) {
          const { data: progress, error: progressError } = await getUserCourseProgress(user.id, id);
          
          if (progressError && progressError.code !== 'PGRST116') {
            console.error('Ошибка при получении прогресса:', progressError);
          } else if (progress) {
            progressData = progress;
          }
        }

        // Проверяем, добавлен ли курс в избранное
        const { isFavorite: userFavorite } = await isCourseFavorite(user.id, id);
        setIsFavorite(userFavorite);
        
        // Устанавливаем данные в state
        setCourse(courseData);
        setWorkout(workoutData);
        setUserProgress(progressData);
        setIsEnrolled(userEnrolled);
      } catch (error) {
        console.error('Ошибка при загрузке данных курса:', error);
        setError('Произошла непредвиденная ошибка');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, user]);
  
  const handleEnroll = async () => {
    if (!user || !id) return;
    
    try {
      const { error } = await enrollUserInCourse(user.id, id);
      if (error) {
        console.error('Ошибка при записи на курс:', error);
        return;
      }
      
      setIsEnrolled(true);
      // Обновляем данные о прогрессе
      const { data, error: progressError } = await getUserCourseProgress(user.id, id);
      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Ошибка при получении прогресса:', progressError);
      } else {
        setUserProgress(data);
      }
    } catch (error) {
      console.error('Ошибка при записи на курс:', error);
    }
  };

  // Функция для добавления/удаления курса из избранного
  const handleToggleFavorite = async () => {
    if (!user || !id) return;

    try {
      if (isFavorite) {
        await removeCourseFromFavorites(user.id, id);
        setIsFavorite(false);
      } else {
        await addCourseToFavorites(user.id, id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса избранного:', error);
    }
  };
  
  // Функция для отображения уровня сложности на русском
  const getLevelName = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Начинающий';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return 'Не указан';
    }
  };
  
  // Функция для отображения цвета уровня сложности
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'intermediate':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'advanced':
        return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
          <span className="ml-2 text-gray-600">Загрузка курса...</span>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Возможно, у вас нет доступа к этому курсу или он был удален.</p>
          <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
        </div>
      </Layout>
    );
  }
  
  if (!course) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Курс не найден</h2>
          <p className="text-gray-600 mb-6">К сожалению, запрашиваемый вами курс не существует или был удален.</p>
          <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Шапка курса */}
        <div className="relative">
          <div className="relative">
            <div className="h-56 bg-gradient-to-br from-indigo-600 to-purple-700">
              <img 
                src={course.image_url || 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                alt={course.title}
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
            </div>
            
            <button 
              onClick={() => navigate(-1)} 
              className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <ArrowLeft size={20} />
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`absolute top-4 right-4 w-10 h-10 ${isFavorite ? 'bg-red-500' : 'bg-black/30'} backdrop-blur-sm rounded-full flex items-center justify-center text-white`}
            >
              <Heart size={20} className={isFavorite ? 'fill-white' : ''} />
            </button>
            
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6 text-white">
              <h1 className="text-xl font-bold mb-2">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getLevelColor(course.level)}`}>
                  {getLevelName(course.level)}
                </span>
                <div className="flex items-center text-white/80">
                  <Clock size={14} className="mr-1" />
                  <span>{course.duration} мин</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Основной контент */}
        <div className="flex-1 bg-gray-50 px-4 pt-6 pb-24">
          {/* Кнопка записаться/продолжить */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            {!isEnrolled ? (
              <Button 
                onClick={handleEnroll} 
                fullWidth 
                variant="gradient"
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                Записаться на курс
              </Button>
            ) : (
              <div>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-700 font-medium">Ваш прогресс:</p>
                    <p className="text-sm font-semibold text-indigo-600">
                      {userProgress?.completed ? 'Завершено' : 'В процессе'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: userProgress?.completed ? '100%' : '0%'
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                
                {workout && !userProgress?.completed && (
                  <Link to={`/workout/${workout.id}`}>
                    <Button 
                      fullWidth
                      variant="gradient"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      <Play size={16} className="mr-2" />
                      Начать тренировку
                    </Button>
                  </Link>
                )}
                
                {userProgress?.completed && (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Check size={24} className="mx-auto text-green-600 mb-2" />
                    <p className="text-green-800 font-medium">Курс завершен!</p>
                    <p className="text-green-600 text-sm">Отличная работа!</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
          
          {/* Вкладки */}
          <div className="mb-4 border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'program' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('program')}
              >
                Программа
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === 'about' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('about')}
              >
                О курсе
              </button>
            </div>
          </div>
          
          {/* Контент вкладок */}
          <div>
            {activeTab === 'program' && (
              <motion.div 
                className="space-y-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {workout ? (
                  <motion.div variants={item}>
                    <Link 
                      to={`/workout/${workout.id}`}
                      className="block active:scale-98 transition-transform"
                    >
                      <Card className={`
                        overflow-hidden
                        ${userProgress?.completed 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' 
                          : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                        }
                      `}>
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center mr-3
                              ${userProgress?.completed 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                              }
                            `}>
                              {userProgress?.completed ? (
                                <Check size={18} />
                              ) : (
                                <Play size={18} />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-medium ${userProgress?.completed ? 'text-green-800' : 'text-indigo-800'}`}>
                                {workout.title}
                              </h3>
                              <p className={`text-sm ${userProgress?.completed ? 'text-green-600' : 'text-indigo-600'} line-clamp-1`}>
                                {workout.description}
                              </p>
                            </div>
                            <div className="flex items-center text-gray-500 ml-2">
                              <Clock size={14} className={`mr-1 ${userProgress?.completed ? 'text-green-500' : 'text-indigo-500'}`} />
                              <span className="text-sm">{workout.duration} мин</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600">Для этого курса еще не добавлена тренировка</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'about' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">{course.description}</p>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">Чему вы научитесь</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700">
                  <li>Основным техникам и правильной форме выполнения упражнений</li>
                  <li>Как правильно дышать во время тренировки</li>
                  <li>Созданию собственной программы тренировок</li>
                  <li>Мотивации и постановке реалистичных целей</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">Для кого этот курс</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700">
                  <li>Новичков, которые хотят начать заниматься спортом</li>
                  <li>Людей, желающих улучшить физическую форму</li>
                  <li>Тех, кто хочет тренироваться дома</li>
                  <li>Всех, кто стремится к здоровому образу жизни</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">Требования</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Никакого предварительного опыта не требуется</li>
                  <li>Удобная спортивная одежда</li>
                  <li>Коврик для упражнений (по желанию)</li>
                  <li>15-45 минут свободного времени</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};