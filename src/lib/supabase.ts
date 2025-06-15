import { createClient, type User } from '@supabase/supabase-js';
import { Database } from './database.types';
import { NutritionLog } from '../types';

// Переменные из .env файла
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Проверка наличия URL и ключа
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Ошибка: Отсутствуют переменные окружения для Supabase.');
}

// Создаем клиент Supabase с типизацией
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Аутентификация: вход по email/паролю
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error('Ошибка при авторизации:', err);
    return { data: null, error: err as Error };
  }
}

// Аутентификация: регистрация
export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
  return { data, error };
}

// Аутентификация: выход
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Аутентификация: получение текущего пользователя
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Аутентификация: вход через Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// Аутентификация: сброс пароля
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
}

// Получение профиля пользователя
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  } catch (err: any) {
    // Обработка ошибки "нет строк"
    if (err.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: err };
  }
}

// Обновление профиля пользователя
export async function updateUserProfile(userId: string, updates: Partial<{
  username: string;
  full_name: string;
  avatar_url: string;
  weight: number;
  height: number;
  goal: string;
}>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}

// Получение курсов
export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

// Получение курса по ID
export async function getCourseById(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) {
      // Проверяем, является ли ошибка "нет строк"
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }
    
    return { data, error };
  } catch (err: any) {
    // Обработка ошибки "нет строк"
    if (err.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: err };
  }
}

// Получение тренировки курса (теперь одна тренировка на курс)
export async function getCourseWorkout(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    return { data, error };
  } catch (err) {
    console.error('Ошибка при получении тренировки:', err);
    return { data: null, error: err as Error };
  }
}

// Получение тренировки по ID
export async function getWorkoutById(workoutId: string) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();
    
    if (error) {
      // Проверяем, является ли ошибка "нет строк"
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }
    
    return { data, error };
  } catch (err: any) {
    // Обработка ошибки "нет строк"
    if (err.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data: null, error: err };
  }
}

// Получение упражнений тренировки
export async function getWorkoutExercises(workoutId: string) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('order_index', { ascending: true });
  
  return { data, error };
}

// Запись пользователя на курс
export async function enrollUserInCourse(userId: string, courseId: string) {
  // Создаем запись в таблице user_courses
  const { error: enrollError } = await supabase
    .from('user_courses')
    .insert([
      { user_id: userId, course_id: courseId }
    ]);
  
  if (enrollError) return { error: enrollError };
  
  // Создаем запись в таблице user_progress
  const { error: progressError } = await supabase
    .from('user_progress')
    .insert([
      { 
        user_id: userId, 
        course_id: courseId,
        completed: false
      }
    ]);
  
  return { error: progressError };
}

// Получение прогресса пользователя по курсу
export async function getUserCourseProgress(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId);
    
    // Если произошла ошибка при выполнении запроса
    if (error) {
      console.error('Error fetching user course progress:', error);
      return { data: null, error };
    }
    
    // Если массив данных пуст (прогресс не найден)
    if (!data || data.length === 0) {
      return { data: null, error: null };
    }
    
    // Если данные присутствуют, вернуть первый элемент массива
    return { data: data[0], error: null };
    
  } catch (err: any) {
    // Обработка непредвиденных ошибок (например, сетевых или других исключений)
    console.error('Unexpected error in getUserCourseProgress:', err);
    return { data: null, error: err as Error };
  }
}

// Обновление прогресса пользователя
export async function updateUserProgress(
  userId: string, 
  courseId: string, 
  updates: { completed: boolean }
) {
  const { data, error } = await supabase
    .from('user_progress')
    .update(updates)
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()
    .single();
  
  return { data, error };
}

// Получение сообщений в чате курса
export async function getChatMessages(courseId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      created_at,
      is_moderated,
      user_id,
      course_id
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: true });

  if (error) return { data: null, error };
  
  // Получаем данные пользователей отдельно
  if (data && data.length > 0) {
    const userIds = [...new Set(data.map(msg => msg.user_id))];
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar_url, role')
      .in('id', userIds);
    
    if (usersError) return { data: null, error: usersError };
    
    // Соединяем данные
    const messagesWithUsers = data.map(message => ({
      ...message,
      users: usersData?.find(user => user.id === message.user_id) || {
        id: message.user_id,
        username: 'Пользователь',
        avatar_url: null,
        role: 'user'
      }
    }));
    
    return { data: messagesWithUsers, error: null };
  }
  
  return { data: [], error: null };
}

// Отправка сообщения в чат
export async function sendChatMessage(courseId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([
      { course_id: courseId, user_id: userId, content }
    ])
    .select(`
      id,
      content,
      created_at,
      is_moderated,
      user_id,
      course_id
    `)
    .single();
  
  if (error) return { data: null, error };
  
  // Получаем данные пользователя отдельно
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, username, avatar_url, role')
    .eq('id', userId)
    .single();
  
  if (userError) return { data: null, error: userError };
  
  return {
    data: {
      ...data,
      users: userData
    },
    error: null
  };
}

// Проверка, записан ли пользователь на курс
export async function isUserEnrolledInCourse(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error) {
      // Проверяем, является ли ошибка "нет строк"
      if (error.code === 'PGRST116') {
        return { isEnrolled: false, error: null };
      }
      return { isEnrolled: false, error };
    }
    
    return { isEnrolled: !!data, error: null };
  } catch (err: any) {
    // Обработка ошибки "нет строк" - пользователь не записан на курс
    if (err.code === 'PGRST116') {
      return { isEnrolled: false, error: null };
    }
    return { isEnrolled: false, error: err };
  }
}

// Добавление курса в избранное
export async function addCourseToFavorites(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('course_favorites')
    .insert([
      { user_id: userId, course_id: courseId }
    ])
    .select()
    .single();
  
  return { data, error };
}

// Удаление курса из избранного
export async function removeCourseFromFavorites(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('course_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);
  
  return { data, error };
}

// Проверка, находится ли курс в избранном
export async function isCourseFavorite(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('course_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId); 
    
    if (error) {
      console.error('Error checking if course is favorite:', error);
      return { isFavorite: false, error };
    }
    
    if (data && data.length > 0) {
      return { isFavorite: true, error: null };
    }
    
    return { isFavorite: false, error: null };
    
  } catch (err: any) {
    console.error('Unexpected error in isCourseFavorite:', err);
    return { isFavorite: false, error: err as Error };
  }
}

// Получение избранных курсов пользователя
export async function getUserFavoriteCourses(userId: string) {
  const { data, error } = await supabase
    .from('course_favorites')
    .select('id, course_id')
    .eq('user_id', userId);
  
  if (error) return { data: null, error };
  
  if (!data || data.length === 0) {
    return { data: [], error: null };
  }
  
  const courseIds = data.map(fav => fav.course_id);
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds);
  
  if (coursesError) return { data: null, error: coursesError };
  
  const favoritesWithCourses = data.map(favorite => ({
    ...favorite,
    courses: coursesData?.find(course => course.id === favorite.course_id)
  }));
  
  return { data: favoritesWithCourses, error: null };
}

// Добавление записи о питании
export async function addNutritionLog(userId: string, nutritionData: Omit<NutritionLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert([
      { 
        user_id: userId,
        food_name: nutritionData.food_name,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fats: nutritionData.fats,
        date: nutritionData.date,
        meal_type: nutritionData.meal_type
      }
    ])
    .select()
    .single();
  
  return { data, error };
}

// Получение записей о питании пользователя
export async function getUserNutritionLogs(userId: string, date?: string) {
  let query = supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId);
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
}

// Получение достижений пользователя
export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);
  
  if (error) return { data: null, error };
  
  if (!data || data.length === 0) {
    return { data: [], error: null };
  }
  
  const achievementIds = data.map(ua => ua.achievement_id);
  const { data: achievementsData, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .in('id', achievementIds);
  
  if (achievementsError) return { data: null, error: achievementsError };
  
  const userAchievementsWithDetails = data.map(userAchievement => ({
    ...userAchievement,
    achievement: achievementsData?.find(achievement => achievement.id === userAchievement.achievement_id)
  }));
  
  return { data: userAchievementsWithDetails, error: null };
}

// Получение количества записанных пользователей на курс
export async function getCourseEnrollmentCount(courseId: string) {
  const { count, error } = await supabase
    .from('user_courses')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .eq('is_active', true);
  
  return { count: count || 0, error };
}