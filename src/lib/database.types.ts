export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string | null
          required_value: number
          type: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon?: string | null
          required_value?: number
          type: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string | null
          required_value?: number
          type?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          course_id: string
          user_id: string
          content: string
          is_moderated: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          content: string
          is_moderated?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          content?: string
          is_moderated?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      course_favorites: {
        Row: {
          id: string
          user_id: string
          course_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_favorites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      course_ratings: {
        Row: {
          id: string
          user_id: string
          course_id: string
          rating: number
          comment: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          rating: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          rating?: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          level: string
          duration: number
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          avg_rating: number | null
          ratings_count: number | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          level: string
          duration: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          avg_rating?: number | null
          ratings_count?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          level?: string
          duration?: number
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          avg_rating?: number | null
          ratings_count?: number | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          title: string
          description: string
          sets: number
          reps: number
          rest: number
          image_url: string | null
          video_url: string | null
          order_index: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          workout_id: string
          title: string
          description: string
          sets: number
          reps: number
          rest: number
          image_url?: string | null
          video_url?: string | null
          order_index: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          workout_id?: string
          title?: string
          description?: string
          sets?: number
          reps?: number
          rest?: number
          image_url?: string | null
          video_url?: string | null
          order_index?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          food_name: string
          calories: number
          protein: number | null
          carbs: number | null
          fats: number | null
          date: string
          meal_type: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          calories: number
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          date?: string
          meal_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          calories?: number
          protein?: number | null
          carbs?: number | null
          fats?: number | null
          date?: string
          meal_type?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          completed: boolean
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_courses: {
        Row: {
          id: string
          user_id: string
          course_id: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          current_day: number
          completed_workouts: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          current_day?: number
          completed_workouts?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          current_day?: number
          completed_workouts?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string | null
          avatar_url: string | null
          weight: number | null
          height: number | null
          goal: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          weight?: number | null
          height?: number | null
          goal?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          weight?: number | null
          height?: number | null
          goal?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string
          duration: number
          day: number
          created_at: string | null
          updated_at: string | null
          calories: number | null
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description: string
          duration: number
          day: number
          created_at?: string | null
          updated_at?: string | null
          calories?: number | null
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string
          duration?: number
          day?: number
          created_at?: string | null
          updated_at?: string | null
          calories?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}