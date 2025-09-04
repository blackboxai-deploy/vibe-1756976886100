// Types pour le jeu Block Blast
export interface Cell {
  filled: boolean;
  color: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface BlockShape {
  id: string;
  shape: boolean[][];
  color: string;
  size: number;
}

export interface GameState {
  board: Cell[][];
  score: number;
  gameOver: boolean;
  currentPieces: BlockShape[];
  selectedPiece: BlockShape | null;
  draggedPiece: BlockShape | null;
}

export interface GameStats {
  linesCleared: number;
  blocksPlaced: number;
  level: number;
}

// Formes de blocs prédéfinies
export const BLOCK_SHAPES: Omit<BlockShape, 'id'>[] = [
  // Carré 2x2
  {
    shape: [
      [true, true],
      [true, true]
    ],
    color: '#3B82F6',
    size: 2
  },
  // Ligne horizontale 3
  {
    shape: [[true, true, true]],
    color: '#EF4444',
    size: 3
  },
  // Ligne verticale 3
  {
    shape: [
      [true],
      [true],
      [true]
    ],
    color: '#10B981',
    size: 3
  },
  // L shape
  {
    shape: [
      [true, false],
      [true, false],
      [true, true]
    ],
    color: '#F59E0B',
    size: 3
  },
  // L inversé
  {
    shape: [
      [false, true],
      [false, true],
      [true, true]
    ],
    color: '#8B5CF6',
    size: 3
  },
  // T shape
  {
    shape: [
      [true, true, true],
      [false, true, false]
    ],
    color: '#EC4899',
    size: 3
  },
  // Bloc simple
  {
    shape: [[true]],
    color: '#6B7280',
    size: 1
  },
  // Ligne horizontale 4
  {
    shape: [[true, true, true, true]],
    color: '#DC2626',
    size: 4
  },
  // Carré 3x3
  {
    shape: [
      [true, true, true],
      [true, true, true],
      [true, true, true]
    ],
    color: '#059669',
    size: 3
  },
  // Forme en Z
  {
    shape: [
      [true, true, false],
      [false, true, true]
    ],
    color: '#D97706',
    size: 3
  }
];

export const BOARD_SIZE = 10;
export const PIECE_COUNT = 3;