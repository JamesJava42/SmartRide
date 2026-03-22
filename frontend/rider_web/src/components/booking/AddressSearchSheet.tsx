import { Clock3, MapPin, SearchX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAddressSearch } from "../../hooks/useAddressSearch";
import type { AddressResult } from "../../types/ride";
import { readRecentPlaces } from "../../utils/recentPlaces";
import styles from "./AddressSearchSheet.module.css";

export function AddressSearchSheet({
  open,
  field,
  initialValue,
  onClose,
  onSelect,
}: {
  open: boolean;
  field: "pickup" | "dropoff";
  initialValue: string;
  onClose: () => void;
  onSelect: (value: AddressResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState(initialValue);
  const { results, isLoading, isDebouncing, isError, refetch } = useAddressSearch(query, open);
  const recentPlaces = useMemo(() => readRecentPlaces(), [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery(initialValue);
  }, [initialValue, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const timeoutId = window.setTimeout(() => inputRef.current?.focus(), 320);
    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        inputRef.current?.blur();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const showRecent = query.trim().length < 2;
  const showLoading = isLoading && !showRecent;
  const showEmpty = !showLoading && !isError && query.trim().length >= 2 && results.length === 0;

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        onClick={() => {
          inputRef.current?.blur();
          onClose();
        }}
        aria-label="Close address search"
      />
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.label}>{field.toUpperCase()}</div>
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.input}
            placeholder="Search for a location..."
            type="text"
            autoFocus={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
          {query.length > 0 ? (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setQuery("");
                window.setTimeout(() => inputRef.current?.focus(), 0);
              }}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          ) : null}
        </div>
        {isDebouncing && query.trim().length >= 2 ? (
          <div className={styles.pendingDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        <div className={styles.results}>
          {showRecent ? (
            recentPlaces.length > 0 ? (
              <div className={styles.recentSection}>
                <div className={styles.recentLabel}>Recent</div>
                {recentPlaces.map((item) => {
                  const secondary = item.display_name.split(",").slice(1, 3).join(",").trim();
                  return (
                    <button
                      key={`${item.display_name}-${item.saved_at}`}
                      type="button"
                      className={styles.result}
                      onClick={() => onSelect(item)}
                    >
                      <Clock3 size={14} className={styles.resultIcon} />
                      <span className={styles.texts}>
                        <span className={styles.primary}>{item.display_name}</span>
                        <span className={styles.secondary}>{secondary || "Recent place"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null
          ) : showLoading ? (
            <>
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
            </>
          ) : isError ? (
            <div className={styles.emptyState}>
              <SearchX size={20} className={styles.emptyIcon} />
              <div className={styles.empty}>Search unavailable. Check your connection.</div>
              <button type="button" className={styles.retry} onClick={() => void refetch()}>
                Try again
              </button>
            </div>
          ) : showEmpty ? (
            <div className={styles.emptyState}>
              <SearchX size={20} className={styles.emptyIcon} />
              <div className={styles.empty}>No results found for "{query.trim()}"</div>
            </div>
          ) : (
            results.map((item) => {
              const secondary = item.display_name.split(",").slice(1, 3).join(",").trim();
              return (
                <button
                  key={`${item.display_name}-${item.latitude}-${item.longitude}`}
                  type="button"
                  className={styles.result}
                  onClick={() => onSelect(item)}
                >
                  <MapPin size={14} className={styles.resultIcon} />
                  <span className={styles.texts}>
                    <span className={styles.primary}>{item.display_name}</span>
                    <span className={styles.secondary}>{secondary || "Location"}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
