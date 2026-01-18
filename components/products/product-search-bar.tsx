'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { cn } from '@/lib/utils';

/**
 * Enhanced Product Search Bar Component
 * Features:
 * - Debounced search input
 * - Recent searches (localStorage)
 * - Search suggestions/autocomplete
 * - Clear button
 * - Loading indicator
 * - Keyboard shortcut (/)
 */

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

const MAX_RECENT_SEARCHES = 5;

export function ProductSearchBar({
  value,
  onChange,
  isLoading = false,
  placeholder = '상품 검색...',
  className,
}: ProductSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    'product-recent-searches',
    []
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(localValue, 300);

  // Keyboard shortcut: / to focus search
  useKeyboardShortcut([
    {
      key: '/',
      callback: () => {
        inputRef.current?.focus();
      },
    },
  ]);

  // Update parent when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);

      // Add to recent searches if not empty and not already there
      if (debouncedValue.trim() && !recentSearches.includes(debouncedValue)) {
        setRecentSearches([
          debouncedValue,
          ...recentSearches.slice(0, MAX_RECENT_SEARCHES - 1),
        ]);
      }
    }
  }, [debouncedValue, onChange, value, recentSearches, setRecentSearches]);

  // Sync local value with external changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleRemoveRecentSearch = (
    e: React.MouseEvent,
    searchToRemove: string
  ) => {
    e.stopPropagation();
    setRecentSearches(
      recentSearches.filter((search) => search !== searchToRemove)
    );
  };

  const filteredRecentSearches = recentSearches.filter((search) =>
    search.toLowerCase().includes(localValue.toLowerCase())
  );

  const showRecentSearches =
    showSuggestions &&
    filteredRecentSearches.length > 0 &&
    localValue.length < 3;

  return (
    <div className={cn('relative', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          className="pl-9 pr-20"
          aria-label="Search products"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          )}

          {localValue && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 hover:bg-gray-100"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}

          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            /
          </Badge>
        </div>
      </div>

      {/* Recent Searches Dropdown */}
      {showRecentSearches && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                최근 검색
              </span>
              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecentSearches([])}
                  className="h-6 text-xs px-2"
                >
                  전체 삭제
                </Button>
              )}
            </div>

            <div className="space-y-1">
              {filteredRecentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(search)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{search}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveRecentSearch(e, search)}
                    className="p-1 hover:bg-gray-200 rounded-sm transition-colors"
                    aria-label="Remove from recent searches"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
