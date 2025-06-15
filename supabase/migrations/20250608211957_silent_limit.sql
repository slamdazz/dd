/*
  # Добавление демонстрационных тренировок и упражнений

  1. Новые данные
    - Тренировки для каждого курса
    - Упражнения с таймерами для тренировок
    
  2. Безопасность
    - Безопасная вставка с проверкой существования
*/

DO $$ 
DECLARE
  yoga_course_id uuid;
  strength_course_id uuid;
  hiit_course_id uuid;
  functional_course_id uuid;
  cardio_course_id uuid;
  pilates_course_id uuid;
  
  workout_id uuid;
BEGIN
  -- Получаем ID курсов
  SELECT id INTO yoga_course_id FROM public.courses WHERE title = 'Йога для начинающих' LIMIT 1;
  SELECT id INTO strength_course_id FROM public.courses WHERE title = 'Силовые тренировки дома' LIMIT 1;
  SELECT id INTO hiit_course_id FROM public.courses WHERE title = 'Интервальные тренировки HIIT' LIMIT 1;
  SELECT id INTO functional_course_id FROM public.courses WHERE title = 'Функциональный тренинг' LIMIT 1;
  SELECT id INTO cardio_course_id FROM public.courses WHERE title = 'Кардио для похудения' LIMIT 1;
  SELECT id INTO pilates_course_id FROM public.courses WHERE title = 'Пилатес для укрепления кора' LIMIT 1;
  
  -- Добавляем тренировки и упражнения только если их еще нет
  IF NOT EXISTS (SELECT 1 FROM public.workouts LIMIT 1) THEN
    
    -- Тренировки для курса "Йога для начинающих"
    IF yoga_course_id IS NOT NULL THEN
      -- День 1: Основы йоги
      INSERT INTO public.workouts (course_id, title, description, duration, day, calories)
      VALUES (yoga_course_id, 'Основы йоги - знакомство с практикой', 'Вводная тренировка с основными позами для новичков', 25, 1, 100)
      RETURNING id INTO workout_id;
      
      INSERT INTO public.exercises (workout_id, title, description, sets, reps, rest, order_index, image_url)
      VALUES 
        (workout_id, 'Разминка', 'Легкая разминка для подготовки тела к практике', 1, 1, 30, 1, 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg'),
        (workout_id, 'Поза горы (Тадасана)', 'Основная стоячая поза для выравнивания тела', 1, 3, 60, 2, 'https://images.pexels.com/photos/8436465/pexels-photo-8436465.jpeg'),
        (workout_id, 'Поза дерева (Врикшасана)', 'Поза для развития баланса и концентрации', 2, 1, 60, 3, 'https://images.pexels.com/photos/8436590/pexels-photo-8436590.jpeg'),
        (workout_id, 'Поза ребенка (Баласана)', 'Расслабляющая поза для завершения практики', 1, 1, 60, 4, 'https://images.pexels.com/photos/6111691/pexels-photo-6111691.jpeg');
      
      -- День 2: Укрепление кора
      INSERT INTO public.workouts (course_id, title, description, duration, day, calories)
      VALUES (yoga_course_id, 'Укрепление центра', 'Йога для укрепления мышц кора и улучшения стабильности', 30, 2, 120)
      RETURNING id INTO workout_id;
      
      INSERT INTO public.exercises (workout_id, title, description, sets, reps, rest, order_index, image_url)
      VALUES 
        (workout_id, 'Планка', 'Базовое упражнение для укрепления кора', 3, 1, 45, 1, 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
        (workout_id, 'Поза лодки (Навасана)', 'Активная поза для мышц живота', 3, 1, 60, 2, 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg'),
        (workout_id, 'Поза собаки мордой вниз', 'Укрепление рук и кора', 2, 1, 90, 3, 'https://images.pexels.com/photos/6111616/pexels-photo-6111616.jpeg');
    END IF;
    
    -- Тренировки для курса "Силовые тренировки дома"
    IF strength_course_id IS NOT NULL THEN
      -- День 1: Верх тела
      INSERT INTO public.workouts (course_id, title, description, duration, day, calories)
      VALUES (strength_course_id, 'Тренировка верха тела', 'Проработка мышц груди, плеч и рук', 45, 1, 300)
      RETURNING id INTO workout_id;
      
      INSERT INTO public.exercises (workout_id, title, description, sets, reps, rest, order_index, image_url)
      VALUES 
        (workout_id, 'Отжимания', 'Классические отжимания от пола', 3, 12, 60, 1, 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg'),
        (workout_id, 'Отжимания с узкой постановкой рук', 'Акцент на трицепс', 3, 8, 60, 2, 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg'),
        (workout_id, 'Планка', 'Статическое упражнение для кора', 3, 1, 45, 3, 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'),
        (workout_id, 'Берпи', 'Комплексное упражнение на все тело', 3, 10, 90, 4, 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg');
        
      -- День 2: Низ тела
      INSERT INTO public.workouts (course_id, title, description, duration, day, calories)
      VALUES (strength_course_id, 'Тренировка ног и ягодиц', 'Проработка мышц нижней части тела', 40, 2, 280)
      RETURNING id INTO workout_id;
      
      INSERT INTO public.exercises (workout_id, title, description, sets, reps, rest, order_index, image_url)
      VALUES 
        (workout_id, 'Приседания', 'Базовое упражнение для ног', 4, 15, 60, 1, 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg'),
        (workout_id, 'Выпады', 'Функциональное упражнение для ног', 3, 12, 60, 2, 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg'),
        (workout_id, 'Приседания на одной ноге', 'Сложное упражнение для продвинутых', 2, 8, 90, 3, 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg');
    END IF;
    
    -- Тренировки для курса "Интервальные тренировки HIIT"
    IF hiit_course_id IS NOT NULL THEN
      -- День 1: Кардио HIIT
      INSERT INTO public.workouts (course_id, title, description, duration, day, calories)
      VALUES (hiit_course_id, 'Кардио взрыв', 'Высокоинтенсивная интервальная тренировка', 20, 1, 250)
      RETURNING id INTO workout_id;
      
      INSERT INTO public.exercises (workout_id, title, description, sets, reps, rest, order_index, image_url)
      VALUES 
        (workout_id, 'Джампинг Джекс', 'Кардио упражнение с прыжками', 4, 30, 30, 1, 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg'),
        (workout_id, 'Высокие колени', 'Бег на месте с высоким подниманием коленей', 4, 30, 30, 2, 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg'),
        (workout_id, 'Берпи', 'Взрывное упражнение на все тело', 4, 10, 60, 3, 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg'),
        (workout_id, 'Горные альпинисты', 'Быстрая смена ног в планке', 4, 20, 45, 4, 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg');
    END IF;
    
    -- Тренировки для курса "Кардио для похудения"
    IF cardio_course_id IS NOT NULL THEN
      -- День 1: Легкое кардио
      INSERT INTO public.workouts (course_id, title, description, duration, day, calories)
      VALUES (cardio_course_id, 'Жиросжигающее кардио', 'Умеренная кардио тренировка для начинающих', 30, 1, 200)
      RETURNING id INTO workout_id;
      
      INSERT INTO public.exercises (workout_id, title, description, sets, reps, rest, order_index, image_url)
      VALUES 
        (workout_id, 'Марш на месте', 'Разминка с активными движениями рук', 1, 60, 30, 1, 'https://images.pexels.com/photos/6922169/pexels-photo-6922169.jpeg'),
        (workout_id, 'Степ-ап', 'Имитация подъема на ступеньку', 3, 20, 45, 2, 'https://images.pexels.com/photos/6922169/pexels-photo-6922169.jpeg'),
        (workout_id, 'Танцевальные движения', 'Веселые движения под ритм', 3, 45, 60, 3, 'https://images.pexels.com/photos/6922169/pexels-photo-6922169.jpeg');
    END IF;
    
  END IF;
END $$;