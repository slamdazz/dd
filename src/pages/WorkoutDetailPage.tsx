import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ProgressCircle } from '../components/ui/ProgressCircle';
import { ArrowLeft, Clock, ChevronRight, Play, Pause, RotateCcw, RotateCw, Check } from 'lucide-react';
import { Workout, Exercise } from '../types';
import { getWorkoutById, getWorkoutExercises, updateUserProgress } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const WorkoutDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0); // время в секундах
  const [progress, setProgress] = useState<number>(0);
  
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Получаем данные тренировки
        const { data: workoutData, error: workoutError } = await getWorkoutById(id);
        if (workoutError) throw workoutError;
        
        // Получаем упражнения тренировки
        const { data: exercisesData, error: exercisesError } = await getWorkoutExercises(id);
        if (exercisesError) throw exercisesError;
        
        if (workoutData) {
          setWorkout(workoutData);
        }
        
        if (exercisesData && exercisesData.length > 0) {
          setExercises(exercisesData);
          setTimeLeft(exercisesData[0].rest);
        } else {
          // Демонстрационные данные, если в базе нет упражнений
          const mockExercises: Exercise[] = [
            {
              id: '1',
              workout_id: id,
              title: 'Разминка',
              description: 'Легкая разминка для подготовки тела к тренировке. Сделайте круговые движения шеей, плечами, запястьями и лодыжками.',
              sets: 1,
              reps: 1,
              rest: 30,
              order_index: 1,
              image_url: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              workout_id: id,
              title: 'Поза горы (Тадасана)',
              description: 'Встаньте прямо, ноги вместе, руки по бокам. Распределите вес равномерно на обе ступни. Втяните живот, расправьте плечи и грудь. Руки должны быть расслаблены, а ладони повернуты к бедрам.',
              sets: 1,
              reps: 1,
              rest: 60,
              order_index: 2,
              image_url: 'https://images.pexels.com/photos/8436465/pexels-photo-8436465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              created_at: new Date().toISOString()
            },
            {
              id: '3',
              workout_id: id,
              title: 'Поза дерева (Врикшасана)',
              description: 'Встаньте прямо в позе горы. Перенесите вес на левую ногу. Поднимите правую ногу и поместите подошву на внутреннюю поверхность левого бедра. Сложите руки перед грудью или поднимите их над головой. Задержитесь на 30-60 секунд, затем повторите с другой ногой.',
              sets: 2,
              reps: 1,
              rest: 60,
              order_index: 3,
              image_url: 'https://images.pexels.com/photos/8436590/pexels-photo-8436590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              created_at: new Date().toISOString()
            },
            {
              id: '4',
              workout_id: id,
              title: 'Поза собаки мордой вниз (Адхо Мукха Шванасана)',
              description: 'Начните с позиции на четвереньках. Руки на ширине плеч, колени на ширине бедер. Поднимите таз вверх, выпрямляя ноги и руки, формируя перевернутую букву V. Пятки стремятся к полу. Голова расслаблена между руками. Удерживайте 1-3 минуты, дышите глубоко.',
              sets: 1,
              reps: 1,
              rest: 90,
              order_index: 4,
              image_url: 'https://images.pexels.com/photos/6111616/pexels-photo-6111616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              created_at: new Date().toISOString()
            },
            {
              id: '5',
              workout_id: id,
              title: 'Поза ребенка (Баласана)',
              description: 'Сядьте на пятки, колени вместе или слегка разведены. Наклонитесь вперед, положив торс на бедра. Вытяните руки перед собой или положите их вдоль тела ладонями вверх. Расслабьте шею, позволяя лбу коснуться пола. Дышите глубоко, расслабляя спину и плечи.',
              sets: 1,
              reps: 1,
              rest: 60,
              order_index: 5,
              image_url: 'https://images.pexels.com/photos/6111691/pexels-photo-6111691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
              created_at: new Date().toISOString()
            }
          ];
          
          setExercises(mockExercises);
          setTimeLeft(mockExercises[0].rest);
        }
        
      } catch (error) {
        console.error('Ошибка при загрузке тренировки:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkoutData();
  }, [id]);
  
  // Обработчик таймера
  useEffect(() => {
    let timer: number | null = null;
    
    if (isPlaying && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          const newValue = prev - 1;
          // Обновляем прогресс
          if (exercises[currentExercise]) {
            setProgress(Math.round((1 - newValue / exercises[currentExercise].rest) * 100));
          }
          return newValue;
        });
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      // Если время вышло, но тренировка активна
      if (currentExercise < exercises.length - 1) {
        // Переходим к следующему упражнению
        setCurrentExercise(prev => prev + 1);
        // Устанавливаем новое время отдыха
        if (exercises[currentExercise + 1]) {
          setTimeLeft(exercises[currentExercise + 1].rest);
        }
      } else {
        // Если это было последнее упражнение
        setIsPlaying(false);
        setIsComplete(true);
      }
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, timeLeft, currentExercise, exercises]);
  
  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Обработчики кнопок управления
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setTimeLeft(exercises[currentExercise + 1].rest);
      setProgress(0);
    } else {
      setIsComplete(true);
      setIsPlaying(false);
    }
  };
  
  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1);
      setTimeLeft(exercises[currentExercise - 1].rest);
      setProgress(0);
    }
  };
  
  const resetWorkout = () => {
    setCurrentExercise(0);
    setTimeLeft(exercises[0]?.rest || 0);
    setIsPlaying(false);
    setIsComplete(false);
    setProgress(0);
  };
  
  // Обработчик завершения тренировки
  const handleComplete = async () => {
    if (!user || !workout) return;
    
    try {
      setIsComplete(true);
      
      // Обновляем прогресс пользователя - помечаем курс как завершенный
      await updateUserProgress(user.id, workout.course_id, { completed: true });
      
      // Имитация сохранения прогресса
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Ошибка при сохранении прогресса:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
          <span className="ml-2 text-gray-600">Загрузка тренировки...</span>
        </div>
      </Layout>
    );
  }
  
  if (!workout) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Тренировка не найдена</h2>
          <p className="text-gray-600 mb-6">К сожалению, запрашиваемая вами тренировка не существует или была удалена.</p>
          <Button onClick={() => navigate(-1)}>Вернуться назад</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="pb-16 md:pb-6">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div 
              key="completed"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="p-4 flex flex-col h-full"
            >
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 text-center">
                <CardContent className="p-0">
                  <motion.div 
                    className="rounded-full bg-white/20 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: [0, 10, 0] }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3 
                    }}
                  >
                    <Check size={24} className="text-white" />
                  </motion.div>
                  
                  <motion.h2 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Тренировка завершена!
                  </motion.h2>
                  
                  <motion.p 
                    className="text-white/90 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Отличная работа! Вы успешно выполнили тренировку.
                  </motion.p>
                  
                  <motion.div 
                    className="grid grid-cols-3 gap-3 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Время</p>
                      <p className="text-lg font-bold">{workout.duration} мин</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Упражнения</p>
                      <p className="text-lg font-bold">{exercises.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white/80 text-xs mb-1">Калории</p>
                      <p className="text-lg font-bold">~{workout.calories || workout.duration * 5}</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      onClick={() => navigate(`/courses/${workout.course_id}`)} 
                      variant="outline" 
                      fullWidth
                      className="bg-white/10 border-white/20 text-white"
                    >
                      Вернуться к курсу
                    </Button>
                    <Button 
                      onClick={resetWorkout} 
                      fullWidth
                      className="bg-white text-indigo-600"
                    >
                      Повторить тренировку
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="workout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Хедер тренировки */}
              <div className="p-4 pb-0">
                <div className="flex items-center mb-4">
                  <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600"
                  >
                    <ArrowLeft size={18} className="mr-1" />
                    <span>Назад</span>
                  </button>
                  <div className="flex items-center ml-auto text-gray-600">
                    <Clock size={16} className="mr-1" />
                    <span className="text-sm">{workout.duration} мин</span>
                  </div>
                </div>
                
                <h1 className="text-xl font-bold text-gray-900 mb-1">{workout.title}</h1>
                <p className="text-gray-600 mb-4">{workout.description}</p>
              </div>
              
              {/* Текущее упражнение */}
              <div className="px-4">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="overflow-hidden mb-4 bg-gradient-to-br from-indigo-50 to-blue-50">
                    <div className="relative h-64">
                      {exercises[currentExercise] && (
                        <img
                          src={exercises[currentExercise].image_url || 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                          alt={exercises[currentExercise].title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <h2 className="text-lg font-semibold mb-1">
                            {exercises[currentExercise]?.title || 'Упражнение'}
                          </h2>
                          <div className="flex items-center text-sm text-white/80">
                            {currentExercise + 1} из {exercises.length}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-gray-700 mb-4 text-sm">
                        {exercises[currentExercise]?.description || 'Описание упражнения'}
                      </p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {exercises[currentExercise]?.sets || 0} × {exercises[currentExercise]?.reps || 0}
                        </span>
                        <div className="flex items-center gap-2">
                          <ProgressCircle 
                            value={progress} 
                            size={46} 
                            strokeWidth={4}
                            color="#4f46e5"
                            trailColor="#e5e7eb"
                            className=""
                            label={<span className="text-indigo-600 font-bold text-xs">{formatTime(timeLeft)}</span>}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4 mt-4">
                        <button
                          onClick={prevExercise}
                          disabled={currentExercise === 0}
                          className="p-2 rounded-full bg-white shadow-md text-gray-700 disabled:opacity-50 active:scale-95 transition-transform"
                        >
                          <RotateCcw size={24} />
                        </button>
                        
                        <button
                          onClick={togglePlay}
                          className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md active:scale-95 transition-transform"
                        >
                          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        
                        <button
                          onClick={nextExercise}
                          disabled={currentExercise === exercises.length - 1}
                          className="p-2 rounded-full bg-white shadow-md text-gray-700 disabled:opacity-50 active:scale-95 transition-transform"
                        >
                          <RotateCw size={24} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {/* Список упражнений */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-4 mb-4">
                    <CardContent className="p-0">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Все упражнения</h2>
                      
                      <div className="space-y-3">
                        {exercises.map((exercise, index) => (
                          <motion.div 
                            key={exercise.id}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center p-3 rounded-lg ${
                              currentExercise === index 
                                ? 'bg-indigo-50 border border-indigo-100' 
                                : index < currentExercise 
                                  ? 'bg-gray-50' 
                                  : 'bg-white border border-gray-100'
                            }`}
                            onClick={() => {
                              setCurrentExercise(index);
                              setTimeLeft(exercise.rest);
                              setProgress(0);
                              setIsPlaying(false);
                            }}
                          >
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center mr-3
                              ${
                                index < currentExercise 
                                  ? 'bg-green-100 text-green-600' 
                                  : currentExercise === index 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'bg-gray-100 text-gray-600'
                              }
                            `}>
                              {index < currentExercise ? (
                                <Check size={16} />
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <h3 className={`font-medium ${currentExercise === index ? 'text-indigo-900' : 'text-gray-900'}`}>
                                {exercise.title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {exercise.sets} × {exercise.reps} • {exercise.rest} сек отдых
                              </p>
                            </div>
                            
                            <ChevronRight size={16} className="text-gray-400" />
                          </motion.div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={handleComplete}
                        fullWidth
                        variant="gradient"
                        className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600"
                      >
                        Завершить тренировку
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};