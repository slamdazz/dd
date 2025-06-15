import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react'; // Добавил Loader2
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { StatsSummary } from '../components/home/StatsSummary';
import { CurrentWorkout } from '../components/home/CurrentWorkout';
import { ActivityGraph } from '../components/home/ActivityGraph';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { WaveBackground } from '../components/ui/WaveBackground';
import { useAuthStore } from '../store/authStore';
import { CalorieTracker } from '../components/nutrition/CalorieTracker';
import { NutritionRecommendation } from '../components/nutrition/NutritionRecommendation';
import { getCourses, type Course } from '../lib/supabase';
import { getUserStats, getUserActivity, getCurrentWorkout, type ActivityData } from '../lib/stats';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalTime: 0,
    currentStreak: 0,
    achievements: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('hasSeenOnboarding')) {
      localStorage.removeItem('hasSeenOnboarding');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
        setIsLoading(false); // Если нет пользователя, прекращаем загрузку
        return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userStats = await getUserStats(user.id);
        setStats(userStats);
        
        const activity = await getUserActivity(user.id);
        setActivityData(activity);
        
        const workout = await getCurrentWorkout(user.id);
        setCurrentWorkout(workout);
        
        const { data: coursesData, error: coursesError } = await getCourses();
        if (coursesError) throw coursesError;
        
        if (coursesData && coursesData.length > 0) {
          const shuffled = [...coursesData].sort(() => 0.5 - Math.random());
          setCourses(shuffled.slice(0, 3));
        }
        
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        // Можно установить состояние ошибки здесь, если нужно отобразить ее пользователю
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, user]);
  
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

  const getLevelDisplayData = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return { text: 'Начинающий', className: 'bg-green-100 text-green-800' };
      case 'intermediate':
        return { text: 'Средний', className: 'bg-blue-100 text-blue-800' };
      case 'advanced':
        return { text: 'Продвинутый', className: 'bg-purple-100 text-purple-800' };
      default:
        return { text: 'Не указан', className: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // Лендинг для неавторизованных пользователей
  if (!isAuthenticated) {
    return (
      <Layout fullScreen>
        <div className="h-full flex flex-col bg-gradient-to-b from-indigo-700 via-purple-700 to-pink-700 text-white"> {/* Изменен градиент для соответствия */}
          <div className="absolute inset-0 bg-pattern opacity-5"></div> {/* Уменьшил opacity паттерна */}
          <WaveBackground color="rgba(255,255,255,0.05)" opacity={1} height={40} /> {/* Светлые волны с низкой opacity */}
          
          <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-8">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-10 sm:mt-16 text-center sm:text-left" // Центрирование на мобильных
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight"> {/* Адаптивный размер шрифта */}
                Измени свою жизнь с помощью тренировок
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100 mb-8 sm:mb-10">
                Персонализированные программы тренировок в твоем телефоне
              </p>
            </motion.div>
            
            <motion.div 
              className="mb-8 sm:mb-12 space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/register" className="block">
                <Button 
                  fullWidth 
                  size="lg" 
                  className="text-base sm:text-lg h-12 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg" // Добавлены hover и shadow
                  glassmorphism
                >
                  Начать бесплатно
                </Button>
              </Link>
              <Link to="/login" className="block">
                <Button 
                  fullWidth 
                  variant="outline" 
                  size="lg" 
                  className="text-base sm:text-lg h-12 sm:h-14 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm shadow-lg" // Добавлены hover и shadow
                  glassmorphism
                >
                  Войти
                </Button>
              </Link>
            </motion.div>
          </div>
          
          {/* Блок "Почему ФитнесПро?" */}
          <div className="relative z-10 bg-black/10 backdrop-blur-lg rounded-t-3xl p-6 sm:p-8 space-y-6 border-t border-white/10"> {/* Увеличил отступы и изменил фон */}
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 text-center">
              Почему ФитнесПро?
            </h2>
            
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show" // Анимация при появлении в поле зрения
              viewport={{ once: true, amount: 0.3 }} // Настройки viewport для анимации
              className="space-y-4"
            >
              {[
                { title: "Программы для вас", desc: "Тренировки адаптируются под ваш уровень", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>, gradient: "from-blue-500/50 to-cyan-500/50" },
                { title: "Проверенные методики", desc: "Программы от профессиональных тренеров", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, gradient: "from-green-500/50 to-teal-500/50" },
                { title: "Поддержка сообщества", desc: "Мотивация от единомышленников", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, gradient: "from-purple-500/50 to-violet-500/50" },
              ].map((feature, idx) => (
                <motion.div variants={item} key={idx}>
                  <Card glassmorphism className={`bg-gradient-to-r ${feature.gradient} border-white/10 shadow-lg`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-base sm:text-lg mb-0.5 sm:mb-1">{feature.title}</h3>
                          <p className="text-white/80 text-sm sm:text-base">{feature.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              variants={item} // Можно использовать тот же item или создать новый для кнопки
              initial="hidden" // Если используется whileInView, initial можно не указывать здесь
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="mt-6 sm:mt-8" // Увеличен отступ
            >
              <Link to="/register" className="block">
                <Button 
                  fullWidth 
                  className="h-12 sm:h-14 text-base sm:text-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 shadow-lg"
                  glassmorphism
                >
                  Начать сейчас
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Дашборд для авторизованных пользователей
  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Шапка дашборда */}
        <div className="relative overflow-hidden">
          {/* Используем более насыщенный градиент для дашборда */}
          <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 pt-6 pb-12 sm:pt-8 sm:pb-16">
            <div className="relative z-10 px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Привет, {user?.username}!
                </h1>
                <p className="text-indigo-100 text-sm sm:text-base"> {/* Уменьшил шрифт для мобильных */}
                  Готовы к тренировке сегодня?
                </p>
              </motion.div>
              
              <div className="mt-6 sm:mt-8">
                <StatsSummary
                  totalWorkouts={stats.totalWorkouts}
                  totalTime={stats.totalTime}
                  currentStreak={stats.currentStreak}
                  achievements={stats.achievements}
                />
              </div>
            </div>
            <WaveBackground className="z-0" color="rgba(255,255,255,0.05)" opacity={1} height={30}/>
          </div>
        </div>
        
        {/* Основной контент дашборда */}
        <div className="flex-1 bg-gray-100 -mt-8 sm:-mt-10 rounded-t-3xl px-4 sm:px-6 pt-5 sm:pt-6 pb-24"> {/* Увеличены отступы и изменен фон */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
              <p className="text-gray-600">Загрузка ваших данных...</p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <motion.div variants={item} initial="hidden" animate="show" transition={{delay: 0.1}}>
                <ActivityGraph 
                  data={activityData}
                  title="Ваша активность"
                  subtitle="За неделю"
                  activeDay={activityData[activityData.length - 1]?.day}
                  // Оставляем градиент для графика, он хорошо смотрится на светлом фоне
                  className="bg-gradient-to-br from-purple-600 to-indigo-700 shadow-lg" 
                />
              </motion.div>
              
              <motion.div variants={item} initial="hidden" animate="show" transition={{delay: 0.2}}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Текущая тренировка
                  </h2>
                </div>
                <CurrentWorkout workout={currentWorkout} />
              </motion.div>

              <motion.div
                variants={item} initial="hidden" animate="show" transition={{delay: 0.3}}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" // Для больших экранов можно в 2 колонки
              >
                <CalorieTracker />
                <NutritionRecommendation />
              </motion.div>
              
              <motion.div variants={item} initial="hidden" animate="show" transition={{delay: 0.4}} className="pb-10">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Рекомендуемые курсы
                  </h2>
                  <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 text-sm sm:text-base font-medium flex items-center">
                    Все курсы
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
                
                <div className="space-y-4"> 
                  {courses.length > 0 ? (
                    courses.map((course, index) => {
                      const levelData = getLevelDisplayData(course.level);
                      return (
                        <Link to={`/courses/${course.id}`} key={course.id} className="block group">
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} // Уменьшил y
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }} // Уменьшил шаг задержки
                          >
                            <Card className="overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 bg-white">
                              <div className="relative h-40 sm:h-44"> 
                                <img 
                                  src={course.image_url || 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                  <span className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-md font-semibold text-white ${levelData.className.replace('bg-', 'bg-opacity-80 backdrop-blur-sm bg-').replace('text-','text-')} shadow-sm`}>
                                    {levelData.text}
                                  </span>
                              </div>
                              <CardContent className="p-3 sm:p-4">
                                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate group-hover:text-indigo-600 transition-colors">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">{course.description}</p>
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-gray-500">{course.duration} дней</p>
                                  <ArrowUpRight size={18} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="w-full text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                      <p>Рекомендуемые курсы появятся здесь позже.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
