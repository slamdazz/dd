import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Filter, User } from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AdminUsersPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем доступ
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке пользователей:', error);
        setError('Не удалось загрузить пользователей. Проверьте подключение к интернету.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === '' || user.role === filterRole;
      const matchesStatus = filterStatus === '' || filterStatus === 'active'; // заглушка

      return matchesSearch && matchesRole && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'moderator':
        return 'Модератор';
      case 'user':
        return 'Пользователь';
      default:
        return 'Неизвестно';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Для модального окна редактирования
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: '' as UserRole,
  });

  const openEditModal = (user: UserType) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      // Обновляем в auth.users
      const { error: authError } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        {
          email: editForm.email,
          user_metadata: { username: editForm.username },
        }
      );

      if (authError) throw authError;

      // Обновляем в public.users
      const { error: dbError } = await supabase
        .from('users')
        .update({
          username: editForm.username,
          email: editForm.email,
          role: editForm.role,
        })
        .eq('id', selectedUser.id);

      if (dbError) throw dbError;

      // Обновляем локально список
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id
          ? { ...user, ...editForm }
          : user
      );
      setUsers(updatedUsers);
      setIsModalOpen(false);
    } catch (error: any) {
      setError('Ошибка при обновлении пользователя: ' + error.message);
    }
  };

  const deleteUser = async (user: UserType) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      // Удаляем из auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      if (authError) throw authError;

      // Удаляем из public.users
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Обновляем локально
      setUsers(users.filter(u => u.id !== user.id));
    } catch (error: any) {
      setError('Ошибка при удалении пользователя: ' + error.message);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Управление пользователями</h1>
          <p className="text-gray-600">
            Просмотр и редактирование информации о пользователях
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
                placeholder="Поиск пользователей..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль пользователя</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Все роли</option>
                    <option value="user">Пользователи</option>
                    <option value="moderator">Модераторы</option>
                    <option value="admin">Администраторы</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="blocked">Заблокированные</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterRole('');
                    setFilterStatus('');
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <p>Загрузка...</p>
        ) : filteredUsers.length === 0 ? (
          <p>Пользователи не найдены.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border border-gray-300">Имя</th>
                  <th className="py-3 px-4 border border-gray-300">Email</th>
                  <th className="py-3 px-4 border border-gray-300">Роль</th>
                  <th className="py-3 px-4 border border-gray-300">Дата регистрации</th>
                  <th className="py-3 px-4 border border-gray-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border border-gray-300 hover:bg-gray-50">
                    <td className="py-2 px-4 border border-gray-300">{user.username}</td>
                    <td className="py-2 px-4 border border-gray-300">{user.email}</td>
                    <td className={`py-2 px-4 border border-gray-300 ${getRoleColor(user.role)} font-semibold rounded-md text-center`}>
                      {getRoleName(user.role)}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">{formatDate(user.created_at)}</td>
                    <td className="py-2 px-4 border border-gray-300 space-x-2">
                      <Button size="sm" onClick={() => openEditModal(user)}>Редактировать</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteUser(user)}>Удалить</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Модальное окно редактирования */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Редактировать пользователя</h2>

              <label className="block mb-2">
                Имя:
                <Input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="mt-1"
                />
              </label>

              <label className="block mb-2">
                Email:
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="mt-1"
                />
              </label>

              <label className="block mb-4">
                Роль:
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value as UserRole})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="user">Пользователь</option>
                  <option value="moderator">Модератор</option>
                  <option value="admin">Администратор</option>
                </select>
              </label>

              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Отменить</Button>
                <Button onClick={handleSaveChanges}>Сохранить</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
