import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChatBox } from '../components/chat/ChatBox';
import { ChatMessage, Course } from '../types';
import { useAuthStore } from '../store/authStore';
import { getCourses, getChatMessages, sendChatMessage, isUserEnrolledInCourse, enrollUserInCourse } from '../lib/supabase';
import { MessageSquare, AlertTriangle, Loader2 } from 'lucide-react'; // Добавил Loader2

export const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  const [courses, setCourses] = useState<{id: string; title: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        setError(null);
        const { data, error: coursesError } = await getCourses();
        
        if (coursesError) throw coursesError;
        
        if (data && data.length > 0) {
          const formattedCourses = data.map(course => ({
            id: course.id,
            title: course.title
          }));
          setCourses(formattedCourses);
          if (!activeCourseId && formattedCourses.length > 0) {
            setActiveCourseId(formattedCourses[0].id);
          }
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке курсов:', err);
        setError('Не удалось загрузить список курсов. Попробуйте обновить страницу.');
      } finally {
        setIsLoadingCourses(false);
      }
    };
    
    fetchCourses();
  }, []); 
  
  useEffect(() => {
    const fetchMessagesAndEnrollment = async () => {
      if (!activeCourseId || !user) {
        setMessages([]);
        setIsEnrolled(false);
        return;
      }
      
      try {
        setIsLoadingMessages(true);
        setError(null);
        
        const { isEnrolled: userEnrolled, error: enrolledError } = await isUserEnrolledInCourse(user.id, activeCourseId);
        
        if (enrolledError) {
          console.error('Ошибка при проверке записи на курс:', enrolledError);
        }
        setIsEnrolled(userEnrolled);
        
        if (userEnrolled) {
          const { data, error: messagesError } = await getChatMessages(activeCourseId);
          if (messagesError) {
            console.error('Ошибка при загрузке сообщений:', messagesError);
            setError('Не удалось загрузить сообщения чата для этого курса.');
            setMessages([]);
            return;
          }
          if (data && data.length > 0) {
            const formattedMessages: ChatMessage[] = data.map((message: any) => ({
              id: message.id,
              course_id: message.course_id,
              user_id: message.user_id,
              user: {
                id: message.users.id,
                username: message.users.username,
                email: '',  
                role: message.users.role || 'user',
                created_at: '',
                avatar_url: message.users.avatar_url
              },
              content: message.content,
              created_at: message.created_at,
              is_moderated: message.is_moderated || false
            }));
            setMessages(formattedMessages);
          } else {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных чата:', err);
        setError('Произошла ошибка при загрузке данных чата.');
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessagesAndEnrollment();
  }, [activeCourseId, user]);
  
  const handleSendMessage = async (content: string) => {
    if (!user || !activeCourseId || !isEnrolled) return;
    try {
      setError(null);
      const { data, error: sendError } = await sendChatMessage(activeCourseId, user.id, content);
      if (sendError) throw sendError;
      if (data) {
        const newMessage: ChatMessage = {
          id: data.id,
          course_id: data.course_id,
          user_id: data.user_id,
          user: {
            id: data.users.id,
            username: data.users.username,
            email: '',
            role: data.users.role || 'user',
            created_at: '',
            avatar_url: data.users.avatar_url
          },
          content: data.content,
          created_at: data.created_at,
          is_moderated: data.is_moderated || false
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error('Ошибка при отправке сообщения:', err);
      setError('Не удалось отправить сообщение. Попробуйте снова.');
    }
  };
  
  const handleEnrollCourse = async () => {
    if (!user || !activeCourseId) return;
    try {
      setError(null);
      const { error: enrollError } = await enrollUserInCourse(user.id, activeCourseId);
      if (enrollError) throw enrollError;
      setIsEnrolled(true);
    } catch (err) {
      console.error('Ошибка при записи на курс:', err);
      setError('Не удалось записаться на курс. Попробуйте позже.');
    }
  };

  const selectStyles: React.CSSProperties = {
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    paddingRight: '2.5rem', 
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23A0AEC0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, // Более светлая серая стрелка для темного фона
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.25em 1.25em',
    // Стили для темной темы селекта
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Очень прозрачный белый для темного фона
    color: 'white', // Белый текст
    borderColor: 'rgba(255, 255, 255, 0.2)', // Полупрозрачная белая рамка
  };
  
  return (
    <Layout>
      {/* Используем градиентный фон для всей страницы */}
      <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white">
        {/* Шапка */}
        <div className="p-4 sm:p-6 pb-3 bg-white/5 backdrop-blur-md shadow-lg border-b border-white/10">
          <div className="mb-3">
            <h1 className="text-2xl font-bold mb-1">Чаты курсов</h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              Общайтесь с другими участниками и инструкторами
            </p>
          </div>
          
          {error && (
            <div className="mb-3 p-3 bg-red-500/80 text-white rounded-lg text-sm flex items-center shadow-md">
              <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
              <button 
                className="ml-auto underline font-medium hover:text-red-100" 
                onClick={() => setError(null)}
              >
                Закрыть
              </button>
            </div>
          )}
          
          <div className="mb-2">
            <label htmlFor="course-select" className="block text-sm font-medium text-indigo-100 mb-1">
              Выберите курс для чата:
            </label>
            <div className="relative">
              <select
                id="course-select"
                value={activeCourseId}
                onChange={(e) => setActiveCourseId(e.target.value)}
                className="block w-full rounded-lg shadow-sm py-2.5 px-3 pr-10
                           focus:ring-2 focus:ring-pink-500 focus:border-pink-500 
                           disabled:bg-white/5 disabled:text-gray-400 disabled:cursor-not-allowed placeholder-gray-300"
                style={selectStyles}
                disabled={isLoadingCourses || courses.length === 0}
              >
                {isLoadingCourses && <option value="" style={{ color: 'black', backgroundColor: 'white' }}>Загрузка курсов...</option>}
                {!isLoadingCourses && courses.length === 0 && (
                  <option value="" disabled style={{ color: 'gray', backgroundColor: 'white' }}>Нет доступных курсов</option>
                )}
                {!isLoadingCourses && courses.length > 0 && !activeCourseId && (
                    <option value="" disabled style={{ color: 'gray', backgroundColor: 'white' }}>-- Выберите курс --</option>
                )}
                {courses.map((course) => (
                  // Опции должны быть светлыми на темном фоне, но браузеры могут переопределять это.
                  // Этот стиль - попытка улучшить читаемость.
                  <option key={course.id} value={course.id} style={{ color: 'black', backgroundColor: 'white' }}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Основной контент чата */}
        <div className="flex-1 p-4 sm:p-6 pt-3 overflow-y-auto">
          {isLoadingCourses && !activeCourseId ? (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 size={32} className="animate-spin text-indigo-300 mb-4" />
                <p className="text-indigo-200">Загрузка доступных курсов...</p>
            </div>
          ) : !activeCourseId && courses.length > 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare size={48} className="text-indigo-300 mb-4 opacity-70" />
              <h2 className="text-xl font-semibold text-white mb-2">Выберите курс</h2>
              <p className="text-indigo-200 max-w-md">
                Пожалуйста, выберите курс из списка выше, чтобы начать общение в чате.
              </p>
            </div>
          ) : !activeCourseId && courses.length === 0 && !isLoadingCourses ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare size={48} className="text-gray-400 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-gray-200 mb-2">Курсы не найдены</h2>
                <p className="text-gray-300 max-w-md">
                    На данный момент нет доступных курсов для чата.
                </p>
            </div>
          ) : !isEnrolled && activeCourseId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="p-3 bg-yellow-400/20 rounded-full mb-4">
                <AlertTriangle size={32} className="text-yellow-300" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Вы не записаны на этот курс</h2>
              <p className="text-indigo-200 mb-6 max-w-md">
                Чтобы просматривать сообщения и участвовать в обсуждении, вам необходимо записаться на курс.
              </p>
              <button
                onClick={handleEnrollCourse}
                className="bg-pink-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-purple-800 transition-colors duration-150 shadow-lg"
              >
                Записаться на курс
              </button>
            </div>
          ) : (
            <ChatBox
              courseId={activeCourseId}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoadingMessages}
              // Передаем темную тему для ChatBox, если он ее поддерживает
              // theme="dark" 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};