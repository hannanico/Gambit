"use client";

import { Chess, type Square } from "chess.js";
import { useMemo, useState } from "react";

type ChessBoardProps = {
  fen: string;
  orientation?: "white" | "black";
  selectedSquare?: string | null;
  lastMove?: { from: string; to: string } | null;
  legalMoves?: string[];
  disabled?: boolean;
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
  lastMove = null,
  legalMoves = [],
  disabled = false,
  onSquareClick,
}: ChessBoardProps) {
  const chess = useMemo(() => new Chess(fen), [fen]);
  const [imageFailures, setImageFailures] = useState<Record<string, boolean>>(
    {},
  );

  const displayRanks = orientation === "white" ? ranks : [...ranks].reverse();
  const displayFiles = orientation === "white" ? files : [...files].reverse();
  const legalDestinations = new Set(legalMoves);

  return (
    <div
      className="
  relative aspect-square w-[min(96vw,560px)]
  max-w-full overflow-hidden rounded-lg border-4 border-slate-950
  bg-slate-950 shadow-2xl ring-1 ring-white/30
  sm:w-[min(92vw,620px)]
  lg:w-full lg:max-w-[min(100%,calc(100dvh-3rem))]
"
    >
      <div className="grid h-full grid-cols-8">
        {displayRanks.flatMap((rank, rowIndex) =>
          displayFiles.map((file, columnIndex) => {
            const square = `${file}${rank}`;
            const piece = chess.get(square as Square);
            const pieceKey = piece ? `${piece.color}${piece.type}` : "";
            const imagePath = piece ? `/assets/pieces/${pieceKey}.png` : "";
            const fallback = piece ? fallbackPieces[pieceKey] : "";

            const isSelected = selectedSquare === square;
            const isLastMove =
              lastMove?.from === square || lastMove?.to === square;
            const isLegalDestination = legalDestinations.has(square);
            const isCapture = isLegalDestination && Boolean(piece);

            const isLightSquare = (rowIndex + columnIndex) % 2 === 0;

            const coordinateColor = isLightSquare
              ? "text-sky-700"
              : "text-sky-100";

            return (
              <button
                aria-label={
                  piece
                    ? `${piece.color === "w" ? "White" : "Black"} ${
                        piece.type
                      } on ${square}`
                    : square
                }
                className={[
                  "relative flex aspect-square items-center justify-center",
                  "touch-manipulation bg-cover bg-center",
                  disabled ? "cursor-default" : "cursor-pointer",
                  isLightSquare ? "bg-sky-50/70" : "bg-sky-900/45",
                  isSelected ? "bg-amber-300/65" : "",
                  !isSelected && isLastMove ? "bg-yellow-300/55" : "",
                ].join(" ")}
                disabled={disabled}
                key={square}
                onClick={() => onSquareClick?.(square)}
                style={{
                  backgroundImage: "url('/assets/board/icy_sea.png')",
                  backgroundSize: "800% 800%",
                  backgroundPosition: `${(columnIndex / 7) * 100}% ${
                    (rowIndex / 7) * 100
                  }%`,
                }}
                type="button"
              >
                <span
                  className={`pointer-events-none absolute inset-0 ${
                    isLightSquare ? "bg-white/28" : "bg-sky-950/38"
                  }`}
                />

                {isLastMove && !isSelected ? (
                  <span className="pointer-events-none absolute inset-0 z-[5] ring-inset ring-2 ring-red-600/100" />
                ) : null}

                {isSelected ? (
                  <span className="pointer-events-none absolute inset-0 z-[6] bg-blue-300/50" />
                ) : null}

                {isLegalDestination && !isCapture ? (
                  <span className="pointer-events-none absolute z-10 h-[24%] w-[24%] rounded-full bg-slate-950/45" />
                ) : null}

                {isCapture ? (
                  <span className="pointer-events-none absolute z-10 inset-[7%] rounded-full border-[clamp(2px,0.5vw,5px)] border-slate-950/55" />
                ) : null}

                {piece && !imageFailures[pieceKey] ? (
                  <img
                    alt=""
                    className="relative z-20 h-[88%] w-[88%] object-contain drop-shadow-sm"
                    draggable={false}
                    onError={() =>
                      setImageFailures((current) => ({
                        ...current,
                        [pieceKey]: true,
                      }))
                    }
                    src={imagePath}
                  />
                ) : piece ? (
                  <span className="relative z-20 select-none text-[clamp(2rem,8vw,5rem)] leading-none text-slate-950">
                    {fallback}
                  </span>
                ) : null}

                {columnIndex === 0 ? (
                  <span
                    className={`pointer-events-none absolute left-1 top-0.5 z-30 text-[clamp(0.55rem,1.4vw,0.85rem)] font-black ${coordinateColor}`}
                  >
                    {rank}
                  </span>
                ) : null}

                {rowIndex === 7 ? (
                  <span
                    className={`pointer-events-none absolute bottom-0.5 right-1 z-30 text-[clamp(0.55rem,1.4vw,0.85rem)] font-black ${coordinateColor}`}
                  >
                    {file}
                  </span>
                ) : null}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}