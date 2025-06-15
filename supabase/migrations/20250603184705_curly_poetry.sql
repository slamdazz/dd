/*
  # Добавление системы избранного и рейтинга курсов
  
  1. Новые таблицы
     - `course_favorites` для хранения избранных курсов пользователей
     - `course_ratings` для хранения оценок курсов
     - `user_achievements` для хранения полученных достижений
     - `achievements` для списка доступных достижений
     - `nutrition_logs` для отслеживания калорий и питания
  
  2. Триггеры
     - Триггер для подсчета среднего рейтинга курса
     - Триггер для проверки достижений пользователя
     - Триггер для отслеживания прогресса тренировок
  
  3. Изменения схемы
     - Добавление полей для подсчета среднего рейтинга в таблицу `courses`
     - Добавление поля для подсчета калорий в таблицу `workouts`
*/

-- Добавление полей для рейтинга в таблицу курсов
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0;

-- Добавление поля для калорий в таблицу тренировок
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0;

-- Создание таблицы для хранения избранных курсов
CREATE TABLE IF NOT EXISTS public.course_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_course_favorite UNIQUE (user_id, course_id)
);

-- Включаем row-level security для избранного
ALTER TABLE public.course_favorites ENABLE ROW LEVEL SECURITY;

-- Политики для избранного
CREATE POLICY "Пользователи могут видеть свои избранные" 
ON public.course_favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут добавлять в избранное" 
ON public.course_favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять из избранного" 
ON public.course_favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Создание таблицы для хранения оценок курсов
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_course_rating UNIQUE (user_id, course_id)
);

-- Включаем row-level security для рейтингов
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

-- Политики для рейтингов
CREATE POLICY "Пользователи могут видеть рейтинги" 
ON public.course_ratings FOR SELECT 
USING (true);

CREATE POLICY "Пользователи могут оставлять рейтинги" 
ON public.course_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои рейтинги" 
ON public.course_ratings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои рейтинги" 
ON public.course_ratings FOR DELETE 
USING (auth.uid() = user_id);

-- Триггер для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_course_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_ratings_updated_at
BEFORE UPDATE ON public.course_ratings
FOR EACH ROW
EXECUTE FUNCTION update_course_ratings_updated_at();

-- Триггер для обновления среднего рейтинга курса
CREATE OR REPLACE FUNCTION update_course_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating_val DECIMAL(3,2);
  ratings_count_val INTEGER;
BEGIN
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
  INTO avg_rating_val, ratings_count_val
  FROM public.course_ratings
  WHERE course_id = COALESCE(NEW.course_id, OLD.course_id);
  
  UPDATE public.courses
  SET avg_rating = COALESCE(avg_rating_val, 0),
      ratings_count = COALESCE(ratings_count_val, 0)
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON public.course_ratings
FOR EACH ROW
EXECUTE FUNCTION update_course_avg_rating();

-- Создаем таблицу для отслеживания калорий и питания
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(6,2),
  carbs DECIMAL(6,2),
  fats DECIMAL(6,2),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Включаем row-level security для записей питания
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Политики для записей питания
CREATE POLICY "Пользователи могут видеть свои записи питания" 
ON public.nutrition_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут добавлять записи питания" 
ON public.nutrition_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои записи питания" 
ON public.nutrition_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои записи питания" 
ON public.nutrition_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Триггер для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_nutrition_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nutrition_logs_updated_at
BEFORE UPDATE ON public.nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION update_nutrition_logs_updated_at();

-- Создаем таблицу достижений
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  required_value INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('workout_count', 'course_completion', 'streak', 'rating_count', 'exercise_count')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу для достижений пользователей
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- Включаем row-level security для достижений
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Политики для достижений
CREATE POLICY "Достижения доступны для чтения всем" 
ON public.achievements FOR SELECT 
USING (true);

-- Политики для достижений пользователей
CREATE POLICY "Пользователи могут видеть свои достижения" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои достижения" 
ON public.user_achievements FOR UPDATE 
USING (auth.uid() = user_id);

-- Заполняем таблицу достижений, если она пуста
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.achievements LIMIT 1) THEN
    INSERT INTO public.achievements (title, description, icon, type, required_value)
    VALUES
      ('Первая тренировка', 'Выполните свою первую тренировку', 'workout', 'workout_count', 1),
      ('Регулярный спортсмен', 'Выполните 10 тренировок', 'workout', 'workout_count', 10),
      ('Профессиональный атлет', 'Выполните 50 тренировок', 'workout', 'workout_count', 50),
      ('Первый курс', 'Завершите свой первый курс', 'course', 'course_completion', 1),
      ('Стремление к совершенству', 'Завершите 5 курсов', 'course', 'course_completion', 5),
      ('Недельная серия', 'Тренируйтесь 7 дней подряд', 'calendar', 'streak', 7),
      ('Месячная серия', 'Тренируйтесь 30 дней подряд', 'calendar', 'streak', 30),
      ('Первый отзыв', 'Оставьте свой первый отзыв о курсе', 'star', 'rating_count', 1),
      ('Критик', 'Оставьте отзывы о 5 курсах', 'star', 'rating_count', 5),
      ('Выносливость', 'Выполните 100 упражнений', 'activity', 'exercise_count', 100);
  END IF;
END $$;

-- Функция для проверки и выдачи достижений пользователям
CREATE OR REPLACE FUNCTION check_user_achievements(user_id_param uuid)
RETURNS void AS $$
DECLARE
  achievement_rec RECORD;
  user_value INTEGER;
BEGIN
  -- Проходим по всем достижениям
  FOR achievement_rec IN SELECT id, title, type, required_value FROM public.achievements
  LOOP
    -- Вычисляем текущее значение для пользователя в зависимости от типа достижения
    CASE achievement_rec.type
      WHEN 'workout_count' THEN
        SELECT COUNT(*) INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param AND completed_workouts > 0;
        
      WHEN 'course_completion' THEN
        SELECT COUNT(DISTINCT course_id) INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param AND completed_workouts = (
          SELECT COUNT(*) FROM public.workouts w WHERE w.course_id = public.user_progress.course_id
        );
        
      WHEN 'streak' THEN
        SELECT COALESCE(MAX(current_day), 0) INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param;
        
      WHEN 'rating_count' THEN
        SELECT COUNT(*) INTO user_value FROM public.course_ratings 
        WHERE user_id = user_id_param;
        
      WHEN 'exercise_count' THEN
        -- Грубая оценка числа выполненных упражнений
        SELECT SUM(completed_workouts) * 5 INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param;
        
      ELSE
        user_value := 0;
    END CASE;
    
    -- Проверяем, существует ли запись о достижении пользователя
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = user_id_param AND achievement_id = achievement_rec.id
    ) THEN
      -- Если нет записи, создаем ее
      INSERT INTO public.user_achievements (
        user_id, achievement_id, progress, completed, completed_at
      ) VALUES (
        user_id_param, 
        achievement_rec.id, 
        LEAST(user_value, achievement_rec.required_value), 
        user_value >= achievement_rec.required_value,
        CASE WHEN user_value >= achievement_rec.required_value THEN CURRENT_TIMESTAMP ELSE NULL END
      );
    ELSE
      -- Обновляем существующую запись
      UPDATE public.user_achievements
      SET 
        progress = LEAST(user_value, achievement_rec.required_value),
        completed = user_value >= achievement_rec.required_value,
        completed_at = CASE 
          WHEN user_value >= achievement_rec.required_value AND NOT completed THEN CURRENT_TIMESTAMP
          WHEN user_value >= achievement_rec.required_value THEN completed_at
          ELSE NULL
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE 
        user_id = user_id_param AND 
        achievement_id = achievement_rec.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматической проверки достижений при различных действиях

-- При обновлении прогресса пользователя
CREATE OR REPLACE FUNCTION trigger_check_achievements_on_progress()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_user_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_achievements_on_progress_update
AFTER INSERT OR UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_check_achievements_on_progress();

-- При добавлении рейтинга
CREATE OR REPLACE FUNCTION trigger_check_achievements_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_user_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_achievements_on_rating
AFTER INSERT OR UPDATE ON public.course_ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_check_achievements_on_rating();