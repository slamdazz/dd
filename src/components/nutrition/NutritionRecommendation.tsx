import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import * as tf from '@tensorflow/tfjs';

interface NutritionRecommendationProps {
  className?: string;
}

interface Recommendation {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  reason: string;
}

// Небольшая база данных продуктов для рекомендаций
const foodDatabase = [
  { name: 'Куриная грудка', calories: 165, protein: 31, carbs: 0, fats: 3.6, category: 'protein', tags: ['низкокалорийное', 'высокобелковое'] },
  { name: 'Лосось', calories: 206, protein: 22, carbs: 0, fats: 13, category: 'protein', tags: ['омега-3', 'белок'] },
  { name: 'Яйца', calories: 155, protein: 13, carbs: 1.1, fats: 11, category: 'protein', tags: ['завтрак', 'универсальное'] },
  { name: 'Греческий йогурт', calories: 100, protein: 10, carbs: 4, fats: 5, category: 'dairy', tags: ['пробиотики', 'белок'] },
  { name: 'Овсянка', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, category: 'carbs', tags: ['медленные углеводы', 'клетчатка'] },
  { name: 'Киноа', calories: 368, protein: 14, carbs: 64, fats: 6, category: 'carbs', tags: ['суперфуд', 'белок'] },
  { name: 'Сладкий картофель', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, category: 'carbs', tags: ['сложные углеводы', 'витамины'] },
  { name: 'Шпинат', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, category: 'vegetables', tags: ['железо', 'антиоксиданты'] },
  { name: 'Брокколи', calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4, category: 'vegetables', tags: ['витамин C', 'клетчатка'] },
  { name: 'Авокадо', calories: 160, protein: 2, carbs: 8.5, fats: 14.7, category: 'fats', tags: ['полезные жиры', 'калий'] },
  { name: 'Орехи миндаля', calories: 579, protein: 21, carbs: 21, fats: 49, category: 'fats', tags: ['полезные жиры', 'витамин E'] },
  { name: 'Черника', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, category: 'fruits', tags: ['антиоксиданты', 'витамины'] },
  { name: 'Бананы', calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3, category: 'fruits', tags: ['калий', 'энергия'] },
  { name: 'Чечевица', calories: 116, protein: 9, carbs: 20, fats: 0.4, category: 'legumes', tags: ['растительный белок', 'клетчатка'] },
  { name: 'Темный шоколад', calories: 598, protein: 7.8, carbs: 45.9, fats: 43, category: 'treats', tags: ['антиоксиданты', 'магний'] },
];

export const NutritionRecommendation: React.FC<NutritionRecommendationProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Симуляция загрузки модели TensorFlow
  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        
        // Имитация загрузки модели (в реальном приложении здесь был бы код загрузки модели)
        await tf.ready();
        
        // Просто для демонстрации - создаем простой тензор
        const demoTensor = tf.tensor2d([[1, 2], [3, 4]]);
        console.log('TensorFlow готов:', demoTensor.shape);
        demoTensor.dispose(); // Освобождаем память
        
        setModelLoaded(true);
      } catch (err) {
        console.error('Ошибка при загрузке TensorFlow модели:', err);
        setError('Не удалось загрузить модель рекомендаций');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadModel();
  }, []);
  
  // Генерация персонализированных рекомендаций
  useEffect(() => {
    if (!user || !modelLoaded) return;
    
    generateRecommendations();
  }, [user, modelLoaded]);
  
  // Функция для генерации рекомендаций на основе профиля пользователя
  const generateRecommendations = () => {
    try {
      setIsLoading(true);
      
      // В реальном приложении здесь были бы вызовы модели TensorFlow
      // Мы имитируем рекомендации на основе цели пользователя
      const goal = user?.goal || 'overall_health';
      
      let selectedFoods: Recommendation[] = [];
      
      switch (goal) {
        case 'weight_loss':
          // Для похудения рекомендуем низкокалорийные продукты с высоким содержанием белка
          selectedFoods = [
            {
              foodName: 'Куриная грудка',
              calories: 165,
              protein: 31,
              carbs: 0,
              fats: 3.6,
              category: 'protein',
              reason: 'Высокое содержание белка помогает сохранять мышечную массу при снижении веса'
            },
            {
              foodName: 'Греческий йогурт',
              calories: 100,
              protein: 10,
              carbs: 4,
              fats: 5,
              category: 'dairy',
              reason: 'Низкокалорийный источник белка, который помогает дольше чувствовать сытость'
            },
            {
              foodName: 'Брокколи',
              calories: 34,
              protein: 2.8,
              carbs: 6.6,
              fats: 0.4,
              category: 'vegetables',
              reason: 'Низкокалорийный овощ, богатый клетчаткой, которая способствует насыщению'
            }
          ];
          break;
          
        case 'muscle_gain':
          // Для набора мышечной массы рекомендуем продукты с высоким содержанием белка и калорий
          selectedFoods = [
            {
              foodName: 'Лосось',
              calories: 206,
              protein: 22,
              carbs: 0,
              fats: 13,
              category: 'protein',
              reason: 'Богат белком и полезными жирами, необходимыми для роста мышц'
            },
            {
              foodName: 'Яйца',
              calories: 155,
              protein: 13,
              carbs: 1.1,
              fats: 11,
              category: 'protein',
              reason: 'Содержат все незаменимые аминокислоты, необходимые для восстановления мышц'
            },
            {
              foodName: 'Овсянка',
              calories: 389,
              protein: 16.9,
              carbs: 66,
              fats: 6.9,
              category: 'carbs',
              reason: 'Обеспечивает долгий приток энергии и содержит белок растительного происхождения'
            }
          ];
          break;
          
        case 'endurance':
          // Для выносливости рекомендуем углеводы и продукты с высоким содержанием энергии
          selectedFoods = [
            {
              foodName: 'Бананы',
              calories: 89,
              protein: 1.1,
              carbs: 22.8,
              fats: 0.3,
              category: 'fruits',
              reason: 'Быстрый источник энергии и богаты калием, который помогает предотвратить судороги'
            },
            {
              foodName: 'Киноа',
              calories: 368,
              protein: 14,
              carbs: 64,
              fats: 6,
              category: 'carbs',
              reason: 'Содержит комплексные углеводы для длительного высвобождения энергии'
            },
            {
              foodName: 'Сладкий картофель',
              calories: 86,
              protein: 1.6,
              carbs: 20,
              fats: 0.1,
              category: 'carbs',
              reason: 'Отличный источник сложных углеводов и богат антиоксидантами'
            }
          ];
          break;
          
        case 'flexibility':
          // Для гибкости рекомендуем продукты с противовоспалительными свойствами
          selectedFoods = [
            {
              foodName: 'Авокадо',
              calories: 160,
              protein: 2,
              carbs: 8.5,
              fats: 14.7,
              category: 'fats',
              reason: 'Содержит полезные жиры и витамин E, которые помогают восстанавливать мышцы'
            },
            {
              foodName: 'Черника',
              calories: 57,
              protein: 0.7,
              carbs: 14,
              fats: 0.3,
              category: 'fruits',
              reason: 'Богата антиоксидантами, которые помогают уменьшить воспаление'
            },
            {
              foodName: 'Темный шоколад',
              calories: 598,
              protein: 7.8,
              carbs: 45.9,
              fats: 43,
              category: 'treats',
              reason: 'Содержит магний, который помогает расслабить мышцы'
            }
          ];
          break;
          
        default: // overall_health
          // Для общего здоровья рекомендуем сбалансированную диету
          selectedFoods = [
            {
              foodName: 'Шпинат',
              calories: 23,
              protein: 2.9,
              carbs: 3.6,
              fats: 0.4,
              category: 'vegetables',
              reason: 'Богат железом, витаминами и минералами, необходимыми для общего здоровья'
            },
            {
              foodName: 'Орехи миндаля',
              calories: 579,
              protein: 21,
              carbs: 21,
              fats: 49,
              category: 'fats',
              reason: 'Содержат полезные жиры, белок и витамин E для поддержания здоровья сердца'
            },
            {
              foodName: 'Чечевица',
              calories: 116,
              protein: 9,
              carbs: 20,
              fats: 0.4,
              category: 'legumes',
              reason: 'Отличный источник растительного белка и клетчатки'
            }
          ];
      }
      
      setRecommendations(selectedFoods);
    } catch (err) {
      console.error('Ошибка при генерации рекомендаций:', err);
      setError('Не удалось сгенерировать рекомендации');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для получения цвета категории продукта
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'protein': return 'bg-blue-50 text-blue-800';
      case 'carbs': return 'bg-yellow-50 text-yellow-800';
      case 'fats': return 'bg-red-50 text-red-800';
      case 'vegetables': return 'bg-green-50 text-green-800';
      case 'fruits': return 'bg-purple-50 text-purple-800';
      case 'dairy': return 'bg-indigo-50 text-indigo-800';
      case 'legumes': return 'bg-amber-50 text-amber-800';
      case 'treats': return 'bg-pink-50 text-pink-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  };
  
  const getGoalName = (goal?: string): string => {
    switch (goal) {
      case 'weight_loss': return 'снижение веса';
      case 'muscle_gain': return 'набор мышечной массы';
      case 'endurance': return 'выносливость';
      case 'flexibility': return 'гибкость';
      default: return 'общее здоровье';
    }
  };
  
  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex items-center">
          <Sparkles size={18} className="mr-2" />
          <h3 className="font-semibold">Рекомендации по питанию</h3>
        </div>
        <p className="text-xs text-white/80">
          Персонализированные рекомендации на основе вашей цели: {getGoalName(user?.goal)}
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-indigo-600"></div>
            <span className="ml-2 text-sm text-gray-500">Анализируем ваши данные...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <AlertTriangle size={24} className="text-red-500 mb-2" />
            <p className="text-sm text-gray-700 mb-2">{error}</p>
            <Button 
              size="sm"
              onClick={generateRecommendations}
            >
              Попробовать снова
            </Button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Рекомендации не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Вот несколько продуктов, которые мы рекомендуем для достижения вашей цели:
            </p>
            
            {recommendations.map((food, index) => (
              <div key={index} className="border border-gray-100 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{food.foodName}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(food.category)}`}>
                    {food.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{food.reason}</p>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-50 p-1 rounded text-center">
                    <p className="font-medium">{food.calories}</p>
                    <p className="text-gray-500">ккал</p>
                  </div>
                  <div className="bg-blue-50 p-1 rounded text-center">
                    <p className="font-medium">{food.protein}г</p>
                    <p className="text-gray-500">белки</p>
                  </div>
                  <div className="bg-yellow-50 p-1 rounded text-center">
                    <p className="font-medium">{food.carbs}г</p>
                    <p className="text-gray-500">углев.</p>
                  </div>
                  <div className="bg-red-50 p-1 rounded text-center">
                    <p className="font-medium">{food.fats}г</p>
                    <p className="text-gray-500">жиры</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-xs text-gray-500 text-center mt-4">
              Рекомендации основаны на искусственном интеллекте и вашем профиле. Для более точных рекомендаций обратитесь к диетологу.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};