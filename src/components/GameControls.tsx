'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameControlsProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  onPause?: () => void;
  isPaused?: boolean;
  stats?: {
    linesCleared: number;
    blocksPlaced: number;
    level: number;
  };
}

export default function GameControls({
  score,
  gameOver,
  onRestart,
  onPause,
  isPaused = false,
  stats = { linesCleared: 0, blocksPlaced: 0, level: 1 }
}: GameControlsProps) {
  const formatScore = (score: number): string => {
    return score.toLocaleString();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-2xl font-bold text-gray-800">
          Block Blast
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score principal */}
        <div className="text-center">
          <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">
            Score
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatScore(score)}
          </div>
          {gameOver && (
            <Badge variant="destructive" className="animate-pulse">
              Game Over
            </Badge>
          )}
          {isPaused && !gameOver && (
            <Badge variant="secondary">
              En pause
            </Badge>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs uppercase tracking-wide">
              Niveau
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {stats.level}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-gray-500 text-xs uppercase tracking-wide">
              Lignes
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {stats.linesCleared}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 text-center col-span-2">
            <div className="text-gray-500 text-xs uppercase tracking-wide">
              Blocs placés
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {stats.blocksPlaced}
            </div>
          </div>
        </div>

        {/* Boutons de contrôle */}
        <div className="space-y-2">
          <Button 
            onClick={onRestart} 
            variant={gameOver ? "default" : "outline"}
            className="w-full"
            size="lg"
          >
            {gameOver ? '🔄 Nouvelle partie' : '🔄 Recommencer'}
          </Button>
          
          {onPause && !gameOver && (
            <Button 
              onClick={onPause} 
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
            </Button>
          )}
        </div>

        {/* Conseils de jeu */}
        {!gameOver && (
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>💡 Formez des lignes complètes pour marquer des points</p>
            <p>🎯 Placez stratégiquement vos pièces</p>
          </div>
        )}
        
        {/* Message de game over */}
        {gameOver && (
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 font-semibold mb-2">
              🚫 Plus de place !
            </div>
            <div className="text-sm text-red-500">
              Votre score final : {formatScore(score)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}