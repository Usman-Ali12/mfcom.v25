"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Suggestion = { slug: string; name: string; brand: string; price: number; image: string };

export default function SearchBox({
  variant = "desktop",
  placeholder = "Search products, brands, SKUs…",
}: {
  variant?: "desktop" | "mobile";
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className={`relative ${variant === "desktop" ? "flex-1 max-w-md" : "w-full"}`}>
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <div
          className={`flex items-center w-full bg-white/[0.06] px-4 focus-within:ring-1 focus-within:ring-red ${
            variant === "desktop" ? "h-11 chamfer-sm" : "h-10 chamfer-sm"
          }`}
        >
          {loading ? (
            <Loader2 size={15} className="text-paper/50 shrink-0 animate-spin" />
          ) : (
            <SearchIcon size={variant === "desktop" ? 16 : 15} className="text-paper/50 shrink-0" />
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="bg-transparent w-full ml-3 text-sm placeholder:text-paper/40 outline-none"
          />
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer-sm shadow-2xl z-50 overflow-hidden">
          {results.length === 0 && !loading ? (
            <p className="text-sm text-steel px-4 py-4 text-center">No matches for "{query}"</p>
          ) : (
            <>
              {results.map((r) => (
                <Link
                  key={r.slug}
                  href={`/product/${r.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-paper dark:hover:bg-white/5 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.image} alt="" className="w-10 h-10 object-cover chamfer-sm bg-paper shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate dark:text-paper">{r.name}</p>
                    <p className="text-xs text-steel">{r.brand}</p>
                  </div>
                  <span className="font-mono text-xs font-medium shrink-0 dark:text-paper">
                    {formatPrice(r.price)}
                  </span>
                </Link>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full text-center text-sm text-red font-medium py-2.5 border-t border-line dark:border-white/10 hover:bg-paper dark:hover:bg-white/5 transition-colors"
              >
                See all results for "{query}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
