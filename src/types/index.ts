export type UserRole = 'user' | 'admin' | 'moderator';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  role: UserRole;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // в минутах
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  is_favorite?: boolean;
}

export interface Workout {
  id: string;
  course_id: string;
  title: string;
  description: string;
  duration: number; // в минутах
  calories?: number; // калории, сжигаемые за тренировку
  created_at: string;
  updated_at?: string;
}

export interface Exercise {
  id: string;
  workout_id: string;
  title: string;
  description: string;
  sets: number;
  reps: number;
  rest: number; // в секундах
  image_url?: string;
  video_url?: string;
  order_index: number; 
  created_at: string;
  updated_at?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  course_id: string;
  user_id: string;
  user: User;
  content: string;
  created_at: string;
  is_moderated: boolean;
}

export interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CourseFavorite {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
  updated_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  required_value: number;
  type: 'workout_count' | 'course_completion' | 'streak' | 'exercise_count';
  created_at: string;
  updated_at?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
  achievement?: Achievement;
}