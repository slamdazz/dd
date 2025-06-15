import { create } from 'zustand';
import { User } from '../types';
import { supabase, getUser, getUserProfile } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Omit<User, 'id' | 'email' | 'role'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const supabaseUser = await getUser();
      
      if (supabaseUser) {
        const { data, error } = await getUserProfile(supabaseUser.id);
          
        if (error) throw error;
        
        if (data) {
          set({
            user: {
              id: data.id,
              email: data.email,
              username: data.username,
              full_name: data.full_name,
              avatar_url: data.avatar_url,
              weight: data.weight,
              height: data.height,
              goal: data.goal,
              role: data.role || 'user',
              created_at: data.created_at || new Date().toISOString()
            },
            isAuthenticated: true,
          });
        }
      }
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ error: 'Ошибка при инициализации аутентификации' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      // Используем обновленную функцию из lib/supabase.ts
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: profileData, error: profileError } = await getUserProfile(data.user.id);
          
        if (profileError) throw profileError;
        
        if (profileData) {
          set({
            user: {
              id: profileData.id,
              email: profileData.email,
              username: profileData.username,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
              weight: profileData.weight,
              height: profileData.height,
              goal: profileData.goal,
              role: profileData.role || 'user',
              created_at: profileData.created_at || new Date().toISOString()
            },
            isAuthenticated: true,
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      set({ error: error.message || 'Ошибка при входе' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (email, password, username) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Ждем создания профиля через триггер в базе данных
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profileData, error: profileError } = await getUserProfile(data.user.id);
          
        if (profileError) throw profileError;
        
        if (profileData) {
          set({
            user: {
              id: profileData.id,
              email: profileData.email,
              username: profileData.username,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
              weight: profileData.weight,
              height: profileData.height,
              goal: profileData.goal,
              role: profileData.role || 'user',
              created_at: profileData.created_at || new Date().toISOString()
            },
            isAuthenticated: true,
          });
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      set({ error: error.message || 'Ошибка при регистрации' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ error: error.message || 'Ошибка при выходе' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  googleLogin: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Google login error:', error);
      set({ error: error.message || 'Ошибка при входе через Google' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      set({ error: error.message || 'Ошибка при сбросе пароля' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { user } = get();
      if (!user) throw new Error('Пользователь не авторизован');
      
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        set({
          user: {
            ...user,
            ...data
          }
        });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      set({ error: error.message || 'Ошибка при обновлении профиля' });
    } finally {
      set({ isLoading: false });
    }
  }
}));