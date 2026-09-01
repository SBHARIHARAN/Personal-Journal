import React, { useState } from 'react';
import { X, Lightbulb, Sparkles, ArrowRight, Compass, Brain, Heart, Zap } from 'lucide-react';
import type { JournalMode } from '../types';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string, suggestedMode: JournalMode) => void;
}

interface PromptItem {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  mode: JournalMode;
  title: string;
  prompt: string;
}

const PROMPTS: PromptItem[] = [
  {
    category: 'Introspection & Clarity',
    icon: Compass,
    mode: 'reflection',
    title: 'The Energy Audit',
    prompt: 'What specific activities, conversations, or tasks gave me genuine energy this week, and which ones silently drained me?',
  },
  {
    category: 'Introspection & Clarity',
    icon: Compass,
    mode: 'reflection',
    title: 'Unspoken Expectations',
    prompt: 'Where am I currently carrying uncommunicated expectations of myself or others, and what friction is that causing?',
  },
  {
    category: 'Creative Brainstorming',
    icon: Zap,
    mode: 'brainstorming',
    title: 'Divergent 10x Ideas',
    prompt: 'If I had to achieve my 1-year creative goal in 6 weeks without spending any money, what radical approaches would I test?',
  },
  {
    category: 'Creative Brainstorming',
    icon: Zap,
    mode: 'brainstorming',
    title: 'Cross-Domain Synthesis',
    prompt: 'How could I combine my most niche personal interest with my primary professional skill to create something unique?',
  },
  {
    category: 'Cognitive Reframing',
    icon: Brain,
    mode: 'reframe',
    title: 'The Hidden Gift of Obstacles',
    prompt: 'What recent setback or frustration has occurred, and what specific resilience skill is it forcing me to develop?',
  },
  {
    category: 'Cognitive Reframing',
    icon: Brain,
    mode: 'reframe',
    title: 'Perfectionism Interrogation',
    prompt: 'What am I putting off because I fear doing it imperfectly, and what is the absolute worst realistic outcome if it is flawed?',
  },
  {
    category: 'Socratic Inquiry',
    icon: Lightbulb,
    mode: 'socratic',
    title: 'Defining True Success',
    prompt: 'How am I currently measuring "success", and did I actively choose this definition or inherit it from culture?',
  },
  {
    category: 'Gratitude & Perspective',
    icon: Heart,
    mode: 'reflection',
    title: 'The Micro-Gratitude Lens',
    prompt: 'What are 3 subtle, quiet details from today that brought momentary comfort or delight?',
  },
];

export const InspirationModal: React.FC<InspirationModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Introspection & Clarity', 'Creative Brainstorming', 'Cognitive Reframing', 'Socratic Inquiry', 'Gratitude & Perspective'];

  const filteredPrompts = selectedCategory === 'All'
    ? PROMPTS
    : PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#F6F6F2] border border-[#DEDECF] rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#DEDECF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#84846D] text-white flex items-center justify-center shadow-xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-lg sm:text-xl text-[#2D2D24]">
                Journal Inspiration Library
              </h2>
              <p className="text-xs text-[#7A7A66]">
                Curated psychological and creative prompts designed to unlock deep introspection.
              </p>
            </div>
          </div>

          <button
            id="btn-close-inspiration-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8A75] hover:text-[#2D2D24] hover:bg-[#EBEBE3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="p-3.5 border-b border-[#DEDECF] bg-[#FBFBFA] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#84846D] text-white shadow-2xs'
                  : 'bg-white text-[#5C5C4B] hover:bg-[#EBEBE3] border border-[#DEDECF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectPrompt(p.prompt, p.mode);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-white border border-[#DEDECF] hover:border-[#84846D] cursor-pointer transition-all shadow-2xs group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#84846D]" />
                    <h4 className="text-xs font-bold text-[#2D2D24] group-hover:text-[#84846D]">
                      {p.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5F5F0] text-[#6B6B58] border border-[#E2E2D6]">
                    {p.mode}
                  </span>
                </div>

                <p className="text-xs text-[#434338] leading-relaxed">
                  "{p.prompt}"
                </p>

                <div className="flex items-center justify-end text-[11px] font-semibold text-[#84846D] group-hover:translate-x-1 transition-transform gap-1">
                  <span>Use Prompt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
