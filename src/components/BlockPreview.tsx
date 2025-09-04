'use client';

import React from 'react';
import { BlockShape } from '@/types/game';
import BlockPiece from './BlockPiece';

interface BlockPreviewProps {
  pieces: BlockShape[];
  selectedPiece: BlockShape | null;
  onPieceSelect: (piece: BlockShape) => void;
  onDragStart: (piece: BlockShape) => void;
  onDragEnd: () => void;
  validPieces?: string[];
  draggedPiece?: BlockShape | null;
}

export default function BlockPreview({
  pieces,
  selectedPiece,
  onPieceSelect,
  onDragStart,
  onDragEnd,
  validPieces = [],
  draggedPiece = null
}: BlockPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Pièces disponibles
      </h3>
      
      <div className="flex flex-col gap-6">
         {pieces.map((piece) => {
          const isSelected = selectedPiece?.id === piece.id;
          const isValid = validPieces.length === 0 || validPieces.includes(piece.id);
          const isDragging = draggedPiece?.id === piece.id;
          
          return (
            <div
              key={piece.id}
              className={`
                flex justify-center items-center p-4 rounded-lg border-2 transition-all duration-200
                ${isValid ? 'border-gray-200 hover:border-blue-300' : 'border-red-200 bg-red-50'}
                ${isSelected ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'}
                ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ minHeight: '80px' }}
            >
               <BlockPiece
                piece={piece}
                scale={1.2}
                isDraggable={isValid}
                isSelected={isSelected}
                onClick={() => isValid && onPieceSelect(piece)}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={isDragging}
              />
            </div>
          );
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p className="mb-2">
          🖱️ Glissez-déposez ou cliquez pour sélectionner
        </p>
        <p className="text-xs">
          Les pièces en rouge ne peuvent pas être placées
        </p>
      </div>
      
      {/* Statistiques des pièces */}
      <div className="mt-4 flex justify-between text-xs text-gray-400">
        <span>Pièces restantes: {pieces.length}</span>
        <span>Valides: {validPieces.length}/{pieces.length}</span>
      </div>
    </div>
  );
}