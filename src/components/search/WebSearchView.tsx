import React, { useState, useEffect } from 'react';
import { 
  Search, Globe, ExternalLink, Clock, Sparkles, Copy, 
  Check, ArrowRight, Loader2, ShieldCheck, Bookmark, Compass
} from 'lucide-react';
import { SearchResponseData } from '../../types';
import { executeWebSearch } from '../../services/api';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';

interface WebSearchViewProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const WebSearchView: React.FC<WebSearchViewProps> = ({
  initialQuery,
  onClearInitialQuery,
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const result = await executeWebSearch(q);
      setSearchData(result);
    } catch (err: any) {
      console.error('Search Error:', err);
      setError(err.message || 'Failed to complete web search query');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (!searchData) return;
    navigator.clipboard.writeText(searchData.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleQueries = [
    'Latest advances in James Webb Space Telescope discoveries 2026',
    'Current global renewable energy adoption statistics',
    'Recent breakthroughs in room-temperature superconductors',
    'State of autonomous humanoid robotics production',
  ];

  return (
    <div className="min-h-full pb-20 pt-4 px-3 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Live Web Search Intelligence
              </h1>
              <p className="text-xs text-slate-400">
                Grounded directly with Google Search for up-to-date verifiable facts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            Real-Time Search Grounding
          </span>
        </div>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex items-center bg-slate-900/90 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)] focus-within:border-blue-400 transition-all p-2"
      >
        <Search className="w-5 h-5 text-blue-400 ml-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the live web for current facts, news, scientific breakthroughs..."
          className="flex-1 bg-transparent text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none px-3"
        />
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
            query.trim() && !isSearching
              ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-md shadow-blue-500/30 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span>Search Web</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sample Search Quick Badges */}
      {!searchData && !isSearching && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Suggested Real-Time Inquiries
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-blue-950/30 border border-white/5 hover:border-blue-500/30 text-left text-xs text-slate-300 hover:text-blue-200 transition-all group"
              >
                <span>{sq}</span>
                <Compass className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isSearching && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <Globe className="w-4 h-4 text-blue-300 absolute" />
          </div>
          <div className="text-sm font-semibold text-white">Executing Google Search Grounding...</div>
          <div className="text-xs text-slate-400 max-w-md">
            Querying authoritative web sources, verifying facts, and synthesizing intelligent response.
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
          <strong>Search Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {searchData && !isSearching && (
        <div className="space-y-6">
          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>{searchData.elapsedMs}ms</span>
              </span>
              <span>•</span>
              <span>{searchData.sources.length} Verified Sources</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Sources List Grid */}
          {searchData.sources.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Cited Web Sources</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {searchData.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-blue-950/40 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 line-clamp-2">
                      {src.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span className="truncate max-w-[180px] font-mono text-blue-400/80">
                        {new URL(src.url).hostname}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Synthesized Answer */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/50 border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Grounded Knowledge Synthesis
              </span>
            </div>
            <MarkdownRenderer content={searchData.answer} />
          </div>
        </div>
      )}
    </div>
  );
};
