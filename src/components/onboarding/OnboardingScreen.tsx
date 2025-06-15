import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { WaveBackground } from '../ui/WaveBackground';

interface OnboardingSlide {
  title: string;
  description: string;
  image: string;
  backgroundColor: string;
  waveColor: string;
}

export const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  // Эффект для запоминания, что пользователь уже видел онбординг
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') {
      navigate('/login');
    }
  }, [navigate]);
  
  const slides: OnboardingSlide[] = [
    {
      title: 'Добро пожаловать в ФитнесПро',
      description: 'Начните свой путь к здоровому образу жизни с персонализированными тренировками',
      image: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      backgroundColor: 'from-indigo-600 to-indigo-800',
      waveColor: '#4338ca'
    },
    {
      title: 'Тренируйтесь когда угодно',
      description: 'Все тренировки доступны в любое время и в любом месте, без специального оборудования',
      image: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      backgroundColor: 'from-green-600 to-teal-800',
      waveColor: '#047857'
    },
    {
      title: 'Отслеживайте свой прогресс',
      description: 'Наблюдайте за своими достижениями и результатами в реальном времени',
      image: 'https://images.pexels.com/photos/7991474/pexels-photo-7991474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      backgroundColor: 'from-purple-600 to-indigo-800',
      waveColor: '#7c3aed'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Запоминаем, что пользователь уже видел онбординг
      localStorage.setItem('hasSeenOnboarding', 'true');
      navigate('/login');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/login');
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  // Направление слайда (1 для вправо, -1 для влево)
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    if (
      (currentSlide === 0 && newDirection < 0) || 
      (currentSlide === slides.length - 1 && newDirection > 0)
    ) return;
    
    setPage([page + newDirection, newDirection]);
    setCurrentSlide(currentSlide + newDirection);
  };

  return (
    <div className="h-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className={`bg-gradient-to-b ${slides[currentSlide].backgroundColor} h-full flex flex-col`}>
            <div className="flex-1 relative">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title} 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" 
              />
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  onClick={skipOnboarding}
                  className="text-white hover:bg-white/20"
                >
                  Пропустить
                </Button>
              </div>
              
              <WaveBackground 
                color={slides[currentSlide].waveColor} 
                opacity={0.5} 
                height={40} 
                animationDuration={20}
              />
            </div>
            
            <div className="p-8 pb-16 bg-gradient-to-t from-black/80 to-transparent text-white relative z-10">
              <motion.h1 
                className="text-3xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                className="text-lg text-white/80 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {slides[currentSlide].description}
              </motion.p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {slides.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentSlide ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  {currentSlide > 0 && (
                    <Button 
                      variant="ghost"
                      onClick={() => paginate(-1)}
                      className="text-white hover:bg-white/20 p-2 h-auto"
                    >
                      <ChevronLeft size={24} />
                    </Button>
                  )}
                  
                  <Button
                    variant="gradient"
                    onClick={() => paginate(1)}
                    className="rounded-full px-6 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20"
                  >
                    {currentSlide === slides.length - 1 ? 'Начать' : 'Далее'}
                    {currentSlide !== slides.length - 1 && <ChevronRight size={20} className="ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};