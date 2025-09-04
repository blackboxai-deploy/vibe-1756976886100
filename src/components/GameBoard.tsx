'use client';

import React from 'react';
import { Cell, Position, BlockShape } from '@/types/game';

interface GameBoardProps {
  board: Cell[][];
  onCellClick?: (position: Position) => void;
  hoveredCells?: Position[];
  validPositions?: Position[];
  isDragOver?: boolean;
  onDrop?: (position: Position) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  draggedPiece?: BlockShape | null;
  dragPosition?: Position | null;
}

export default function GameBoard({
  board,
  onCellClick,
  hoveredCells = [],
  validPositions = [],
  isDragOver = false,
  onDrop,
  onDragOver,
  onDragLeave,
  draggedPiece = null,
  dragPosition = null
}: GameBoardProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cellSize = rect.width / 10;
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (x >= 0 && x < 10 && y >= 0 && y < 10) {
      onDrop?.({ x, y });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragOver?.(e);
  };

  const isCellHovered = (row: number, col: number): boolean => {
    return hoveredCells.some(pos => pos.x === col && pos.y === row);
  };

  const isCellValid = (row: number, col: number): boolean => {
    return validPositions.some(pos => pos.x === col && pos.y === row);
  };

   const isCellPreview = (row: number, col: number): boolean => {
    if (!draggedPiece || !dragPosition) return false;
    
    // Vérifier si cette cellule fait partie de la pièce prévisualisée
    for (let pieceRow = 0; pieceRow < draggedPiece.shape.length; pieceRow++) {
      for (let pieceCol = 0; pieceCol < draggedPiece.shape[pieceRow].length; pieceCol++) {
        if (draggedPiece.shape[pieceRow][pieceCol]) {
          const previewRow = dragPosition.y + pieceRow;
          const previewCol = dragPosition.x + pieceCol;
          if (previewRow === row && previewCol === col) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Vérifier si le placement de la pièce actuelle est valide
  const isValidPlacement = (): boolean => {
    if (!draggedPiece || !dragPosition) return true;
    
    for (let pieceRow = 0; pieceRow < draggedPiece.shape.length; pieceRow++) {
      for (let pieceCol = 0; pieceCol < draggedPiece.shape[pieceRow].length; pieceCol++) {
        if (draggedPiece.shape[pieceRow][pieceCol]) {
          const boardRow = dragPosition.y + pieceRow;
          const boardCol = dragPosition.x + pieceCol;
          
          // Vérifier les limites
          if (boardRow < 0 || boardRow >= 10 || boardCol < 0 || boardCol >= 10) {
            return false;
          }
          
          // Vérifier les collisions
          if (board[boardRow][boardCol].filled) {
            return false;
          }
        }
      }
    }
    return true;
  };

  return (
    <div className="relative">
      <div 
         className={`
          grid grid-cols-10 gap-1 p-4 bg-gray-100 rounded-xl shadow-lg
          transition-all duration-200
          ${isDragOver ? 'ring-2 ring-blue-400 ring-opacity-30' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        style={{
          width: '400px',
          height: '400px'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
             const isHovered = isCellHovered(rowIndex, colIndex);
            const isValid = isCellValid(rowIndex, colIndex);
            const isPreview = isCellPreview(rowIndex, colIndex);
            const validPlacement = isValidPlacement();
            
            // Calculer la couleur et l'opacité pour la prévisualisation
            let backgroundColor = cell.filled ? cell.color : '#FFFFFF';
            let borderColor = cell.filled ? cell.color : '#E5E7EB';
            let opacity = 1;
            
             if (isPreview && draggedPiece) {
              if (validPlacement) {
                // Placement valide - couleur normale avec transparence réduite
                backgroundColor = draggedPiece.color;
                borderColor = draggedPiece.color;
                opacity = 0.8; // Plus visible
              } else {
                // Placement invalide - rouge avec transparence réduite
                backgroundColor = '#EF4444';
                borderColor = '#DC2626';
                opacity = 0.7; // Plus visible
              }
            }
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                 className={`
                  aspect-square rounded-sm transition-all duration-150 cursor-pointer
                  border-2 border-opacity-50 relative
                  ${cell.filled ? 'shadow-inner' : 'shadow-sm hover:shadow-md'}
                  ${isHovered ? 'ring-1 ring-blue-400 ring-opacity-50 scale-105' : ''}
                  ${isValid && isDragOver ? 'ring-1 ring-green-400 ring-opacity-50' : ''}
                  ${!cell.filled && isValid && isDragOver ? 'bg-green-50' : ''}
                  ${isPreview && validPlacement ? 'ring-2 ring-green-500 ring-opacity-70' : ''}
                  ${isPreview && !validPlacement ? 'ring-2 ring-red-500 ring-opacity-70' : ''}
                `}
                style={{
                  backgroundColor,
                  borderColor,
                  opacity
                }}
                onClick={() => onCellClick?.({ x: colIndex, y: rowIndex })}
               >
                 {/* Effet de preview subtil */}
                {isPreview && (
                  <div 
                    className={`
                      absolute inset-0 rounded-sm
                      ${validPlacement ? 'bg-white bg-opacity-10' : 'bg-red-200 bg-opacity-20'}
                    `} 
                  />
                )}
                
                {/* Icône de validation/invalidation */}
                {isPreview && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold drop-shadow-lg">
                      {validPlacement ? '✓' : '✗'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
       {/* Pas d'overlay pour ne pas masquer la grille */}
    </div>
  );
}