import { Check, Clock3, MapPin, SearchX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { readRecentPlaces } from "../../utils/recentPlaces";
import styles from "./RouteInputCard.module.css";

export interface AddressResult {
  display_name: string;
  latitude: number;
  longitude: number;
}

const DRAG_HINT_KEY = "rc_drag_hint_seen";

export function RouteInputCard({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  onPickupPress,
  onDropoffPress,
  activeField,
  query,
  isLoading = false,
  suggestions = [],
  currentLocationOption = null,
  onQueryChange,
  onCloseEditor,
  onSelectSuggestion,
}: {
  pickup: AddressResult | null;
  dropoff: AddressResult | null;
  onPickupChange: (address: AddressResult | null) => void;
  onDropoffChange: (address: AddressResult | null) => void;
  onPickupPress: () => void;
  onDropoffPress: () => void;
  activeField?: "pickup" | "dropoff" | null;
  query?: string;
  isLoading?: boolean;
  suggestions?: AddressResult[];
  currentLocationOption?: AddressResult | null;
  onQueryChange?: (value: string) => void;
  onCloseEditor?: () => void;
  onSelectSuggestion?: (address: AddressResult) => void;
}) {
  const [swapping, setSwapping] = useState(false);
  const [dragging, setDragging] = useState<"pickup" | "dropoff" | null>(null);
  const [dragOver, setDragOver] = useState<"pickup" | "dropoff" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const recentPlaces = readRecentPlaces();
  const showRecentPlaces = Boolean(activeField) && (query ?? "").trim().length < 2;
  const showSuggestions = Boolean(activeField);
  const suggestionItems = showRecentPlaces
    ? activeField === "pickup" && currentLocationOption
      ? [currentLocationOption, ...recentPlaces]
      : recentPlaces
    : suggestions;

  useEffect(() => {
    if (activeField) {
      inputRef.current?.focus();
      inputRef.current?.select();
      setActiveSuggestionIndex(0);
    }
  }, [activeField]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const seen = window.localStorage.getItem(DRAG_HINT_KEY);
    if (seen) {
      return;
    }

    setShowHint(true);
    const timeoutId = window.setTimeout(() => {
      window.localStorage.setItem(DRAG_HINT_KEY, "true");
      setShowHint(false);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function markHintSeen() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DRAG_HINT_KEY, "true");
    }
    setShowHint(false);
  }

  function handleSwap() {
    const nextPickup = dropoff;
    const nextDropoff = pickup;
    onPickupChange(nextPickup);
    onDropoffChange(nextDropoff);
    setSwapping(true);
    window.setTimeout(() => setSwapping(false), 400);
  }

  function handleDragStart(field: "pickup" | "dropoff") {
    setDragging(field);
    markHintSeen();
  }

  function handleDrop(target: "pickup" | "dropoff") {
    if (!dragging || dragging === target) {
      setDragOver(null);
      setDragging(null);
      return;
    }
    handleSwap();
    setDragOver(null);
    setDragging(null);
  }

  useEffect(() => {
    if (!showSuggestions) {
      return;
    }
    suggestionRefs.current[activeSuggestionIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeSuggestionIndex, showSuggestions]);

  function handleEditorKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCloseEditor?.();
      return;
    }
    if (event.key === "Tab") {
      onCloseEditor?.();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => Math.min(current + 1, Math.max(suggestionItems.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter" && suggestionItems[activeSuggestionIndex]) {
      event.preventDefault();
      onSelectSuggestion?.(suggestionItems[activeSuggestionIndex]);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div
          role="button"
          tabIndex={0}
          draggable={activeField == null}
          onDragStart={() => handleDragStart("pickup")}
          onDragEnd={() => {
            setDragging(null);
            setDragOver(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (dragging === "dropoff") {
              setDragOver("pickup");
            }
          }}
          onDrop={() => handleDrop("pickup")}
          onClick={() => {
            if (activeField !== "pickup") {
              onPickupPress();
            }
          }}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && activeField !== "pickup") {
              event.preventDefault();
              onPickupPress();
            }
          }}
          className={`${styles.row} ${dragging === "pickup" ? styles.dragging : ""} ${dragOver === "pickup" ? styles.dragover : ""} ${swapping ? styles.swapping : ""}`}
        >
          <span className={styles.iconPickup} />
          {activeField === "pickup" ? (
            <>
              <input
                ref={inputRef}
                value={query ?? ""}
                onChange={(event) => onQueryChange?.(event.target.value)}
                placeholder="Search pickup address"
                className={styles.fieldInput}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleEditorKeyDown}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              {(query ?? "").length > 0 ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onQueryChange?.("");
                    window.setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className={styles.editorIcon}
                  aria-label="Clear pickup search"
                >
                  <X size={12} />
                </button>
              ) : null}
            </>
          ) : (
            <span className={`${styles.fieldText} ${pickup ? "" : styles.placeholder}`}>{pickup?.display_name ?? "Where are you?"}</span>
          )}
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <button type="button" onClick={handleSwap} className={styles.swapBtn} aria-label="Swap pickup and dropoff">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5 3v10M5 13l-3-3M5 13l3-3" stroke="#5A6B56" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 13V3M11 3L8 6M11 3l3 3" stroke="#5A6B56" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className={styles.dividerLine} />
        </div>

        <div
          role="button"
          tabIndex={0}
          draggable={activeField == null}
          onDragStart={() => handleDragStart("dropoff")}
          onDragEnd={() => {
            setDragging(null);
            setDragOver(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (dragging === "pickup") {
              setDragOver("dropoff");
            }
          }}
          onDrop={() => handleDrop("dropoff")}
          onClick={() => {
            if (activeField !== "dropoff") {
              onDropoffPress();
            }
          }}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && activeField !== "dropoff") {
              event.preventDefault();
              onDropoffPress();
            }
          }}
          className={`${styles.row} ${dragging === "dropoff" ? styles.dragging : ""} ${dragOver === "dropoff" ? styles.dragover : ""} ${swapping ? styles.swapping : ""}`}
        >
          <span className={styles.iconDropoff} />
          {activeField === "dropoff" ? (
            <>
              <input
                ref={inputRef}
                value={query ?? ""}
                onChange={(event) => onQueryChange?.(event.target.value)}
                placeholder="Search destination"
                className={styles.fieldInput}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleEditorKeyDown}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              {(query ?? "").length > 0 ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onQueryChange?.("");
                    window.setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className={styles.editorIcon}
                  aria-label="Clear dropoff search"
                >
                  <X size={12} />
                </button>
              ) : null}
            </>
          ) : (
            <>
              <span className={`${styles.fieldText} ${dropoff ? "" : styles.placeholder}`}>{dropoff?.display_name ?? "Where to?"}</span>
              {dropoff ? <span className={styles.changeLink}>Change</span> : null}
            </>
          )}
        </div>
      </div>
      {showSuggestions ? (
        <div className={styles.suggestions}>
          <div className={styles.suggestionsInner}>
            {showRecentPlaces && recentPlaces.length > 0 ? <div className={styles.recentLabel}>Recent</div> : null}
            {isLoading && !showRecentPlaces ? (
              <>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
              </>
            ) : null}
            {!isLoading && !showRecentPlaces && suggestions.length === 0 && (query ?? "").trim().length >= 2 ? (
              <div className={styles.suggestionEmpty}>
                <SearchX size={18} />
                <span>No results found for "{(query ?? "").trim()}"</span>
              </div>
            ) : null}
            {suggestionItems.map((result, index) => (
              <button
                key={`${result.display_name}-${result.latitude}-${result.longitude}`}
                type="button"
                onClick={() => onSelectSuggestion?.(result)}
                ref={(element) => {
                  suggestionRefs.current[index] = element;
                }}
                className={`${styles.suggestionItem} ${index === activeSuggestionIndex ? styles.suggestionActive : ""}`}
              >
                {showRecentPlaces ? (
                  <Clock3 size={14} className={styles.suggestionIcon} />
                ) : (
                  <MapPin size={14} className={styles.suggestionIcon} />
                )}
                <span className={styles.suggestionMeta}>
                  <span className={styles.suggestionText}>{result.display_name}</span>
                  <span className={styles.suggestionSubtext}>
                    {result.display_name.split(",").slice(1, 3).join(",").trim() || (showRecentPlaces ? "Recent place" : "Location")}
                  </span>
                </span>
                {showRecentPlaces && activeField === "pickup" && currentLocationOption?.display_name === result.display_name ? (
                  <Check size={14} className={styles.currentCheck} />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {showHint ? (
        <div className={styles.dragHint}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
            <path d="M2 2H12M2 6H12M2 10H12" stroke="#B8C4B3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Drag either field to swap pickup and dropoff</span>
        </div>
      ) : null}
    </div>
  );
}
