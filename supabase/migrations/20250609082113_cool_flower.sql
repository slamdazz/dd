/*
  # Упрощение структуры курсов

  1. Изменения структуры
     - Убираем поле day из workouts (один курс = одна тренировка)
     - Убираем систему рейтингов курсов
     - Упрощаем связи между таблицами

  2. Безопасность
     - Сохраняем все существующие политики безопасности
*/

-- Удаляем триггеры и функции связанные с рейтингами
DROP TRIGGER IF EXISTS update_course_avg_rating ON public.course_ratings;
DROP TRIGGER IF EXISTS check_achievements_on_rating ON public.course_ratings;
DROP FUNCTION IF EXISTS update_course_avg_rating();
DROP FUNCTION IF EXISTS trigger_check_achievements_on_rating();

-- Удаляем таблицу рейтингов курсов
DROP TABLE IF EXISTS public.course_ratings;

-- Убираем поля рейтинга из таблицы курсов
ALTER TABLE public.courses DROP COLUMN IF EXISTS avg_rating;
ALTER TABLE public.courses DROP COLUMN IF EXISTS ratings_count;

-- Убираем поле day из workouts (теперь один курс = одна тренировка)
ALTER TABLE public.workouts DROP COLUMN IF EXISTS day;

-- Обновляем существующие данные - удаляем лишние тренировки, оставляем только первую для каждого курса
DELETE FROM public.workouts 
WHERE id NOT IN (
  SELECT DISTINCT ON (course_id) id 
  FROM public.workouts 
  ORDER BY course_id, created_at ASC
);

-- Обновляем прогресс пользователей - упрощаем структуру
ALTER TABLE public.user_progress DROP COLUMN IF EXISTS current_day;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Обновляем существующие записи прогресса
UPDATE public.user_progress 
SET completed = (completed_workouts > 0)
WHERE completed_workouts > 0;

-- Убираем поле completed_workouts
ALTER TABLE public.user_progress DROP COLUMN IF EXISTS completed_workouts;

-- Обновляем достижения - убираем типы связанные с рейтингами
DELETE FROM public.user_achievements 
WHERE achievement_id IN (
  SELECT id FROM public.achievements WHERE type = 'rating_count'
);

DELETE FROM public.achievements WHERE type = 'rating_count';

-- Обновляем функцию проверки достижений
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
        WHERE user_id = user_id_param AND completed = true;
        
      WHEN 'course_completion' THEN
        SELECT COUNT(*) INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param AND completed = true;
        
      WHEN 'streak' THEN
        -- Упрощенный подсчет серии - количество завершенных курсов
        SELECT COUNT(*) INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param AND completed = true;
        
      WHEN 'exercise_count' THEN
        -- Грубая оценка числа выполненных упражнений
        SELECT COUNT(*) * 5 INTO user_value FROM public.user_progress 
        WHERE user_id = user_id_param AND completed = true;
        
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