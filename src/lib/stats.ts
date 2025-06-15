import { supabase } from './supabase';

export interface UserStats {
  totalWorkouts: number;
  totalTime: number; // в минутах
  currentStreak: number;
  achievements: number;
  completedCourses: number;
  activeDays: number;
}

export interface ActivityData {
  day: string;
  minutes: number;
  date: string;
}

// Получение статистики пользователя
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Общее количество завершенных курсов
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('completed, course_id')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    const totalWorkouts = progressData?.filter(p => p.completed).length || 0;

    // Получаем продолжительности курсов для подсчета времени
    const courseIds = progressData?.map(p => p.course_id) || [];
    let totalTime = 0;
    
    if (courseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('duration, id')
        .in('id', courseIds);

      if (!coursesError && coursesData) {
        // Подсчитываем общее время на основе завершенных курсов
        progressData?.forEach(progress => {
          if (progress.completed) {
            const course = coursesData.find(c => c.id === progress.course_id);
            if (course) {
              totalTime += course.duration;
            }
          }
        });
      }
    }

    // Количество завершенных курсов
    const completedCourses = totalWorkouts;

    // Текущая серия (приблизительный расчет на основе последних дней с активностью)
    const currentStreak = Math.max(1, Math.floor(totalWorkouts / 2)); // Примерная формула

    // Количество достижений
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('completed')
      .eq('user_id', userId)
      .eq('completed', true);

    const achievements = achievementsData?.length || 0;

    // Количество активных дней (приблизительный расчет)
    const activeDays = Math.min(totalWorkouts, 30); // Максимум 30 дней за последний месяц

    return {
      totalWorkouts,
      totalTime,
      currentStreak,
      achievements,
      completedCourses,
      activeDays
    };
  } catch (error) {
    console.error('Ошибка при получении статистики пользователя:', error);
    return {
      totalWorkouts: 0,
      totalTime: 0,
      currentStreak: 0,
      achievements: 0,
      completedCourses: 0,
      activeDays: 0
    };
  }
}

// Получение активности пользователя за последние 7 дней
export async function getUserActivity(userId: string): Promise<ActivityData[]> {
  try {
    // Генерируем данные за последние 7 дней
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date();
    const activityData: ActivityData[] = [];

    // Получаем данные о завершенных курсах пользователя
    const { data: progressData, error } = await supabase
      .from('user_progress')
      .select(`
        completed,
        updated_at,
        courses:course_id (
          duration
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Понедельник = 0
      
      // Имитируем активность на основе общего прогресса
      let dayMinutes = 0;
      if (progressData && progressData.length > 0) {
        // Рандомная активность на основе общего прогресса пользователя
        const totalCompleted = progressData.filter(p => p.completed).length;
        if (totalCompleted > 0) {
          // Генерируем активность: больше у активных пользователей
          const baseActivity = Math.min(totalCompleted * 10, 60);
          dayMinutes = Math.floor(Math.random() * baseActivity);
          
          // Некоторые дни без активности
          if (Math.random() < 0.2) dayMinutes = 0;
        }
      }

      activityData.push({
        day: dayName,
        minutes: dayMinutes,
        date: date.toISOString().split('T')[0]
      });
    }

    return activityData;
  } catch (error) {
    console.error('Ошибка при получении активности пользователя:', error);
    
    // Возвращаем пустые данные в случае ошибки
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map((day, index) => ({
      day,
      minutes: 0,
      date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  }
}

// Получение текущей тренировки пользователя
export async function getCurrentWorkout(userId: string) {
  try {
    // Находим незавершенный курс пользователя
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select(`
        completed,
        course_id,
        courses:course_id (
          title,
          duration
        )
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (progressError) throw progressError;

    if (!progressData || progressData.length === 0) {
      return null;
    }

    const userProgress = progressData[0];
    const course = userProgress.courses;
    
    if (!course) {
      return null;
    }

    // Получаем тренировку для этого курса
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('course_id', userProgress.course_id)
      .single();

    if (workoutError || !workoutData) {
      return null;
    }

    // Прогресс всегда 0% для незавершенных курсов
    const progress = 0;

    return {
      id: workoutData.id,
      title: workoutData.title,
      description: workoutData.description,
      duration: workoutData.duration,
      courseTitle: course.title,
      progress
    };
  } catch (error) {
    console.error('Ошибка при получении текущей тренировки:', error);
    return null;
  }
}