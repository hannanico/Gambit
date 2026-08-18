export type Puzzle = {
  id: string;
  fen: string;
  moves: string;
  rating: number;
};

export type PuzzlePack = {
  id: string;
  file: string;
  puzzleCount: number;
  minRating: number;
  maxRating: number;
  sizeBytes: number;
  sha256: string;
};

export type PuzzleManifest = {
  packs: PuzzlePack[];
};