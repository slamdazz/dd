/*
  # Основная схема данных фитнес-приложения

  1. Новые таблицы
     - `courses` - Курсы тренировок
     - `workouts` - Тренировки в рамках курсов
     - `exercises` - Упражнения в тренировках
     - `user_courses` - Связь пользователей и курсов
     - `user_progress` - Прогресс пользователей по курсам
     - `chat_messages` - Сообщения в чатах курсов

  2. Безопасность
     - Включение Row Level Security для всех таблиц
     - Настройка политик доступа
     - Защита данных пользователей
*/

-- Таблица для курсов тренировок
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL, -- длительность в днях
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для тренировок в рамках курсов
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- в минутах
  day INTEGER NOT NULL, -- день курса
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для упражнений в тренировках
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest INTEGER NOT NULL, -- в секундах
  image_url TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL, -- порядок упражнений
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Связь пользователей и курсов
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Прогресс пользователей
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  completed_workouts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Сообщения в чатах курсов
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Расширяем таблицу пользователей дополнительными полями
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'height'
  ) THEN
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255),
      avatar_url TEXT,
      weight NUMERIC(5,2),
      height NUMERIC(5,2),
      goal VARCHAR(50),
      role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Включаем RLS для всех таблиц
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы курсов
CREATE POLICY "Курсы доступны всем для чтения" 
ON courses FOR SELECT USING (true);

-- Политики безопасности для таблицы тренировок
CREATE POLICY "Тренировки доступны всем для чтения" 
ON workouts FOR SELECT USING (true);

-- Политики безопасности для таблицы упражнений
CREATE POLICY "Упражнения доступны всем для чтения" 
ON exercises FOR SELECT USING (true);

-- Политики безопасности для таблицы связи пользователей и курсов
CREATE POLICY "Пользователи видят только свои курсы" 
ON user_courses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут записываться на курсы" 
ON user_courses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои записи" 
ON user_courses FOR UPDATE USING (auth.uid() = user_id);

-- Политики безопасности для таблицы прогресса
CREATE POLICY "Пользователи видят только свой прогресс" 
ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать записи прогресса" 
ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свой прогресс" 
ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Политики безопасности для таблицы сообщений в чатах
CREATE POLICY "Пользователи видят сообщения в своих курсах" 
ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_courses 
    WHERE user_courses.user_id = auth.uid() 
    AND user_courses.course_id = chat_messages.course_id
  )
);

CREATE POLICY "Пользователи могут отправлять сообщения в своих курсах" 
ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM user_courses 
    WHERE user_courses.user_id = auth.uid() 
    AND user_courses.course_id = chat_messages.course_id
  )
);

-- Политики безопасности для таблицы пользователей
CREATE POLICY "Пользователи могут видеть свои данные" 
ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Пользователи могут обновлять свои данные" 
ON users FOR UPDATE USING (auth.uid() = id);

-- Триггер для обновления timestamp в users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- Триггер для обновления timestamp в courses
CREATE OR REPLACE FUNCTION update_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_courses_updated_at();

-- Триггер для обновления timestamp в workouts
CREATE OR REPLACE FUNCTION update_workouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON workouts
FOR EACH ROW
EXECUTE FUNCTION update_workouts_updated_at();

-- Триггер для обновления timestamp в user_courses
CREATE OR REPLACE FUNCTION update_user_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_courses_updated_at
BEFORE UPDATE ON user_courses
FOR EACH ROW
EXECUTE FUNCTION update_user_courses_updated_at();

-- Триггер для обновления timestamp в user_progress
CREATE OR REPLACE FUNCTION update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION update_user_progress_updated_at();

-- Функция для создания записи профиля при регистрации пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role)
  VALUES (NEW.id, 
         COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)), 
         NEW.email,
         'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();