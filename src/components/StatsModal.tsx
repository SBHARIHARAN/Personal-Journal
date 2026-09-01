import React, { useMemo } from 'react';
import {
  BarChart2,
  X,
  Flame,
  BookOpen,
  Tag,
  Smile,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface StatsModalProps {
  entries: JournalEntry[];
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ entries, onClose }) => {
  // Calculate stats
  const stats = useMemo(() => {
    const totalEntries = entries.length;

    // Word count estimate
    let totalWords = 0;
    entries.forEach((e) => {
      e.messages?.forEach((m) => {
        totalWords += (m.text || '').split(/\s+/).filter(Boolean).length;
      });
      if (e.freeformNotes) {
        totalWords += e.freeformNotes.split(/\s+/).filter(Boolean).length;
      }
    });

    // Tag counts
    const tagMap: Record<string, number> = {};
    const emotionMap: Record<string, number> = {};
    const modeCounts: Record<string, number> = {
      reflection: 0,
      brainstorm: 0,
      decision: 0,
      freewrite: 0,
    };

    // Calculate streak
    const datesSet = new Set<string>();
    entries.forEach((e) => {
      if (e.createdAt) {
        datesSet.add(new Date(e.createdAt).toISOString().split('T')[0]);
      }
      if (e.mode && modeCounts[e.mode] !== undefined) {
        modeCounts[e.mode]++;
      }
      e.metadata?.tags?.forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
      if (e.metadata?.dominantEmotion) {
        const emo = e.metadata.dominantEmotion;
        emotionMap[emo] = (emotionMap[emo] || 0) + 1;
      }
    });

    // Streak calculation (consecutive days)
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (datesSet.has(dateStr)) {
        currentStreak++;
      } else if (i === 0) {
        // Today might not have an entry yet, continue to check yesterday
        continue;
      } else {
        break;
      }
    }

    const sortedTags = Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const sortedEmotions = Object.entries(emotionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      totalEntries,
      totalWords,
      currentStreak: Math.max(currentStreak, datesSet.size > 0 ? 1 : 0),
      sortedTags,
      sortedEmotions,
      modeCounts,
    };
  }, [entries]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#434338]/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#F9F9F6] border border-[#DEDECF] rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-[#434338] relative my-8">
        <button
          id="btn-close-stats-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#8A8A75] hover:text-[#2D2D24] hover:bg-[#EBEBE3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EBEBE3] border border-[#DEDECF] text-[#84846D] flex items-center justify-center shadow-xs">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#2D2D24]">
              Journal Insights & Growth
            </h2>
            <p className="text-xs text-[#8A8A75]">
              Analytics on your reflection cadence, emotional landscape, and topic frequency.
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white border border-[#DEDECF] text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-serif text-[#2D2D24]">
              {stats.totalEntries}
            </div>
            <div className="text-[11px] text-[#8A8A75]">Total Entries</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DEDECF] text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto mb-2">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-serif text-[#2D2D24]">
              {stats.currentStreak} <span className="text-xs font-normal text-[#8A8A75]">days</span>
            </div>
            <div className="text-[11px] text-[#8A8A75]">Active Streak</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DEDECF] text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-serif text-[#2D2D24]">
              {stats.totalWords.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#8A8A75]">Words Reflected</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#DEDECF] text-center shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-serif text-[#2D2D24]">
              {stats.sortedTags.length}
            </div>
            <div className="text-[11px] text-[#8A8A75]">Unique Themes</div>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-white border border-[#DEDECF] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#2D2D24] flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-[#84846D]" />
                <span>Dominant Emotional States</span>
              </span>
              <span className="text-[10px] text-[#8A8A75] font-mono">Gemini AI Classified</span>
            </div>

            {stats.sortedEmotions.length === 0 ? (
              <p className="text-xs text-[#8A8A75] italic">No emotion metadata recorded yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.sortedEmotions.map(([emo, count]) => (
                  <div
                    key={emo}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBEBE3] border border-[#DEDECF] text-xs text-[#434338]"
                  >
                    <span className="font-semibold text-[#2D2D24]">{emo}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#DEDECF] text-[#434338] font-mono">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Thematic Tags */}
          <div className="p-4 rounded-xl bg-white border border-[#DEDECF] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#2D2D24] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#84846D]" />
                <span>Top Thematic Focus Areas</span>
              </span>
            </div>

            {stats.sortedTags.length === 0 ? (
              <p className="text-xs text-[#8A8A75] italic">No tags generated yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.sortedTags.map(([tag, count]) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBEBE3] border border-[#DEDECF] text-xs text-[#434338]"
                  >
                    <span className="font-bold text-[#84846D]">{tag}</span>
                    <span className="text-[10px] text-[#8A8A75]">×{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#84846D] hover:bg-[#6B6B58] text-white transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
