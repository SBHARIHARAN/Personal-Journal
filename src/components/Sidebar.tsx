import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Tag,
  Clock,
  Sparkles,
  Smile,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import type { JournalEntry, JournalMode } from '../types';

interface SidebarProps {
  entries: JournalEntry[];
  activeEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onDeleteEntry: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  entries,
  activeEntryId,
  onSelectEntry,
  onDeleteEntry,
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Collect all unique tags and emotions
  const { allTags, allEmotions } = useMemo(() => {
    const tagsSet = new Set<string>();
    const emotionsSet = new Set<string>();

    entries.forEach((e) => {
      e.metadata?.tags?.forEach((t) => tagsSet.add(t));
      if (e.metadata?.dominantEmotion) {
        emotionsSet.add(e.metadata.dominantEmotion);
      }
    });

    return {
      allTags: Array.from(tagsSet).slice(0, 10),
      allEmotions: Array.from(emotionsSet).slice(0, 8),
    };
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchSearch =
        !searchTerm.trim() ||
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.messages.some((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.metadata?.summary?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTag = !selectedTag || entry.metadata?.tags?.includes(selectedTag);
      const matchEmotion =
        !selectedEmotion || entry.metadata?.dominantEmotion === selectedEmotion;

      return matchSearch && matchTag && matchEmotion;
    });
  }, [entries, searchTerm, selectedTag, selectedEmotion]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-80 sm:w-88' : 'w-0'
      } transition-all duration-300 ease-in-out shrink-0 bg-[#EBEBE3] border-r border-[#DEDECF] flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative`}
    >
      {/* Header & Filter Controls */}
      <div className="p-3.5 border-b border-[#DEDECF] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#434338] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#84846D]" />
            <span>Reflections ({filteredEntries.length})</span>
          </div>

          {(selectedTag || selectedEmotion || searchTerm) && (
            <button
              onClick={() => {
                setSelectedTag(null);
                setSelectedEmotion(null);
                setSearchTerm('');
              }}
              className="text-[11px] text-[#84846D] hover:text-[#6B6B58] font-semibold underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A75]" />
          <input
            id="input-sidebar-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by keyword..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-[#D3D3C2] text-[#434338] placeholder-[#A0A08B] focus:outline-none focus:border-[#84846D] shadow-2xs"
          />
        </div>

        {/* Emotion / Tags Chips */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                  selectedTag === t
                    ? 'bg-[#84846D] text-white'
                    : 'bg-[#DCDCCF] text-[#5C5C4B] hover:bg-[#D3D3C2]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#7A7A66]">
            <p>No reflections found matching your criteria.</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isActive = entry.id === activeEntryId;
            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                  isActive
                    ? 'bg-white border-[#84846D] shadow-xs'
                    : 'bg-[#F2F2EC] hover:bg-white border-transparent hover:border-[#DEDECF]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`text-xs font-semibold line-clamp-1 ${
                      isActive ? 'text-[#2D2D24]' : 'text-[#434338]'
                    }`}
                  >
                    {entry.title || 'Untitled Reflection'}
                  </h4>
                  <span className="text-[10px] text-[#8A8A75] whitespace-nowrap font-mono">
                    {formatDate(entry.updatedAt || entry.createdAt)}
                  </span>
                </div>

                {entry.metadata?.summary && (
                  <p className="text-[11px] text-[#6B6B58] line-clamp-2 mt-1 leading-relaxed">
                    {entry.metadata.summary}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E5E5DA]">
                  <div className="flex items-center gap-1.5">
                    {entry.metadata?.dominantEmotion && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EBEBE3] text-[#5C5C4B] font-medium border border-[#D8D8C8]">
                        {entry.metadata.dominantEmotion}
                      </span>
                    )}
                    <span className="text-[10px] text-[#8A8A75] uppercase tracking-wider font-semibold">
                      {entry.mode}
                    </span>
                  </div>

                  <button
                    onClick={(e) => onDeleteEntry(entry.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#8A8A75] hover:text-rose-600 transition-opacity"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
