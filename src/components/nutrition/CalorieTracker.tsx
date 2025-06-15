import React, { useState, useEffect } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { getUserNutritionLogs, addNutritionLog } from '../../lib/supabase';
import { NutritionLog } from '../../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CalorieTrackerProps {
  className?: string;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack'
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  
  const fetchLogs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getUserNutritionLogs(user.id, today);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err) {
      console.error('Ошибка при загрузке данных о питании:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [user]);
  
  const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = logs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbs = logs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFats = logs.reduce((sum, log) => sum + (log.fats || 0), 0);
  
  const getMealTypeLabel = (type: string): string => {
    switch (type) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      case 'snack': return 'Перекус';
      default: return 'Другое';
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.foodName || !formData.calories) return;
    
    try {
      const { data, error } = await addNutritionLog(user.id, {
        food_name: formData.foodName,
        calories: parseInt(formData.calories) || 0,
        protein: formData.protein ? parseFloat(formData.protein) : undefined,
        carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
        fats: formData.fats ? parseFloat(formData.fats) : undefined,
        date: today,
        meal_type: formData.mealType
      });
      
      if (error) throw error;
      
      // Добавляем новую запись к списку
      if (data) {
        setLogs([...logs, data]);
      }
      
      // Сбрасываем форму
      setFormData({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        mealType: 'breakfast'
      });
      
      setShowAddForm(false);
    } catch (err) {
      console.error('Ошибка при добавлении записи о питании:', err);
    }
  };
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Калории сегодня</h3>
          <Button 
            variant="ghost"
            className="text-white p-1 h-auto hover:bg-white/20"
            onClick={() => setShowAddForm(prev => !prev)}
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {showAddForm && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="font-medium text-sm mb-2">Добавить прием пищи</h4>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Input
                  name="foodName"
                  placeholder="Название блюда"
                  value={formData.foodName}
                  onChange={handleInputChange}
                  required
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="calories"
                    placeholder="Калории"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
                  >
                    <option value="breakfast">Завтрак</option>
                    <option value="lunch">Обед</option>
                    <option value="dinner">Ужин</option>
                    <option value="snack">Перекус</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    name="protein"
                    placeholder="Белки (г)"
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={handleInputChange}
                  />
                  
                  <Input
                    name="carbs"
                    placeholder="Углеводы (г)"
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={handleInputChange}
                  />
                  
                  <Input
                    name="fats"
                    placeholder="Жиры (г)"
                    type="number"
                    step="0.1"
                    value={formData.fats}
                    onChange={handleInputChange}
                  />
                </div>
                
                <Button type="submit" fullWidth>Добавить</Button>
              </div>
            </form>
          </div>
        )}
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-600"></div>
              <span className="ml-2 text-sm text-gray-500">Загрузка...</span>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700 mb-1">Всего калорий</p>
                  <p className="text-xl font-bold text-green-800">{totalCalories} ккал</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 mb-1">Приемов пищи</p>
                  <p className="text-xl font-bold text-blue-800">{logs.length}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Макронутриенты</h4>
                <span className="text-xs text-gray-500">Всего</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Белки</span>
                  </div>
                  <span className="text-sm font-medium">{totalProtein.toFixed(1)} г</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Углеводы</span>
                  </div>
                  <span className="text-sm font-medium">{totalCarbs.toFixed(1)} г</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Жиры</span>
                  </div>
                  <span className="text-sm font-medium">{totalFats.toFixed(1)} г</span>
                </div>
              </div>
              
              <h4 className="font-medium text-sm mb-2">История</h4>
              
              {logs.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">Записей о питании нет</p>
              ) : (
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="bg-gray-50 p-2 rounded-lg flex items-center">
                      <div className="mr-3 bg-green-100 text-green-800 p-2 rounded-lg">
                        <Clock size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.food_name}</p>
                        <p className="text-xs text-gray-500">
                          {getMealTypeLabel(log.meal_type)} • {log.calories} ккал
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};