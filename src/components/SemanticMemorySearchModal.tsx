import React, { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  BookOpen,
  Calendar,
  Smile,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import type { JournalEntry, SemanticSearchResponse } from '../types';
import { querySemanticMemory } from '../services/api';

interface SemanticMemorySearchModalProps {
  entries: JournalEntry[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEntry: (id: string) => void;
}

export const SemanticMemorySearchModal: React.FC<SemanticMemorySearchModalProps> = ({
  entries,
  isOpen,
  onClose,
  onSelectEntry,
}) => {
  const [queryText, setQueryText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SemanticSearchResponse | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (customQuery?: string) => {
    const q = (customQuery || queryText).trim();
    if (!q || isSearching) return;

    setIsSearching(true);
    try {
      const response = await querySemanticMemory({
        query: q,
        entries,
      });
      setSearchResult(response.searchResult);
    } catch (err: any) {
      console.error('Semantic search error:', err);
      alert(`Search failed: ${err.message || 'Error occurred.'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQuestions = [
    'What recurring patterns or blockers appear in my work reflections?',
    'When did I feel most fulfilled or energized recently?',
    'What creative ideas have I brainstormed but not yet executed?',
    'How has my perspective on consistency evolved over time?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#F6F6F2] border border-[#DEDECF] rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#DEDECF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#84846D] text-white flex items-center justify-center shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-lg sm:text-xl text-[#2D2D24]">
                Semantic Memory Search & Synthesis
              </h2>
              <p className="text-xs text-[#7A7A66]">
                Ask qualitative questions across all past journal entries to synthesize insights and patterns.
              </p>
            </div>
          </div>

          <button
            id="btn-close-search-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8A75] hover:text-[#2D2D24] hover:bg-[#EBEBE3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-[#DEDECF] bg-[#FBFBFA]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8A8A75] absolute left-3.5" />
            <input
              id="input-semantic-query"
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="e.g. When was the last time I felt overwhelmed at work?"
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm rounded-xl bg-white border border-[#D3D3C2] focus:border-[#84846D] text-[#434338] placeholder-[#A0A08B] focus:outline-none shadow-xs"
            />
            <button
              id="btn-execute-semantic-search"
              onClick={() => handleSearch()}
              disabled={!queryText.trim() || isSearching}
              className="absolute right-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#84846D] hover:bg-[#6B6B58] text-white transition-colors disabled:opacity-40 shadow-xs"
            >
              {isSearching ? 'Synthesizing...' : 'Query'}
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-[#8A8A75] font-semibold flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Try asking:
            </span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryText(q);
                  handleSearch(q);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-[#EBEBE3] border border-[#DEDECF] text-[#5C5C4B] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {searchResult ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* AI Synthesis Card */}
              <div className="p-5 rounded-2xl bg-white border border-[#84846D] shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#F0F0EB] pb-2.5">
                  <Sparkles className="w-4 h-4 text-[#84846D]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#434338]">
                    Synthesized Memory Insights
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-[#38382F] leading-relaxed whitespace-pre-wrap">
                  {searchResult.synthesis}
                </div>

                {/* Key Recurring Themes */}
                {searchResult.keyThemes && searchResult.keyThemes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F0F0EB]">
                    <span className="text-[11px] font-bold text-[#8A8A75] uppercase">
                      Identified Themes:
                    </span>
                    {searchResult.keyThemes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EBEBE3] text-[#5C5C4B] border border-[#D3D3C2]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cited Entries */}
              {searchResult.citedEntryIds && searchResult.citedEntryIds.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A8A75]">
                    Referenced Historical Reflections ({searchResult.citedEntryIds.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResult.citedEntryIds.map((entryId) => {
                      const entry = entries.find((e) => e.id === entryId);
                      if (!entry) return null;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => {
                            onSelectEntry(entry.id);
                            onClose();
                          }}
                          className="p-4 rounded-xl bg-white border border-[#DEDECF] hover:border-[#84846D] cursor-pointer transition-all shadow-2xs space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-bold text-[#2D2D24] line-clamp-1 group-hover:text-[#84846D]">
                              {entry.title}
                            </h5>
                            <ArrowRight className="w-3.5 h-3.5 text-[#8A8A75] group-hover:translate-x-0.5 transition-transform" />
                          </div>

                          {entry.metadata?.summary && (
                            <p className="text-[11px] text-[#6B6B58] line-clamp-2">
                              {entry.metadata.summary}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-[#8A8A75] pt-1 border-t border-[#F0F0EB]">
                            <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                            {entry.metadata?.dominantEmotion && (
                              <span className="px-1.5 py-0.5 rounded bg-[#F5F5F0] text-[#5C5C4B]">
                                {entry.metadata.dominantEmotion}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3 max-w-sm mx-auto text-xs text-[#7A7A66]">
              <div className="w-10 h-10 rounded-xl bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <p>
                Enter a question or theme above to synthesize qualitative memories and discover personal patterns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
