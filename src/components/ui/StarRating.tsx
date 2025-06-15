import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  size?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  size = 24,
  onChange,
  readOnly = false,
  className = '',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (selectedRating: number) => {
    if (readOnly) return;
    
    setRating(selectedRating);
    if (onChange) {
      onChange(selectedRating);
    }
  };

  const handleMouseEnter = (hoveredRating: number) => {
    if (readOnly) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readOnly}
          className={`
            ${readOnly ? 'cursor-default' : 'cursor-pointer'}
            transition-colors p-0.5 -m-0.5 rounded-md focus:outline-none
          `}
          style={{ lineHeight: 0 }}
        >
          <Star
            size={size}
            className={`
              transition-transform ${hoverRating >= star || rating >= star ? 'scale-110' : ''}
              ${hoverRating >= star 
                ? 'text-yellow-400 fill-yellow-400' 
                : rating >= star 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }
            `}
          />
        </button>
      ))}
    </div>
  );
};