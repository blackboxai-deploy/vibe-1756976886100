import { Cell, Position, BlockShape, BLOCK_SHAPES, BOARD_SIZE, PIECE_COUNT } from '@/types/game';

// Créer une grille vide
export function createEmptyBoard(): Cell[][] {
  return Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null).map(() => ({
      filled: false,
      color: '#F3F4F6'
    }))
  );
}

// Générer une nouvelle pièce aléatoire
export function generateRandomPiece(): BlockShape {
  const randomShape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
  return {
    ...randomShape,
    id: Math.random().toString(36).substr(2, 9)
  };
}

// Générer un set de 3 pièces
export function generatePieceSet(): BlockShape[] {
  return Array(PIECE_COUNT).fill(null).map(() => generateRandomPiece());
}

// Vérifier si une pièce peut être placée à une position donnée
export function canPlacePiece(board: Cell[][], piece: BlockShape, position: Position): boolean {
  const { shape } = piece;
  const { x, y } = position;

  // Vérifier les limites et collisions
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;

        // Vérifier les limites du plateau
        if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE) {
          return false;
        }

        // Vérifier si la cellule est déjà occupée
        if (board[newY][newX].filled) {
          return false;
        }
      }
    }
  }

  return true;
}

// Placer une pièce sur le plateau
export function placePiece(board: Cell[][], piece: BlockShape, position: Position): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const { shape, color } = piece;
  const { x, y } = position;

  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        newBoard[newY][newX] = {
          filled: true,
          color: color
        };
      }
    }
  }

  return newBoard;
}

// Vérifier les lignes et colonnes complètes
export function findCompleteLinesAndColumns(board: Cell[][]): {
  completeRows: number[];
  completeCols: number[];
} {
  const completeRows: number[] = [];
  const completeCols: number[] = [];

  // Vérifier les lignes complètes
  for (let row = 0; row < BOARD_SIZE; row++) {
    if (board[row].every(cell => cell.filled)) {
      completeRows.push(row);
    }
  }

  // Vérifier les colonnes complètes
  for (let col = 0; col < BOARD_SIZE; col++) {
    if (board.every(row => row[col].filled)) {
      completeCols.push(col);
    }
  }

  return { completeRows, completeCols };
}

// Supprimer les lignes et colonnes complètes
export function clearCompleteLinesAndColumns(
  board: Cell[][],
  completeRows: number[],
  completeCols: number[]
): { newBoard: Cell[][]; clearedCells: number } {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let clearedCells = 0;

  // Supprimer les cellules des lignes complètes
  completeRows.forEach(row => {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (newBoard[row][col].filled) {
        clearedCells++;
        newBoard[row][col] = {
          filled: false,
          color: '#F3F4F6'
        };
      }
    }
  });

  // Supprimer les cellules des colonnes complètes
  completeCols.forEach(col => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (newBoard[row][col].filled) {
        // Éviter de compter deux fois les intersections
        if (!completeRows.includes(row)) {
          clearedCells++;
        }
        newBoard[row][col] = {
          filled: false,
          color: '#F3F4F6'
        };
      }
    }
  });

  return { newBoard, clearedCells };
}

// Calculer le score
export function calculateScore(
  clearedCells: number,
  pieceSize: number,
  completeLines: number,
  currentScore: number
): number {
  const basePlacementScore = pieceSize * 10;
  const lineBonus = completeLines * 100;
  const cellBonus = clearedCells * 10;
  
  // Bonus combo pour plusieurs lignes
  const comboBonus = completeLines > 1 ? completeLines * 50 : 0;

  return currentScore + basePlacementScore + lineBonus + cellBonus + comboBonus;
}

// Vérifier si le jeu est terminé (aucune pièce ne peut être placée)
export function isGameOver(board: Cell[][], pieces: BlockShape[]): boolean {
  return pieces.every(piece => {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (canPlacePiece(board, piece, { x, y })) {
          return false;
        }
      }
    }
    return true;
  });
}

// Trouver toutes les positions valides pour une pièce
export function findValidPositions(board: Cell[][], piece: BlockShape): Position[] {
  const validPositions: Position[] = [];
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (canPlacePiece(board, piece, { x, y })) {
        validPositions.push({ x, y });
      }
    }
  }
  
  return validPositions;
}

// Obtenir la position de la grille à partir des coordonnées de la souris
export function getGridPosition(
  mouseX: number,
  mouseY: number,
  boardRect: DOMRect,
  cellSize: number
): Position {
  const x = Math.floor((mouseX - boardRect.left) / cellSize);
  const y = Math.floor((mouseY - boardRect.top) / cellSize);
  
  return { x, y };
}