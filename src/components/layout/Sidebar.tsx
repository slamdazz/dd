import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, BookOpen, MessageCircle, Settings, Users, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center mb-8">
        <div className="bg-blue-600 text-white p-2 rounded-md">
          <Shield size={24} />
        </div>
        <h1 className="ml-2 font-bold text-xl">ФитнесПро</h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link 
          to="/" 
          className={`flex items-center px-3 py-2 rounded-md ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <Home size={20} className="mr-3" />
          <span>Главная</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex items-center px-3 py-2 rounded-md ${isActive('/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <User size={20} className="mr-3" />
          <span>Личный кабинет</span>
        </Link>
        
        <Link 
          to="/courses" 
          className={`flex items-center px-3 py-2 rounded-md ${isActive('/courses') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <BookOpen size={20} className="mr-3" />
          <span>Курсы</span>
        </Link>
        
        <Link 
          to="/chat" 
          className={`flex items-center px-3 py-2 rounded-md ${isActive('/chat') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <MessageCircle size={20} className="mr-3" />
          <span>Чат курса</span>
        </Link>
        
        {(isAdmin || isModerator) && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Управление
            </h3>
            
            {isAdmin && (
              <>
                <Link 
                  to="/admin/users" 
                  className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/users') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Users size={20} className="mr-3" />
                  <span>Пользователи</span>
                </Link>
                
                <Link 
                  to="/admin/courses" 
                  className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/courses') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <BookOpen size={20} className="mr-3" />
                  <span>Управление курсами</span>
                </Link>
              </>
            )}
            
            {(isModerator || isAdmin) && (
              <Link 
                to="/moderator/chat" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/moderator/chat') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Shield size={20} className="mr-3" />
                <span>Модерация чатов</span>
              </Link>
            )}
          </div>
        )}
      </nav>
      
      <div className="border-t border-gray-200 pt-4 mt-auto">
        <div className="flex items-center px-3 py-2">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="h-8 w-8 rounded-full" />
            ) : (
              <span className="text-sm font-medium text-gray-500">{user?.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="mt-2 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
        >
          <LogOut size={20} className="mr-3" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
};