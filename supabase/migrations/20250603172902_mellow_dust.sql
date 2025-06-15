/*
  # Добавление демонстрационных курсов

  1. Новые данные
    - Добавление демонстрационных курсов в таблицу `courses`
    - Использование реальных данных вместо моков на фронтенде
  
  2. Безопасность
    - Данные курсов доступны для чтения всем пользователям
*/

-- Проверяем наличие данных перед вставкой, чтобы избежать дублирования
DO $$ 
BEGIN
  -- Добавляем данные, только если таблица courses пуста
  IF NOT EXISTS (SELECT 1 FROM public.courses LIMIT 1) THEN
    INSERT INTO public.courses (title, description, image_url, level, duration, is_active)
    VALUES
      ('Йога для начинающих', 'Базовый курс йоги для тех, кто только начинает свой путь. Улучшение гибкости, баланса и силы.', 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'beginner', 14, true),
      ('Силовые тренировки дома', 'Эффективные тренировки с собственным весом и минимальным оборудованием для набора мышечной массы.', 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'intermediate', 28, true),
      ('Интервальные тренировки HIIT', 'Высокоинтенсивные интервальные тренировки для сжигания жира и улучшения метаболизма.', 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'advanced', 21, true),
      ('Функциональный тренинг', 'Функциональные тренировки для улучшения повседневных движений и общей физической подготовки.', 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'intermediate', 30, true),
      ('Кардио для похудения', 'Эффективные кардио-тренировки различной интенсивности для снижения веса и улучшения выносливости.', 'https://images.pexels.com/photos/6922169/pexels-photo-6922169.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'beginner', 14, true),
      ('Пилатес для укрепления кора', 'Классический пилатес с акцентом на укрепление мышц кора, улучшение осанки и гибкости.', 'https://images.pexels.com/photos/6111583/pexels-photo-6111583.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'beginner', 7, true);
  END IF;
END $$;