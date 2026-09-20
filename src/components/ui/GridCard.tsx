import Image from "next/image";
import Link from "next/link";

interface GridCardProps {
  href: string;
  thumbnail: string;
  title: string;
  description?: string;
  badge?: string;
  visited?: boolean;
}

export function GridCard({
  href,
  thumbnail,
  title,
  description,
  badge,
  visited,
}: GridCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col bg-zinc-900 overflow-hidden hover:ring-1 hover:ring-white/20 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <div className="relative aspect-[3/4] w-full bg-zinc-800 overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {badge && (
          <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-white/10 text-white/70 px-2 py-0.5 backdrop-blur-sm">
            {badge}
          </span>
        )}
        {visited && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/40" />
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-sm font-light tracking-wide text-white/90 group-hover:text-white transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
