import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuthStore } from '../store/authStore';
import { Layout } from '../components/layout/Layout';
import { WaveBackground } from '../components/ui/WaveBackground';

export const RegisterPage = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  // Если пользователь уже авторизован, перенаправляем на главную страницу
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <Layout fullScreen>
      <div className="flex flex-col h-full">
        <div className="relative h-1/3 bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-center">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <WaveBackground color="#c7d2fe" opacity={0.2} height={40} />
          
          <motion.div 
            className="relative z-10 text-center text-white"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold">
              ФитнесПро
            </h2>
          </motion.div>
        </div>

        <motion.div 
          className="flex-1 py-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
              <span className="ml-2 text-gray-600">Загрузка...</span>
            </div>
          ) : (
            <div className="px-6">
              <RegisterForm />
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};