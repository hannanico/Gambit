"use client";

import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";

type ChessBoardProps = {
  fen: string;
  orientation?: "white" | "black";
  selectedSquare?: string | null;
  onSquareClick?: (square: string) => void;
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

const fallbackPieces: Record<string, string> = {
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
};

export function ChessBoard({
  fen,
  orientation = "white",
  selectedSquare,
  onSquareClick,
}: ChessBoardProps) {
  const chess = useMemo(() => new Chess(fen), [fen]);
  const [imageFailures, setImageFailures] = useState<Record<string, boolean>>(
    {},
  );

  const displayRanks = orientation === "white" ? ranks : [...ranks].reverse();
  const displayFiles = orientation === "white" ? files : [...files].reverse();

  return (
    <div className="mx-auto aspect-square w-full max-w-160 overflow-hidden rounded-sm border-4 border-slate-950 bg-sky-100 shadow-2xl">
      <div className="grid h-full grid-cols-8">
        {displayRanks.flatMap((rank) =>
          displayFiles.map((file) => {
            const square = `${file}${rank}`;
            const rowFromTop = ranks.indexOf(rank);
            const columnFromLeft = files.indexOf(file);
            const isLight = (rowFromTop + columnFromLeft) % 2 === 0;

            const piece = chess.get(square as Square);
            const pieceKey = piece ? `${piece.color}${piece.type}` : "";
            const imagePath = piece ? `/assets/pieces/${pieceKey}.png` : "";
            const fallback = piece ? fallbackPieces[pieceKey] : "";

            return (
              <button
                aria-label={
                  piece
                    ? `${piece.color === "w" ? "White" : "Black"} ${
                        piece.type
                      } on ${square}`
                    : square
                }
                className={`relative flex aspect-square items-center justify-center transition-colors ${
                  isLight ? "bg-sky-100" : "bg-sky-500"
                } ${
                  selectedSquare === square
                    ? "ring-inset ring-4 ring-amber-400"
                    : ""
                }`}
                key={square}
                onClick={() => onSquareClick?.(square)}
                type="button"
              >
                {piece && !imageFailures[pieceKey] ? (
                  <img
                    alt=""
                    className="h-[88%] w-[88%] object-contain"
                    draggable={false}
                    onError={() =>
                      setImageFailures((current) => ({
                        ...current,
                        [pieceKey]: true,
                      }))
                    }
                    src={imagePath}
                  />
                ) : (
                  <span className="select-none text-[clamp(2rem,8vw,5rem)] leading-none text-slate-950">
                    {fallback}
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}