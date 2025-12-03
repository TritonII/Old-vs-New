import React from 'react';
import { Barron } from '../types';

interface SketchItemProps {
  item: Barron;
  side: 'left' | 'right';
  isConnected: boolean;
  onPointMouseDown?: (e: React.MouseEvent) => void;
  onPointMouseUp?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  pointRef?: React.Ref<HTMLDivElement>;
}

export const SketchItem: React.FC<SketchItemProps> = ({ 
  item, 
  side, 
  isConnected, 
  onPointMouseDown, 
  onPointMouseUp,
  onTouchStart,
  pointRef 
}) => {
  const isLeft = side === 'left';

  return (
    <div className={`relative flex items-center mb-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Text Box */}
      <div className={`
        flex-1 p-4 bg-white sketch-border sketch-box relative
        ${isConnected ? 'bg-blue-50 border-blue-800' : 'border-gray-800'}
      `}>
        <h3 className="text-xl font-bold leading-none mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 italic">{item.industry}</p>
      </div>

      {/* Connection Point (The Dot) */}
      <div 
        className={`
          relative z-20 w-8 h-full flex items-center justify-center
          ${isLeft ? 'mr-[-4px]' : 'ml-[-4px]'}
        `}
      >
        <div 
          ref={pointRef}
          onMouseDown={onPointMouseDown}
          onMouseUp={onPointMouseUp}
          onTouchStart={onTouchStart}
          className={`
            w-4 h-4 rounded-full border-2 cursor-crosshair transition-all duration-200
            ${isConnected ? 'bg-blue-600 border-blue-800 scale-110' : 'bg-white border-gray-800 hover:scale-125 hover:bg-gray-200'}
          `}
        />
      </div>
    </div>
  );
};