import Link from "next/link";

interface NavProps {
  active?: "home" | "collections";
}

export function Nav({ active }: NavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link
        href="/"
        className="text-xs uppercase tracking-[0.3em] text-white hover:text-white/70 transition-colors font-light"
      >
        HINOIA
      </Link>
      <div className="flex gap-8">
        <Link
          href="/"
          className={`text-xs uppercase tracking-widest transition-colors font-light ${
            active === "home"
              ? "text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          Studio
        </Link>
        <Link
          href="/collections"
          className={`text-xs uppercase tracking-widest transition-colors font-light ${
            active === "collections"
              ? "text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          Collections
        </Link>
      </div>
    </nav>
  );
}
