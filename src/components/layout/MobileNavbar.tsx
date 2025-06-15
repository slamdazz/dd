import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, BookOpen, MessageCircle, Trophy, Activity, Calendar, Award, X, Users, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { getUserStats } from '../../lib/stats';
import { getUserAchievements } from '../../lib/supabase';

export const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [quickStatsOpen, setQuickStatsOpen] = useState(false);
  const [quickStats, setQuickStats] = useState({
    streak: 0,
    totalWorkouts: 0,
    achievements: [] as Array<{
      id: string;
      title: string;
      completed: boolean;
      progress?: number;
    }>
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  if (!isAuthenticated) return null;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/courses', icon: BookOpen, label: 'Курсы' },
    { path: null, icon: null, label: null }, // Пустой элемент для центральной кнопки
    { path: '/chat', icon: MessageCircle, label: 'Чат' },
    { path: '/profile', icon: User, label: 'Профиль' }
  ];

  // Мотивационные фразы с позитивной окраской
  const motivationalQuotes = [
    "Каждый день - новая победа! 💪",
    "Твоя сила растет с каждой тренировкой! 🔥",
    "Сегодня ты стал сильнее, чем вчера! ⭐",
    "Путь к успеху начинается с первого шага! 🚀",
    "Ты можешь больше, чем думаешь! 💎"
  ];

  // Случайная мотивационная фраза
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Загрузка реальных данных при открытии окна достижений
  const handleOpenQuickStats = async () => {
    if (!user) return;
    
    setQuickStatsOpen(true);
    setIsLoadingStats(true);
    
    try {
      // Загружаем статистику пользователя
      const stats = await getUserStats(user.id);
      
      // Загружаем достижения пользователя
      const { data: achievementsData, error } = await getUserAchievements(user.id);
      
      if (error) throw error;
      
      // Форматируем достижения (берем первые 3)
      const formattedAchievements = achievementsData?.slice(0, 3).map(item => ({
        id: item.achievement.id,
        title: item.achievement.title,
        completed: item.completed,
        progress: item.completed ? 100 : Math.round((item.progress / item.achievement.required_value) * 100)
      })) || [];
      
      setQuickStats({
        streak: stats.currentStreak,
        totalWorkouts: stats.totalWorkouts,
        achievements: formattedAchievements
      });
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      // Устанавливаем пустые данные в случае ошибки
      setQuickStats({
        streak: 0,
        totalWorkouts: 0,
        achievements: []
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-1 flex justify-around items-center z-10 md:hidden shadow-lg rounded-t-xl">
        {navItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.path === null ? (
              <div className="flex flex-col items-center justify-center w-1/5 relative\" style={{ height: '56px' }}>
                <button
                  onClick={handleOpenQuickStats}
                  className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center -mt-7 shadow-lg transform transition-transform active:scale-95"
                >
                  <Trophy className="text-white" size={24} />
                </button>
              </div>
            ) : (
              <Link 
                to={item.path} 
                className="flex flex-col items-center justify-center py-2 w-1/5 text-center relative"
                style={{ minHeight: '56px' }}
              >
                <div className="relative flex flex-col items-center p-1">
                  {isActive(item.path) && (
                    <motion.div 
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-xl bg-indigo-100"
                      transition={{ type: "spring", duration: 0.5 }}
                    ></motion.div>
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <item.icon 
                      size={24} 
                      className={`mb-1 ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-500'}`} 
                    />
                    <span className={`text-xs ${isActive(item.path) ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Кнопки администрирования для мобильных устройств */}
      {(isAdmin || isModerator) && (
        <div className="fixed bottom-20 right-4 z-20 md:hidden">
          <div className="flex flex-col gap-2">
            {isAdmin && (
              <>
                <Link 
                  to="/admin/users"
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <Users className="text-white\" size={20} />
                </Link>
                <Link 
                  to="/admin/courses"
                  className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <BookOpen className="text-white" size={20} />
                </Link>
              </>
            )}
            {(isModerator || isAdmin) && (
              <Link 
                to="/moderator/chat"
                className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <Shield className="text-white" size={20} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Всплывающее окно быстрого просмотра достижений */}
      <AnimatePresence>
        {quickStatsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-20"
              onClick={() => setQuickStatsOpen(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-30 max-h-[80vh] overflow-y-auto"
            >
              <div className="absolute right-4 top-4">
                <button 
                  onClick={() => setQuickStatsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="mb-6 text-center">
                <div className="inline-block p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-3">
                  <Trophy size={28} className="text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Ваши достижения</h2>
                <p className="text-indigo-600 font-medium">{randomQuote}</p>
              </div>
              
              {isLoadingStats ? (
                <div className="flex justify-center items-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Загрузка данных...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
                      <div className="flex flex-col items-center">
                        <Activity size={24} className="mb-2" />
                        <p className="text-xs text-white/90 mb-1">Тренировки</p>
                        <p className="text-2xl font-bold">{quickStats.totalWorkouts}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 rounded-xl shadow-lg">
                      <div className="flex flex-col items-center">
                        <Calendar size={24} className="mb-2" />
                        <p className="text-xs text-white/90 mb-1">Серия</p>
                        <p className="text-2xl font-bold">{quickStats.streak}</p>
                        <p className="text-xs text-white/70">дн.</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-4 rounded-xl shadow-lg">
                      <div className="flex flex-col items-center">
                        <Award size={24} className="mb-2" />
                        <p className="text-xs text-white/90 mb-1">Награды</p>
                        <p className="text-2xl font-bold">{quickStats.achievements.filter(a => a.completed).length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Последние достижения</h3>
                    {quickStats.achievements.length === 0 ? (
                      <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-indigo-100">
                        <Award size={36} className="mx-auto text-indigo-300 mb-3" />
                        <p className="text-gray-600 font-medium mb-1">Пока нет достижений</p>
                        <p className="text-gray-500 text-sm">Начните тренироваться, чтобы получить первые награды!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quickStats.achievements.map(achievement => (
                          <div 
                            key={achievement.id} 
                            className={`
                              flex items-center p-4 rounded-xl border shadow-sm transition-all
                              ${achievement.completed 
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
                                : 'bg-white border-gray-200 hover:border-gray-300'}
                            `}
                          >
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-sm
                              ${achievement.completed 
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                                : 'bg-gray-100 text-gray-500'}
                            `}>
                              <Award size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${achievement.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                                {achievement.title}
                              </h4>
                              {!achievement.completed && achievement.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${achievement.progress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{achievement.progress}% завершено</p>
                                </div>
                              )}
                            </div>
                            {achievement.completed && (
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                                ✓ Получено
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className="mt-6 text-center">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-600 italic px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100"
                >
                  "Твой успех - это результат твоих ежедневных усилий! Продолжай двигаться вперед! 🌟"
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};