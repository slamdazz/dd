/**
 * Генерирует текстовую CAPTCHA для защиты от ботов
 */
export function generateCaptcha(length = 6): { text: string; dataURL: string } {
  // Создаем случайный текст
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Создаем canvas для генерации изображения
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }
  
  // Фон
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Шум (точки)
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      1,
      1
    );
  }
  
  // Линии для шума
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
  
  // Текст
  const textColors = ['#4f46e5', '#0891b2', '#9333ea', '#4338ca', '#0369a1'];
  const fonts = ['bold 24px Arial', 'bold 24px Verdana', 'bold 24px Tahoma'];
  
  let x = 20;
  const letterSpacing = 140 / length; // равномерно распределяем буквы
  
  // Рисуем каждый символ отдельно с разным стилем
  for (let i = 0; i < result.length; i++) {
    const character = result.charAt(i);
    const colorIndex = Math.floor(Math.random() * textColors.length);
    const fontIndex = Math.floor(Math.random() * fonts.length);
    
    ctx.fillStyle = textColors[colorIndex];
    ctx.font = fonts[fontIndex];
    
    // Случайный угол наклона
    const angle = (Math.random() - 0.5) * 0.4;
    ctx.save();
    ctx.translate(x, 30);
    ctx.rotate(angle);
    ctx.fillText(character, 0, 0);
    ctx.restore();
    
    x += letterSpacing;
  }
  
  // Дополнительные линии поверх текста для усложнения распознавания
  for (let i = 0; i < 2; i++) {
    ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * canvas.height);
    ctx.lineTo(canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }
  
  return {
    text: result,
    dataURL: canvas.toDataURL('image/png')
  };
}