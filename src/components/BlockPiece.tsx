'use client';

import React from 'react';
import { BlockShape } from '@/types/game';

interface BlockPieceProps {
  piece: BlockShape;
  scale?: number;
  isDraggable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onDragStart?: (piece: BlockShape) => void;
  onDragEnd?: () => void;
  className?: string;
  isDragging?: boolean;
}

export default function BlockPiece({
  piece,
  scale = 1,
  isDraggable = true,
  isSelected = false,
  onClick,
  onDragStart,
  onDragEnd,
  className = '',
  isDragging = false
}: BlockPieceProps) {
  const cellSize = 20 * scale;
  const gap = 2 * scale;

   const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.dataTransfer.setData('piece', JSON.stringify(piece));
      
      // Créer une image de drag personnalisée
      const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
      dragElement.style.transform = 'rotate(5deg)';
      dragElement.style.opacity = '0.8';
      dragElement.style.position = 'absolute';
      dragElement.style.top = '-9999px';
      document.body.appendChild(dragElement);
      
      e.dataTransfer.setDragImage(dragElement, totalWidth / 2, totalHeight / 2);
      
      // Nettoyer l'élément après un court délai
      setTimeout(() => {
        document.body.removeChild(dragElement);
      }, 0);
      
      onDragStart?.(piece);
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const totalWidth = piece.shape[0].length * cellSize + (piece.shape[0].length - 1) * gap;
  const totalHeight = piece.shape.length * cellSize + (piece.shape.length - 1) * gap;

   return (
    <div
      className={`
        relative inline-block transition-all duration-200 select-none
        ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isSelected ? 'scale-110 ring-4 ring-blue-400 ring-opacity-50 rounded-lg' : ''}
        ${isDragging ? 'opacity-30 scale-95' : 'hover:scale-105'}
        ${className}
      `}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      style={{
        width: totalWidth,
        height: totalHeight
      }}
    >
      {piece.shape.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!cell) return null;
          
          const x = colIndex * (cellSize + gap);
          const y = rowIndex * (cellSize + gap);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="absolute rounded-sm shadow-md border-2 border-opacity-30"
              style={{
                left: x,
                top: y,
                width: cellSize,
                height: cellSize,
                backgroundColor: piece.color,
                borderColor: piece.color
              }}
            />
          );
        })
      )}
      
      {/* Effet de brillance */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-br from-white to-transparent 
          opacity-20 rounded-sm pointer-events-none
          ${isSelected ? 'opacity-40' : ''}
        `}
      />
    </div>
  );
}