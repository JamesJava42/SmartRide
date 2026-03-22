import { Clock3, MapPin, SearchX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAddressSearch } from "../../hooks/useAddressSearch";
import type { AddressResult } from "../../types/ride";
import { readRecentPlaces } from "../../utils/recentPlaces";
import styles from "./AddressSearchPanel.module.css";

export function AddressSearchPanel({
  label,
  value,
  open,
  mobile,
  onClose,
  onSelect,
}: {
  label: "PICKUP" | "DROPOFF";
  value: string;
  open: boolean;
  mobile: boolean;
  onClose: () => void;
  onSelect: (value: AddressResult) => void;
}) {
  const [query, setQuery] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { results, isLoading, isDebouncing, isError, refetch } = useAddressSearch(query, open);
  const recentPlaces = useMemo(() => readRecentPlaces(), [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery(value);
    setActiveIndex(0);
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const timeoutId = window.setTimeout(() => inputRef.current?.focus(), mobile ? 320 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [mobile, open]);

  const items = query.trim().length < 2 ? recentPlaces : results;
  const showLoading = isLoading && query.trim().length >= 2;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    resultRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) {
    return null;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      inputRef.current?.blur();
      onClose();
      return;
    }
    if (event.key === "Tab") {
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(items.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter" && items[activeIndex]) {
      event.preventDefault();
      onSelect(items[activeIndex]);
    }
  }

  return (
    <>
      {mobile ? (
        <button
          type="button"
          className={styles.backdrop}
          onClick={() => {
            inputRef.current?.blur();
            onClose();
          }}
          aria-label="Close address search"
        />
      ) : null}
      <div className={`${styles.panel} ${mobile ? styles.mobile : styles.desktop}`}>
        {mobile ? <div className={styles.handle} /> : null}
        <div className={styles.label}>{label}</div>
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
            placeholder="Search for a location..."
            type="text"
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
                setActiveIndex(0);
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
          {query.trim().length < 2 ? (
            recentPlaces.length > 0 ? (
              <>
                <div className={styles.recentLabel}>Recent</div>
                {recentPlaces.map((item, index) => (
                  <button
                    key={`${item.display_name}-${item.saved_at}`}
                    ref={(element) => {
                      resultRefs.current[index] = element;
                    }}
                    type="button"
                    className={`${styles.resultRow} ${index === activeIndex ? styles.active : ""}`}
                    onClick={() => onSelect(item)}
                  >
                    <Clock3 size={14} className={styles.resultIcon} />
                    <span className={styles.resultMain}>
                      <span className={styles.resultTitle}>{item.display_name}</span>
                      <span className={styles.resultSubtitle}>
                        {item.display_name.split(",").slice(1, 3).join(",").trim() || "Recent place"}
                      </span>
                    </span>
                  </button>
                ))}
              </>
            ) : null
          ) : showLoading ? (
            <>
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
              <div className={styles.skeleton} />
            </>
          ) : isError ? (
            <div className={styles.emptyWrap}>
              <SearchX size={20} className={styles.emptyIcon} />
              <div className={styles.empty}>Search unavailable. Check your connection.</div>
              <button type="button" className={styles.retry} onClick={() => void refetch()}>
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyWrap}>
              <SearchX size={20} className={styles.emptyIcon} />
              <div className={styles.empty}>No results found for "{query.trim()}"</div>
            </div>
          ) : (
            items.map((item, index) => (
              <button
                key={`${item.display_name}-${item.latitude}-${item.longitude}`}
                ref={(element) => {
                  resultRefs.current[index] = element;
                }}
                type="button"
                className={`${styles.resultRow} ${index === activeIndex ? styles.active : ""}`}
                onClick={() => onSelect(item)}
              >
                <MapPin size={14} className={styles.resultIcon} />
                <span className={styles.resultMain}>
                  <span className={styles.resultTitle}>{item.display_name}</span>
                  <span className={styles.resultSubtitle}>
                    {item.display_name.split(",").slice(1, 3).join(",").trim() || "Location"}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
