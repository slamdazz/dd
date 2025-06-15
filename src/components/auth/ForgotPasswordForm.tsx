import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { resetPassword, isLoading } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при сбросе пароля');
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="w-full text-center">
        <div className="rounded-full bg-green-100 p-4 mx-auto w-16 h-16 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Проверьте вашу почту</h2>
        <p className="text-gray-600 mb-6">
          Мы отправили инструкции по сбросу пароля на {email}. Пожалуйста, проверьте вашу электронную почту.
        </p>
        <p className="text-gray-600 mb-4">
          Не получили письмо? Проверьте папку "Спам" или запросите новое письмо.
        </p>
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            fullWidth
          >
            Попробовать снова
          </Button>
          <Link to="/login" className="block">
            <Button fullWidth>
              Вернуться на страницу входа
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Сброс пароля</h2>
        <p className="mt-1 text-gray-600">Введите email, и мы отправим вам инструкции по сбросу пароля</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Отправить инструкции
        </Button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Вспомнили пароль?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Вернуться на страницу входа
        </Link>
      </p>
    </div>
  );
};