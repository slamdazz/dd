import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ChatMessage, Course } from '../types';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { supabase, getCourses } from '../lib/supabase';

export const ChatModerationPage = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [courses, setCourses] = useState<{id: string; title: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Проверяем, имеет ли пользователь доступ к этой странице
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Получаем список курсов
        const { data: coursesData, error: coursesError } = await getCourses();
        if (coursesError) throw coursesError;
        
        if (coursesData) {
          const formattedCourses = coursesData.map(course => ({
            id: course.id,
            title: course.title
          }));
          setCourses(formattedCourses);
        }
        
        // Получаем все сообщения из чата для модерации
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select(`
            id,
            content,
            created_at,
            is_moderated,
            course_id,
            user_id,
            users(id, username, avatar_url, role, email, created_at)
          `)
          .order('created_at', { ascending: false });
        
        if (messagesError) throw messagesError;
        
        if (messagesData) {
          // Преобразуем данные в формат ChatMessage
          const formattedMessages = messagesData.map(message => {
            return {
              id: message.id,
              course_id: message.course_id,
              user_id: message.user_id,
              user: {
                id: message.users.id,
                username: message.users.username,
                email: message.users.email || '',
                role: message.users.role || 'user',
                created_at: message.users.created_at || '',
                avatar_url: message.users.avatar_url
              },
              content: message.content,
              created_at: message.created_at,
              is_moderated: message.is_moderated || false
            };
          });
          
          setMessages(formattedMessages);
          setFilteredMessages(formattedMessages);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, проверьте подключение к интернету и попробуйте снова.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Фильтрация сообщений при изменении параметров поиска или фильтров
  useEffect(() => {
    const filtered = messages.filter(message => {
      // Фильтр по поиску (содержимое сообщения или имя пользователя)
      const matchesSearch = 
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) || 
        message.user.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Фильтр по курсу
      const matchesCourse = filterCourse === '' || message.course_id === filterCourse;
      
      // Фильтр по статусу модерации
      const matchesStatus = filterStatus === '' || 
        (filterStatus === 'moderated' && message.is_moderated) ||
        (filterStatus === 'pending' && !message.is_moderated);
      
      return matchesSearch && matchesCourse && matchesStatus;
    });
    
    setFilteredMessages(filtered);
  }, [messages, searchTerm, filterCourse, filterStatus]);
  
  // Форматирование даты сообщения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };
  
  // Обработчики модерации
  const approveMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_moderated: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Обновляем локальное состояние
      setMessages(messages.map(message => 
        message.id === id ? { ...message, is_moderated: true } : message
      ));
    } catch (err) {
      console.error('Ошибка при одобрении сообщения:', err);
    }
  };
  
  const rejectMessage = async (id: string) => {
    try {
      // Удаляем сообщение из базы данных
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Обновляем локальное состояние
      setMessages(messages.filter(message => message.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении сообщения:', err);
    }
  };
  
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Модерация сообщений</h1>
          <p className="text-gray-600">
            Проверка и управление сообщениями в чатах курсов
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => window.location.reload()} 
              className="ml-2 underline"
            >
              Попробовать снова
            </button>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Поиск сообщений..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Фильтры
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Курс</label>
                  <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Все курсы</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус модерации</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Все статусы</option>
                    <option value="moderated">Проверенные</option>
                    <option value="pending">Ожидают проверки</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterCourse('');
                    setFilterStatus('');
                  }}
                  className="mr-2"
                >
                  Сбросить
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Применить
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка сообщений...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Сообщения не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => {
              const needsModeration = !message.is_moderated;
              const courseName = courses.find(c => c.id === message.course_id)?.title || 'Неизвестный курс';
              
              return (
                <div key={message.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className={`px-4 py-2 flex justify-between items-center ${needsModeration ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      {message.user.avatar_url ? (
                        <img 
                          src={message.user.avatar_url} 
                          alt={message.user.username} 
                          className="h-6 w-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {message.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium">{message.user.username}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">{courseName}</span>
                      {needsModeration ? (
                        <div className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 flex items-center">
                          <AlertTriangle size={12} className="mr-1" />
                          Ожидает проверки
                        </div>
                      ) : (
                        <div className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          Проверено
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-800">{message.content}</p>
                    <div className="mt-2 text-xs text-gray-500">{formatDate(message.created_at)}</div>
                  </div>
                  
                  {needsModeration && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => rejectMessage(message.id)}
                      >
                        <XCircle size={16} className="mr-1" />
                        Удалить
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => approveMessage(message.id)}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Одобрить
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};