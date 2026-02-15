import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ── */

export interface AutocompleteItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string; // URL for company logos etc.
}

interface AutocompleteDropdownProps {
  items: AutocompleteItem[];
  isOpen: boolean;
  activeIndex: number;
  onSelect: (item: AutocompleteItem) => void;
  listboxId: string;
  loading?: boolean;
}

/* ── Dropdown Component ── */

export function AutocompleteDropdown({
  items,
  isOpen,
  activeIndex,
  onSelect,
  listboxId,
  loading,
}: AutocompleteDropdownProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const active = listRef.current.children[activeIndex] as HTMLElement;
      if (active) {
        active.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {isOpen && (items.length > 0 || loading) && (
        <motion.div
          className="absolute left-0 right-0 z-50 mt-1"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="overflow-auto rounded-lg border border-border bg-bg-surface-2 shadow-lg backdrop-blur-sm max-h-[220px]"
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.08)',
            }}
          >
            {loading && items.length === 0 ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-text-tertiary">
                <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </li>
            ) : (
              items.map((item, i) => (
                <li
                  key={item.id}
                  id={`${listboxId}-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100 ${
                    i === activeIndex
                      ? 'bg-accent-primary/10 text-text-primary'
                      : 'text-text-secondary hover:bg-bg-surface-3 hover:text-text-primary'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    onSelect(item);
                  }}
                  onMouseEnter={() => {
                    // Visual highlight handled by parent via activeIndex
                  }}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt=""
                      className="w-5 h-5 rounded shrink-0 bg-bg-surface-3"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{item.label}</div>
                    {item.sublabel && (
                      <div className="text-xs text-text-tertiary truncate mt-0.5">
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                  {i === activeIndex && (
                    <kbd className="hidden sm:inline-flex text-[10px] text-text-tertiary bg-bg-surface-3 px-1.5 py-0.5 rounded border border-border shrink-0">
                      Enter
                    </kbd>
                  )}
                </li>
              ))
            )}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── useAutocomplete Hook ── */

interface UseAutocompleteOptions<T> {
  fetchFn: (query: string) => Promise<T[]>;
  toItem: (result: T) => AutocompleteItem;
  debounceMs?: number;
  minChars?: number;
}

export function useAutocomplete<T>({
  fetchFn,
  toItem,
  debounceMs = 300,
  minChars = 2,
}: UseAutocompleteOptions<T>) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AutocompleteItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (q: string) => {
      // Cancel previous
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();

      if (q.trim().length < minChars) {
        setItems([]);
        setIsOpen(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const results = await fetchFn(q);
          if (!controller.signal.aborted) {
            const mapped = results.map(toItem);
            setItems(mapped);
            setIsOpen(mapped.length > 0);
            setActiveIndex(-1);
          }
        } catch {
          if (!controller.signal.aborted) {
            setItems([]);
            setIsOpen(false);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }, debounceMs);
    },
    [fetchFn, toItem, debounceMs, minChars],
  );

  function handleKeyDown(e: KeyboardEvent) {
    if (!isOpen || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < items.length) {
          e.preventDefault();
          return items[activeIndex];
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
    return undefined;
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return {
    items,
    isOpen,
    activeIndex,
    loading,
    search,
    handleKeyDown,
    close,
    setIsOpen,
    setActiveIndex,
  };
}
