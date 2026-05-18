import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance.util";
import debounce from "lodash-es/debounce";

const SearchAutocomplete = ({
  initialQuery = "",
  variant = "desktop", 
  isOpen = true,
  onClose, 
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());
  const containerRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const term = query.trim();
    if (!term) return;
    if (onClose) onClose();
    navigate(`/buyer/search?q=${encodeURIComponent(term)}`);
  };

  const fetchSuggestions = async (term) => {
    const key = term.trim().toLowerCase();
    if (!key || key.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      setError("");
      return;
    }
    if (cacheRef.current.has(key)) {
      setSuggestions(cacheRef.current.get(key));
      setShowSuggestions(true);
      setLoading(false);
      setError("");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const res = await axiosInstance.get("buyer/search", {
        params: { q: key, limit: 5 },
        signal: abortRef.current.signal,
      });
      const list = res?.data?.data?.books || res?.data?.books || [];
      cacheRef.current.set(key, list);
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }
      setSuggestions(list);
      setShowSuggestions(true);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setError("Failed to fetch suggestions");
      setSuggestions([]);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 350), []);

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [debouncedFetch]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const inputEl = (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="q"
        value={query}
        placeholder="Search books..."
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          if (val.trim().length >= 2) {
            debouncedFetch(val);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setError("");
          }
        }}
        onFocus={() => {
          if (suggestions.length) setShowSuggestions(true);
        }}
        className={
          variant === "desktop"
            ? "w-[35vw] lg:w-[24vw] xl:w-[20vw] px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 outline-none pr-9"
            : "w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-700"
        }
      />
      <button
        type="submit"
        className={
          variant === "desktop"
            ? "absolute right-3 top-[9px] text-gray-400"
            : "ml-2 text-purple-500 hover:text-purple-700 transition-transform duration-300 hover:scale-110"
        }
      >
        {variant === "desktop" ? (
          <i className="fas fa-search"></i>
        ) : (
          <i className="fa-solid fa-arrow-right"></i>
        )}
      </button>
    </form>
  );

  const suggestionsEl = (
    <>
      {loading && (
        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <i className="fas fa-spinner fa-spin"></i>
          Searching...
        </div>
      )}
      {!loading && error && (
        <div className="px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && suggestions.length === 0 && (
        <div className="px-4 py-3 text-sm text-gray-500">No matches found</div>
      )}
      {!loading && !error && suggestions.length > 0 && (
        <ul className={variant === "desktop" ? "max-h-72 overflow-auto" : ""}>
          {suggestions.map((b) => (
            <li key={b._id}>
              <button
                onClick={() => {
                  if (onClose) onClose();
                  setShowSuggestions(false);
                  navigate(`/buyer/product-detail/${b._id}`);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
              >
                {b.coverImage && (
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-8 h-10 object-cover rounded"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                  {b.author && (
                    <p className="text-xs text-gray-500 truncate">{b.author}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-gray-200">
        <button
          onClick={() => {
            if (onClose) onClose();
            setShowSuggestions(false);
            const term = query.trim();
            if (term) navigate(`/buyer/search?q=${encodeURIComponent(term)}`);
          }}
          className="w-full px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 text-left"
        >
          View all results for "{query.trim()}"
        </button>
      </div>
    </>
  );

  if (variant === "desktop") {
    return (
      <div ref={containerRef} className="relative">
        {inputEl}
        {showSuggestions && (
          <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {suggestionsEl}
          </div>
        )}
      </div>
    );
  }

  // Mobile variant
  if (!isOpen) return null;
  return (
    <div className="px-4 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] max-h-24 opacity-100 mt-2">
      <div
        ref={containerRef}
        className="relative bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-[2px] shadow-inner"
      >
        <div className="bg-white rounded-lg flex items-center px-3">
          {inputEl}
        </div>
        {showSuggestions && (
          <div className="mt-2 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {suggestionsEl}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAutocomplete;
