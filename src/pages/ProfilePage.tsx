import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { WaveBackground } from '../components/ui/WaveBackground';
import { LineChart } from '../components/ui/LineChart';
import { StatsCard } from '../components/profile/StatsCard';
import { motion } from 'framer-motion';
import { BarChart2, Award, Calendar, Clock, Medal, User, Heart, LogOut } from 'lucide-react'; // Импортируем LogOut
import { getUserAchievements, getUserFavoriteCourses } from '../lib/supabase';
import { CalorieTracker } from '../components/nutrition/CalorieTracker';
import { Course } from '../types';
import { getUserStats, getUserActivity, type ActivityData } from '../lib/stats';
import { Link, useNavigate } from 'react-router-dom'; // Добавляем useNavigate

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuthStore(); // Добавляем logout
  const navigate = useNavigate(); // Hook для навигации
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [weight, setWeight] = useState<string>(user?.weight?.toString() || '');
  const [height, setHeight] = useState<string>(user?.height?.toString() || '');
  const [goal, setGoal] = useState(user?.goal || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'favorites' | 'nutrition'>('profile');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalTime: 0,
    currentStreak: 0,
    achievements: 0
  });
  const [activityHistory, setActivityHistory] = useState<ActivityData[]>([]);

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Загружаем статистику пользователя
        const userStats = await getUserStats(user.id);
        setStats(userStats);
        
        // Загружаем активность пользователя
        const activity = await getUserActivity(user.id);
        setActivityHistory(activity);
        
        // Загружаем достижения пользователя
        const { data: achievementsData, error: achievementsError } = await getUserAchievements(user.id);
        if (achievementsError) throw achievementsError;
        
        if (achievementsData) {
          // Форматируем данные достижений
          const formattedAchievements = achievementsData.map(item => ({
            id: item.achievement.id,
            title: item.achievement.title,
            description: item.achievement.description,
            unlocked: item.completed,
            progress: Math.round((item.progress / item.achievement.required_value) * 100)
          }));
          
          setAchievements(formattedAchievements);
        }
        
        // Загружаем избранные курсы пользователя
        const { data: favoritesData, error: favoritesError } = await getUserFavoriteCourses(user.id);
        if (favoritesError) throw favoritesError;

        
        if (favoritesData) {
          // Форматируем данные избранных курсов
          const formattedFavorites = favoritesData.map(item => item.courses).filter(Boolean) as Course[];
          setFavoriteCourses(formattedFavorites);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Преобразуем данные активности для графика
  const chartData = activityHistory.map(item => ({
    label: item.day,
    value: item.minutes
  }));
  
  // Имитируем получение данных профиля
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      setWeight(user.weight?.toString() || '');
      setHeight(user.height?.toString() || '');
      setGoal(user.goal || '');
    } else {
      // Если пользователя нет (например, после выхода), перенаправляем на главную
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (password && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Обновление профиля в Supabase
      await updateProfile({
        username,
        full_name: fullName,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        goal
      });
      
      // Сброс полей пароля
      setPassword('');
      setConfirmPassword('');
      
      // Закрываем режим редактирования
      setIsEditing(false);
      setMessage('Профиль успешно обновлен');
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при обновлении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Перенаправляем на главную страницу после выхода
    } catch (error) {
      console.error("Ошибка при выходе из аккаунта:", error);
      setError("Не удалось выйти из аккаунта. Попробуйте снова.");
    }
  };
  
  const tabItems = [
    { id: 'profile', label: 'Профиль', icon: <User size={18} /> },
    { id: 'achievements', label: 'Достижения', icon: <Award size={18} /> },
    { id: 'favorites', label: 'Избранное', icon: <Heart size={18} /> },
    { id: 'nutrition', label: 'Питание', icon: <BarChart2 size={18} /> },
  ];

  if (!user) { // Если пользователя нет, можно показать загрузчик или пустую страницу
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p>Загрузка данных пользователя...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Градиентный хедер с аватаром пользователя */}
        <div className="relative">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-6 pb-20">
            <div className="relative z-10 px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/50"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-medium">
                      {username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                
                <h1 className="text-xl font-bold text-white mt-3">{username}</h1>
                <p className="text-indigo-100">{user?.email}</p>
                
                {!isEditing && activeTab === 'profile' && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 items-center">
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 w-full sm:w-auto"
                      glassmorphism
                    >
                      Редактировать профиль
                    </Button>
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="bg-red-500/20 backdrop-blur-sm text-red-100 border-red-400/30 hover:bg-red-500/30 w-full sm:w-auto"
                      glassmorphism
                    >
                      <LogOut size={16} className="mr-2" />
                      Выйти
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
            
            <WaveBackground 
              className="z-0"
              color="#c7d2fe"
              opacity={0.2}
            />
          </div>
        </div>
        
        {/* Вкладки */}
        <div className="bg-gray-50 -mt-16 rounded-t-3xl">
          <div className="flex overflow-x-auto pt-3 px-4 border-b border-gray-200 bg-white rounded-t-3xl">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 flex items-center whitespace-nowrap text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Контент вкладки */}
          <div className="px-4 pt-4 pb-16">
            {activeTab === 'profile' && (
              <>
                {isEditing ? (
                  <Card className="mb-6">
                    <CardContent className="p-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div className="p-3 bg-red-50 text-red-500 rounded-md">
                            {error}
                          </div>
                        )}
                        
                        {message && (
                          <div className="p-3 bg-green-50 text-green-500 rounded-md">
                            {message}
                          </div>
                        )}
                        
                        <Input
                          label="Имя пользователя"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                        
                        <Input
                          label="Полное имя"
                          value={fullName || ''}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Вес (кг)"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                          />
                          
                          <Input
                            label="Рост (см)"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Цель</label>
                          <select
                            value={goal || ''}
                            onChange={(e) => setGoal(e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg w-full"
                          >
                            <option value="">Выберите цель</option>
                            <option value="weight_loss">Снижение веса</option>
                            <option value="muscle_gain">Набор мышечной массы</option>
                            <option value="endurance">Повышение выносливости</option>
                            <option value="flexibility">Улучшение гибкости</option>
                            <option value="overall_health">Общее здоровье</option>
                          </select>
                        </div>
                        
                        <Input
                          label="Новый пароль"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        <Input
                          label="Подтверждение пароля"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            variant="gradient"
                            className="bg-gradient-to-r from-indigo-500 to-purple-600"
                            isLoading={isLoading}
                          >
                            Сохранить
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setPassword('');
                              setConfirmPassword('');
                              setUsername(user?.username || '');
                              setFullName(user?.full_name || '');
                              setWeight(user?.weight?.toString() || '');
                              setHeight(user?.height?.toString() || '');
                              setGoal(user?.goal || '');
                              setError(null);
                              setMessage(null);
                            }}
                          >
                            Отмена
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 gap-3 mb-6"
                    >
                      <StatsCard 
                        icon={<Award size={16} />}
                        title="Трен-ки"
                        value={stats.totalWorkouts}
                        color="#3b82f6"
                        bgGradient="from-blue-50 to-indigo-50"
                      />
                      
                      <StatsCard 
                        icon={<Clock size={16} />}
                        title="Время"
                        value={`${Math.floor(stats.totalTime / 60)}ч ${stats.totalTime % 60}м`}
                        color="#10b981"
                        bgGradient="from-green-50 to-emerald-50"
                      />
                      
                      <StatsCard 
                        icon={<Calendar size={16} />}
                        title="Текущая серия"
                        value={`${stats.currentStreak} дн.`}
                        color="#f59e0b"
                        bgGradient="from-orange-50 to-amber-50"
                      />
                      
                      <StatsCard 
                        icon={<Medal size={16} />}
                        title="Дост-ия"
                        value={achievements.filter(a => a.unlocked).length}
                        progress={achievements.length > 0 ? (achievements.filter(a => a.unlocked).length / achievements.length * 100) : 0}
                        color="#8b5cf6"
                        bgGradient="from-purple-50 to-violet-50"
                      />
                    </motion.div>
                    
                    {/* График активности */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-6"
                    >
                      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                        <CardHeader className="pb-0">
                          <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Ваша активность</h2>
                            <span className="text-xs text-white/70">За неделю</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <LineChart 
                            data={chartData}
                            height={160}
                            gradientFrom="rgba(192, 132, 252, 0.6)"
                            gradientTo="rgba(192, 132, 252, 0)"
                            lineColor="rgba(255, 255, 255, 0.8)"
                            pointColor="#fff"
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}
              </>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ваши достижения</h2>
                {achievements.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">У вас пока нет достижений</p>
                    <p className="text-gray-500 mt-2">Продолжайте тренироваться, чтобы разблокировать их!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <Card 
                        key={achievement.id}
                        className={
                          achievement.unlocked 
                            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10" 
                            : "bg-gray-50"
                        }
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center mr-3
                              ${
                                achievement.unlocked 
                                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                                  : 'bg-gray-200 text-gray-400'
                              }
                            `}>
                              <Award size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {achievement.title}
                                </h3>
                                {achievement.unlocked ? (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Получено
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    {achievement.progress}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{achievement.description}</p>
                              
                              {!achievement.unlocked && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-indigo-600 h-1.5 rounded-full" 
                                      style={{ width: `${achievement.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Избранные курсы</h2>
                {favoriteCourses.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">У вас нет избранных курсов</p>
                    <p className="text-gray-500 mt-2">Добавляйте курсы в избранное для быстрого доступа!</p>
                    <Link to="/courses">
                      <Button className="mt-4">
                        Просмотреть доступные курсы
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favoriteCourses.map(course => (
                      <Link key={course.id} to={`/courses/${course.id}`}>
                        <Card className="overflow-hidden active:scale-98 transition-transform">
                          <div className="flex">
                            <div className="w-24 h-24 flex-shrink-0">
                              <img 
                                src={course.image_url || 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-3 flex-1">
                              <h3 className="font-medium text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <Clock size={12} className="mr-1" />
                                <span>{course.duration} дней</span>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'nutrition' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <CalorieTracker />
                
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-3">Рекомендации по питанию</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    На основе вашей цели {goal ? `"${getGoalName(goal)}"` : ""} и активности, мы рекомендуем:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">Белки</span>
                      <span className="text-blue-800">{calculateRecommendedProtein(goal, weight ? parseFloat(weight) : 70)} г</span>
                    </div>
                    <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-800 font-medium">Углеводы</span>
                      <span className="text-yellow-800">{calculateRecommendedCarbs(goal, weight ? parseFloat(weight) : 70)} г</span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-red-800 font-medium">Жиры</span>
                      <span className="text-red-800">{calculateRecommendedFats(goal, weight ? parseFloat(weight) : 70)} г</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800 font-medium">Калории</span>
                      <span className="text-green-800">{calculateRecommendedCalories(goal, weight ? parseFloat(weight) : 70, height ? parseFloat(height) : 170)} ккал</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Вспомогательные функции для рекомендаций по питанию
function getGoalName(goal: string): string {
  switch (goal) {
    case 'weight_loss': return 'снижение веса';
    case 'muscle_gain': return 'набор мышечной массы';
    case 'endurance': return 'повышение выносливости';
    case 'flexibility': return 'улучшение гибкости';
    case 'overall_health': return 'общее здоровье';
    default: return goal;
  }
}

function calculateRecommendedCalories(goal: string, weight: number, height: number): number {
  // Базовый расчет BMR (основного обмена веществ) по формуле Миффлина-Сан Жеора
  const baseBMR = 10 * weight + 6.25 * height - 5 * 30 + 5; // Предполагаем возраст 30 лет
  
  // Модификация в зависимости от цели
  switch (goal) {
    case 'weight_loss':
      return Math.round(baseBMR * 1.2 - 500); // Дефицит для похудения
    case 'muscle_gain':
      return Math.round(baseBMR * 1.6 + 300); // Профицит для набора массы
    case 'endurance':
      return Math.round(baseBMR * 1.7); // Высокая активность
    default:
      return Math.round(baseBMR * 1.4); // Умеренная активность
  }
}

function calculateRecommendedProtein(goal: string, weight: number): number {
  switch (goal) {
    case 'weight_loss':
      return Math.round(weight * 2); // 2г на кг для сохранения мышц при похудении
    case 'muscle_gain':
      return Math.round(weight * 2.2); // 2.2г на кг для набора мышц
    case 'endurance':
      return Math.round(weight * 1.6); // 1.6г на кг для выносливости
    default:
      return Math.round(weight * 1.2); // 1.2г на кг по умолчанию
  }
}

function calculateRecommendedCarbs(goal: string, weight: number): number {
  switch (goal) {
    case 'weight_loss':
      return Math.round(weight * 2); // Низкоуглеводная диета
    case 'muscle_gain':
      return Math.round(weight * 5); // Высокоуглеводная диета
    case 'endurance':
      return Math.round(weight * 6); // Очень высокое потребление углеводов
    default:
      return Math.round(weight * 3); // Умеренное потребление
  }
}

function calculateRecommendedFats(goal: string, weight: number): number {
  switch (goal) {
    case 'weight_loss':
      return Math.round(weight * 0.8); // Умеренное потребление жиров
    case 'muscle_gain':
      return Math.round(weight * 1); // Нормальное потребление жиров
    default:
      return Math.round(weight * 0.9); // Стандартное потребление
  }
}
