'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GameState, BlockShape, Position } from '@/types/game';
import {
  createEmptyBoard,
  generatePieceSet,
  canPlacePiece,
  placePiece,
  findCompleteLinesAndColumns,
  clearCompleteLinesAndColumns,
  calculateScore,
  isGameOver,
  findValidPositions
} from '@/lib/gameLogic';
import GameBoard from '@/components/GameBoard';
import BlockPreview from '@/components/BlockPreview';
import GameControls from '@/components/GameControls';

export default function BlockBlastGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    score: 0,
    gameOver: false,
    currentPieces: generatePieceSet(),
    selectedPiece: null,
    draggedPiece: null
  });

  const [gameStats, setGameStats] = useState({
    linesCleared: 0,
    blocksPlaced: 0,
    level: 1
  });

  const [hoveredCells, setHoveredCells] = useState<Position[]>([]);
  const [validPositions, setValidPositions] = useState<Position[]>([]);
   const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<Position | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

   // Vérifier le game over à chaque changement de pièces
  useEffect(() => {
    if (gameState.currentPieces.length > 0) {
      const gameOverStatus = isGameOver(gameState.board, gameState.currentPieces);
      if (gameOverStatus && !gameState.gameOver) {
        setGameState(prev => ({ ...prev, gameOver: true }));
      }
    }
  }, [gameState.board, gameState.currentPieces, gameState.gameOver]);

  // Écouter les mouvements de souris globaux pendant le drag
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const handlePiecePlace = useCallback((piece: BlockShape, position: Position) => {
    if (!canPlacePiece(gameState.board, piece, position)) {
      return false;
    }

     // Placer la pièce
    const newBoard = placePiece(gameState.board, piece, position);
    
    // Vérifier et supprimer les lignes complètes
    const { completeRows, completeCols } = findCompleteLinesAndColumns(newBoard);
    const { newBoard: clearedBoard, clearedCells } = clearCompleteLinesAndColumns(
      newBoard,
      completeRows,
      completeCols
    );

    // Calculer le nouveau score
    const totalCompleteLines = completeRows.length + completeCols.length;
    const newScore = calculateScore(
      clearedCells,
      piece.shape.flat().filter(cell => cell).length,
      totalCompleteLines,
      gameState.score
    );

    // Supprimer la pièce utilisée
    const remainingPieces = gameState.currentPieces.filter(p => p.id !== piece.id);
    
    // Générer de nouvelles pièces si nécessaire
    const newPieces = remainingPieces.length === 0 ? generatePieceSet() : remainingPieces;

    setGameState(prev => ({
      ...prev,
      board: clearedBoard,
      score: newScore,
      currentPieces: newPieces,
      selectedPiece: null,
      draggedPiece: null
    }));

    setGameStats(prev => ({
      ...prev,
      linesCleared: prev.linesCleared + totalCompleteLines,
      blocksPlaced: prev.blocksPlaced + 1,
      level: Math.floor(newScore / 1000) + 1
    }));

    // Reset hover states
    setHoveredCells([]);
    setValidPositions([]);
    setIsDragOver(false);
    setDragPosition(null);

    return true;
  }, [gameState.board, gameState.score, gameState.currentPieces]);

  const handlePieceSelect = useCallback((piece: BlockShape) => {
    if (gameState.gameOver) return;
    
    setGameState(prev => ({
      ...prev,
      selectedPiece: prev.selectedPiece?.id === piece.id ? null : piece
    }));

    // Afficher les positions valides
    const positions = findValidPositions(gameState.board, piece);
    setValidPositions(positions);
  }, [gameState.board, gameState.gameOver]);

  const handleCellClick = useCallback((position: Position) => {
    if (gameState.selectedPiece && !gameState.gameOver) {
      handlePiecePlace(gameState.selectedPiece, position);
    }
  }, [gameState.selectedPiece, gameState.gameOver, handlePiecePlace]);

   const handleDragStart = useCallback((piece: BlockShape) => {
    if (gameState.gameOver) return;
    
    setGameState(prev => ({ ...prev, draggedPiece: piece }));
    setValidPositions(findValidPositions(gameState.board, piece));
    setIsDragging(true);
  }, [gameState.board, gameState.gameOver]);

   const handleDragEnd = useCallback(() => {
    setGameState(prev => ({ ...prev, draggedPiece: null }));
    setValidPositions([]);
    setHoveredCells([]);
    setIsDragOver(false);
    setDragPosition(null);
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((position: Position) => {
    if (gameState.draggedPiece) {
      handlePiecePlace(gameState.draggedPiece, position);
    }
  }, [gameState.draggedPiece, handlePiecePlace]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (gameState.draggedPiece) {
      const rect = e.currentTarget.getBoundingClientRect();
      const cellSize = rect.width / 10;
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);
      
      if (x >= 0 && x < 10 && y >= 0 && y < 10) {
        // Calculer les cellules qui seraient occupées
        const piece = gameState.draggedPiece;
        const hoveredPositions: Position[] = [];
        
        for (let row = 0; row < piece.shape.length; row++) {
          for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
              const newX = x + col;
              const newY = y + row;
              if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
                hoveredPositions.push({ x: newX, y: newY });
              }
            }
          }
        }
        
        setHoveredCells(hoveredPositions);
        setDragPosition({ x, y });
        setIsDragOver(true);
      }
    }
  }, [gameState.draggedPiece]);

  const handleRestart = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      score: 0,
      gameOver: false,
      currentPieces: generatePieceSet(),
      selectedPiece: null,
      draggedPiece: null
    });
    
    setGameStats({
      linesCleared: 0,
      blocksPlaced: 0,
      level: 1
    });

     setHoveredCells([]);
    setValidPositions([]);
    setIsDragOver(false);
    setDragPosition(null);
    setIsDragging(false);
  }, []);

   // Obtenir les IDs des pièces valides
  const validPieceIds = gameState.currentPieces
    .filter(piece => findValidPositions(gameState.board, piece).length > 0)
    .map(piece => piece.id);

  // Gestionnaire de mouvement de la souris pour le drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging]);

  return (
     <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      onMouseMove={handleMouseMove}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Block Blast
          </h1>
          <p className="text-gray-600">
            Placez les blocs pour former des lignes et colonnes complètes !
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Panneau de contrôle */}
          <div className="lg:order-1">
            <GameControls
              score={gameState.score}
              gameOver={gameState.gameOver}
              onRestart={handleRestart}
              stats={gameStats}
            />
          </div>

          {/* Plateau de jeu */}
          <div className="lg:order-2 flex justify-center">
             <GameBoard
              board={gameState.board}
              onCellClick={handleCellClick}
              hoveredCells={hoveredCells}
              validPositions={validPositions}
              isDragOver={isDragOver}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => {
                setIsDragOver(false);
                setDragPosition(null);
              }}
              draggedPiece={gameState.draggedPiece}
              dragPosition={dragPosition}
            />
          </div>

          {/* Pièces disponibles */}
          <div className="lg:order-3">
             <BlockPreview
              pieces={gameState.currentPieces}
              selectedPiece={gameState.selectedPiece}
              onPieceSelect={handlePieceSelect}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              validPieces={validPieceIds}
              draggedPiece={gameState.draggedPiece}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Comment jouer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🎯 Objectif</h4>
                <p>
                  Placez les pièces sur la grille pour former des lignes ou des colonnes complètes. 
                  Quand une ligne ou colonne est complète, elle disparaît et vous gagnez des points !
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🎮 Contrôles</h4>
                <ul className="space-y-1">
                  <li>• Glissez-déposez les pièces sur la grille</li>
                  <li>• Ou cliquez sur une pièce puis sur la grille</li>
                  <li>• Les zones vertes montrent les placements valides</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">📊 Scoring</h4>
                <ul className="space-y-1">
                  <li>• Placement de pièce : 10 pts/bloc</li>
                  <li>• Ligne complète : 100 pts + 10 pts/bloc effacé</li>
                  <li>• Bonus combo : +50 pts par ligne supplémentaire</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🚫 Game Over</h4>
                <p>
                   Le jeu se termine quand aucune des pièces disponibles ne peut être placée sur la grille. 
                  Planifiez vos mouvements pour éviter de bloquer l&apos;espace !
                </p>
              </div>
            </div>
           </div>
        </div>
      </div>

      {/* Élément de drag flottant */}
      {isDragging && gameState.draggedPiece && (
        <div
          className="fixed pointer-events-none z-50 opacity-80"
          style={{
            left: mousePosition.x - 40,
            top: mousePosition.y - 40,
            transform: 'rotate(5deg)'
          }}
        >
          <div className="relative">
            {gameState.draggedPiece.shape.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                if (!cell) return null;
                
                const cellSize = 20;
                const gap = 2;
                const x = colIndex * (cellSize + gap);
                const y = rowIndex * (cellSize + gap);
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="absolute rounded-sm shadow-lg border-2 border-opacity-40"
                     style={{
                      left: x,
                      top: y,
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: gameState.draggedPiece?.color || '#000',
                      borderColor: gameState.draggedPiece?.color || '#000',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                    }}
                  />
                );
              })
            )}
            
            {/* Effet de brillance sur la pièce flottante */}
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-30 rounded-sm pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}