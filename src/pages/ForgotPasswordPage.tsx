import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { useAuthStore } from '../store/authStore';
import { Layout } from '../components/layout/Layout';
import { ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Если пользователь уже авторизован, перенаправляем на главную страницу
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <Layout fullScreen>
      <div className="flex flex-col h-full">
        <div className="relative h-1/4 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
          <Link to="/login" className="absolute top-4 left-4 text-white">
            <ArrowLeft size={24} />
          </Link>
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold">
              Восстановление пароля
            </h2>
          </div>
        </div>

        <div className="flex-1 py-6">
          <div className="px-6">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};