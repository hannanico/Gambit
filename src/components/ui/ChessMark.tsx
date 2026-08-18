import Image from "next/image";

type ChessMarkProps = {
  src?: string;
  fallback: string;
  className?: string;
  alt?: string;
};

export function ChessMark({
  src,
  fallback,
  className = "",
  alt = "",
}: ChessMarkProps) {
  if (!src) {
    return (
      <span aria-hidden="true" className={`select-none font-serif ${className}`}>
        {fallback}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={`object-contain ${className}`}
      height={180}
      src={src}
      width={180}
    />
  );
}