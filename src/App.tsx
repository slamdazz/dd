import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { WorkoutDetailPage } from './pages/WorkoutDetailPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminCoursesPage } from './pages/AdminCoursesPage';
import { ChatModerationPage } from './pages/ChatModerationPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { useAuthStore } from './store/authStore';

// Защищенный маршрут для авторизованных пользователей
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Защищенный маршрут для администраторов
interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Защищенный маршрут для модераторов и администраторов
interface ModeratorRouteProps {
  children: React.ReactNode;
}

const ModeratorRoute: React.FC<ModeratorRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }
  
  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  useEffect(() => {
    // Добавляем класс для предотвращения оверскролла на мобильных устройствах
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);
  
  // Проверяем, видел ли пользователь онбординг
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        {/* Онбординг */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Перенаправление на онбординг, если пользователь его не видел */}
        <Route 
          path="/" 
          element={
            !isAuthenticated && !hasSeenOnboarding ? 
              <Navigate to="/onboarding" /> : 
              <HomePage />
          } 
        />
        
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Защищенные маршруты для авторизованных пользователей */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } />
        <Route path="/courses/:id" element={
          <ProtectedRoute>
            <CourseDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/workout/:id" element={
          <ProtectedRoute>
            <WorkoutDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        
        {/* Защищенные маршруты для администраторов */}
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        } />
        <Route path="/admin/courses" element={
          <AdminRoute>
            <AdminCoursesPage />
          </AdminRoute>
        } />
        
        {/* Защищенные маршруты для модераторов */}
        <Route path="/moderator/chat" element={
          <ModeratorRoute>
            <ChatModerationPage />
          </ModeratorRoute>
        } />
        
        {/* Перенаправление на главную при неизвестном маршруте */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;