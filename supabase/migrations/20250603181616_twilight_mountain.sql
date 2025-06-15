/*
  # Демонстрационные данные для чата

  1. Новые данные
    - Добавляет несколько демонстрационных сообщений в чат
    
  2. Безопасность
    - Безопасная вставка данных с проверкой существования курсов и пользователей
*/

DO $$ 
DECLARE
  course_id uuid;
  admin_id uuid;
  user1_id uuid;
  user2_id uuid;
BEGIN
  -- Получаем ID первого курса
  SELECT id INTO course_id FROM public.courses LIMIT 1;
  
  -- Находим ID пользователя с ролью admin
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Находим двух обычных пользователей
  SELECT id INTO user1_id FROM public.users WHERE role = 'user' LIMIT 1;
  SELECT id INTO user2_id FROM public.users WHERE role = 'user' LIMIT 1 OFFSET 1;
  
  -- Вставляем демонстрационные сообщения только если есть курсы и пользователи
  IF course_id IS NOT NULL AND admin_id IS NOT NULL AND user1_id IS NOT NULL THEN
    -- Проверяем, есть ли уже сообщения в чате
    IF NOT EXISTS (SELECT 1 FROM public.chat_messages LIMIT 1) THEN
      INSERT INTO public.chat_messages 
        (course_id, user_id, content, is_moderated, created_at)
      VALUES
        (course_id, admin_id, 'Всем привет! Как у вас успехи с первым комплексом упражнений?', true, NOW() - interval '3 hours'),
        (course_id, user1_id, 'Выполнил первую неделю, чувствую себя намного лучше!', true, NOW() - interval '2 hours 30 minutes'),
        (course_id, user2_id, 'У меня вопрос по позе собаки мордой вниз. Как правильно располагать руки?', false, NOW() - interval '1 hour 45 minutes'),
        (course_id, admin_id, 'Руки должны быть на ширине плеч, пальцы разведены. Старайтесь вытягивать позвоночник и опускать пятки к полу.', true, NOW() - interval '1 hour');
    END IF;
  END IF;
END $$;