import { categoryEmoji, type Category } from "@/lib/catalog";

export function ListingPhoto({
  src,
  alt,
  category,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  category: string;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`object-cover ${className}`} />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-soft text-4xl ${className}`}
      aria-hidden
    >
      {categoryEmoji[category as Category] ?? "🧺"}
    </div>
  );
}
