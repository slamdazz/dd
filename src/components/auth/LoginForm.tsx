import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { generateCaptcha } from '../../utils/captcha';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string; captcha?: string}>({});
  const [captchaText, setCaptchaText] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  
  const { login, googleLogin, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCaptcha();
  }, []);
  
  const refreshCaptcha = () => {
    const { text, dataURL } = generateCaptcha();
    setCaptchaText(text);
    setCaptchaImage(dataURL);
  };
  
  const validate = (): boolean => {
    const newErrors: {email?: string; password?: string; captcha?: string} = {};
    
    if (!email) newErrors.email = 'Email обязателен';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Некорректный email';
    
    if (!password) newErrors.password = 'Пароль обязателен';
    else if (password.length < 6) newErrors.password = 'Пароль должен содержать минимум 6 символов';
    
    if (!userCaptcha) newErrors.captcha = 'Введите код с картинки';
    else if (userCaptcha.toLowerCase() !== captchaText.toLowerCase()) newErrors.captcha = 'Неверный код с картинки';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <motion.div 
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Вход в аккаунт</h2>
        <p className="mt-1 text-gray-600">Введите свои данные для входа в систему</p>
      </motion.div>
      
      {error && (
        <motion.div 
          variants={itemVariants}
          className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg"
        >
          {error}
        </motion.div>
      )}
      
      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={itemVariants}>
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
          className="bg-gray-50 border-gray-200"
        />
        
        <Input
          label="Пароль"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          className="bg-gray-50 border-gray-200"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Проверка</label>
          <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg mb-2">
            {captchaImage && (
              <img 
                src={captchaImage} 
                alt="CAPTCHA" 
                className="h-12 mx-auto mb-2" 
              />
            )}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Введите код с картинки"
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value)}
                error={errors.captcha}
                required
                className="flex-1 bg-white border-gray-200"
              />
              <Button 
                type="button"
                variant="outline"
                onClick={refreshCaptcha}
              >
                Обновить
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Запомнить меня
            </label>
          </div>
          
          <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Забыли пароль?
          </Link>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          variant="gradient"
          className="bg-gradient-to-r from-indigo-500 to-indigo-700"
        >
          Войти
        </Button>
      </motion.form>
      
      <motion.div className="mt-6" variants={itemVariants}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Или войти с помощью</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            isLoading={isLoading}
            className="flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.684,1.909-2.239,3.159-4.39,3.159c-2.661,0-4.818-2.157-4.818-4.818s2.157-4.818,4.818-4.818c1.145,0,2.192,0.401,3.017,1.068l2.052-2.052C17.011,5.095,14.655,4.182,12.151,4.182c-4.376,0-7.909,3.533-7.909,7.909s3.533,7.909,7.909,7.909c6.146,0,9.659-4.515,8.591-10.728h-8.591C13.401,9.273,12.545,10.518,12.545,12.151z"
              ></path>
            </svg>
            Google
          </Button>
        </div>
      </motion.div>
      
      <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-gray-600">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Зарегистрироваться
        </Link>
      </motion.p>
    </motion.div>
  );
};