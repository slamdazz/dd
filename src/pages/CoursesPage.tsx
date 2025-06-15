import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Course } from '../types';
import { Search, Filter, ArrowUpRight, Clock, Users, ChevronDown } from 'lucide-react'; // Убрал Star
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { WaveBackground } from '../components/ui/WaveBackground';
import { getCourses } from '../lib/supabase';

export const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterDuration, setFilterDuration] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Загрузка курсов из Supabase
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await getCourses();
        
        if (error) throw error;
        
        if (data) {
          setCourses(data);
          setFilteredCourses(data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке курсов:', err);
        setError('Не удалось загрузить курсы. Пожалуйста, проверьте подключение к интернету и попробуйте снова.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Фильтрация курсов
  useEffect(() => {
    const filtered = courses.filter(course => {
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
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterLevel, filterDuration]);
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'intermediate':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'advanced':
        return 'bg-gradient-to-r from-purple-500 to-violet-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getLevelName = (level: string) => {
    switch (level) {
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
  
  // Стили для select, чтобы текст в option был видимым
  // Это хак, и он может не работать во всех браузерах одинаково идеально для option
  // Но он попытается установить цвет текста для самого select
  const selectStyles: React.CSSProperties = {
    color: 'black', // Основной цвет текста для выбранного значения
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Немного более непрозрачный фон
    WebkitAppearance: 'none', // Убираем стандартную стрелку в Webkit
    MozAppearance: 'none', // Убираем стандартную стрелку в Mozilla
    appearance: 'none', // Убираем стандартную стрелку
    paddingRight: '2.5rem', // Место для кастомной стрелки
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.25em 1.25em',
  };

  // Для <option> элементов, к сожалению, прямой контроль цвета текста через CSS ограничен.
  // Одно из решений - это использовать кастомный компонент select.
  // В данном случае, мы оставим белый цвет текста для <select>, но сделаем фон чуть менее прозрачным.
  // А для <option> браузеры обычно используют системные цвета, если не указано иное.
  // Попробуем для <option> также установить цвет, но результат может варьироваться.

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 pt-6 pb-12">
            <div className="relative z-10 px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-2xl font-bold text-white mb-1">Курсы</h1>
                <p className="text-purple-100">
                  Выберите программу тренировок для себя
                </p>
              </motion.div>
              
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Поиск курсов..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60 focus:ring-indigo-500 focus:border-indigo-500"
                      glassmorphism
                    />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                    glassmorphism
                  >
                    <Filter size={18} />
                  </Button>
                </div>
                
                {showFilters && (
                  <motion.div 
                    className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-white/90">Уровень сложности</label>
                        <div className="relative">
                          <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            // Применяем стили через Tailwind классы + инлайн стили для специфичных вещей
                            className="block w-full rounded-lg border-white/20 text-white placeholder-white/60 py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            style={selectStyles}
                          >
                            {/* Для option цвет текста будет зависеть от браузера, 
                                но мы можем стилизовать их фон, если они внутри select с темным фоном */}
                            <option value="" style={{ color: 'black', backgroundColor: 'white' }}>Все уровни</option>
                            <option value="beginner" style={{ color: 'black', backgroundColor: 'white' }}>Начинающий</option>
                            <option value="intermediate" style={{ color: 'black', backgroundColor: 'white' }}>Средний</option>
                            <option value="advanced" style={{ color: 'black', backgroundColor: 'white' }}>Продвинутый</option>
                          </select>
                          {/* Убрал иконку ChevronDown отсюда, так как она теперь встроена через background-image */}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-white/90">Продолжительность</label>
                        <div className="relative">
                          <select
                            value={filterDuration}
                            onChange={(e) => setFilterDuration(e.target.value)}
                            className="block w-full rounded-lg border-white/20 text-white placeholder-white/60 py-2.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            style={selectStyles}
                          >
                            <option value="" style={{ color: 'black', backgroundColor: 'white' }}>Любая продолжительность</option>
                            <option value="short" style={{ color: 'black', backgroundColor: 'white' }}>Короткие (до 7 дней)</option>
                            <option value="medium" style={{ color: 'black', backgroundColor: 'white' }}>Средние (7-14 дней)</option>
                            <option value="long" style={{ color: 'black', backgroundColor: 'white' }}>Длинные (более 14 дней)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-2"> {/* Увеличил отступ сверху */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterLevel('');
                          setFilterDuration('');
                        }}
                        className="text-white/80 hover:text-white hover:bg-white/15" // Чуть изменил hover
                      >
                        Сбросить
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="bg-white/20 text-white hover:bg-white/30" // Чуть изменил hover
                      >
                        Применить
                      </Button>
                    </div>
                  </motion.div>
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
        
        {/* Основной контент */}
        <div className="flex-1 bg-gray-50 -mt-6 rounded-t-3xl px-4 pt-4 pb-16">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
              <span className="ml-2 text-gray-600">Загрузка курсов...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-lg text-gray-600">{error}</p>
              <Button 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Попробовать снова
              </Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-lg text-gray-600">Курсы не найдены</p>
              <p className="text-gray-500 mt-1">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <motion.div 
              className="space-y-4 pt-2"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredCourses.map((course, index) => (
                <motion.div 
                  key={course.id} 
                  variants={item}
                  custom={index} // убедитесь, что это свойство используется, если оно нужно для анимации
                >
                  <Link to={`/courses/${course.id}`} className="block">
                    <Card className="overflow-hidden active:scale-98 transition-transform duration-200 ease-in-out hover:shadow-xl">
                      <div className="relative h-40">
                        <img 
                          src={course.image_url || 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium text-white ${getLevelColor(course.level)} shadow-sm`}>
                          {getLevelName(course.level)}
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-indigo-500" />
                            <span>{course.duration} дней</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Users size={16} className="mr-1 text-indigo-500" />
                            <span>{course.ratings_count ?? 0}</span>
                          </div>
                          
                          <ArrowUpRight size={18} className="text-indigo-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};