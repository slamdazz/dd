/*
  # Обновление политик RLS для таблиц

  1. Изменения
     - Добавление политик SELECT для таблиц courses и workouts
     - Обеспечение доступа всех аутентифицированных пользователей к данным курсов и тренировок

  2. Security
     - Обновлены политики для обеспечения доступа к данным курсов и тренировок
*/

-- Политика для courses: разрешить аутентифицированным пользователям читать все курсы
DROP POLICY IF EXISTS "Курсы доступны всем для чтения" ON public.courses;
CREATE POLICY "Курсы доступны аутентифицированным пользователям" 
ON public.courses 
FOR SELECT 
TO authenticated 
USING (true);

-- Политика для workouts: разрешить аутентифицированным пользователям читать все тренировки
DROP POLICY IF EXISTS "Тренировки доступны всем для чтен" ON public.workouts;
CREATE POLICY "Тренировки доступны аутентифицированным пользователям" 
ON public.workouts 
FOR SELECT 
TO authenticated 
USING (true);

-- Политика для exercises: разрешить аутентифицированным пользователям читать все упражнения
DROP POLICY IF EXISTS "Упражнения доступны всем для чтен" ON public.exercises;
CREATE POLICY "Упражнения доступны аутентифицированным пользователям" 
ON public.exercises 
FOR SELECT 
TO authenticated 
USING (true);