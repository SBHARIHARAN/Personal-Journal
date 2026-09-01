import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  X,
  Compass,
  Scale,
  Feather,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { JournalMode } from '../types';
import { fetchInspirationalPrompts } from '../services/api';

interface PromptInspirationsModalProps {
  onClose: () => void;
  onSelectPrompt: (title: string, starterText: string, mode: JournalMode) => void;
}

const STATIC_CATEGORIES: Record<
  string,
  Array<{ title: string; prompt: string; mode: JournalMode; tags: string[] }>
> = {
  'Daily Introspection & Grounding': [
    {
      title: 'The Evening Unpack',
      prompt: 'What energized me today, what drained my energy, and what is one small thing I learned about myself?',
      mode: 'reflection',
      tags: ['#SelfAwareness', '#EnergyManagement'],
    },
    {
      title: 'Gratitude Reframing',
      prompt: 'Identify one frustration or obstacle from this week. What unexpected strength or clarity did it reveal?',
      mode: 'reflection',
      tags: ['#Gratitude', '#Mindset'],
    },
    {
      title: 'The Silent Assumption',
      prompt: 'What belief am I currently treating as an absolute fact that might actually just be a temporary assumption?',
      mode: 'reflection',
      tags: ['#MentalModels', '#Growth'],
    },
  ],
  'Creative Brainstorming & Ideation': [
    {
      title: 'The 10x Inversion',
      prompt: 'If I had to achieve my 6-month goal in 2 weeks with zero budget, what radical unorthodox actions would I take?',
      mode: 'brainstorm',
      tags: ['#Brainstorming', '#Innovation'],
    },
    {
      title: 'Cross-Domain Remix',
      prompt: 'How would a jazz musician, an architect, or an emergency surgeon approach my current creative challenge?',
      mode: 'brainstorm',
      tags: ['#Creativity', '#LateralThinking'],
    },
    {
      title: 'Crazy 8s Speed Run',
      prompt: 'List 5 wildly different solutions to my biggest friction point right now, from the conservative to the absurd.',
      mode: 'brainstorm',
      tags: ['#ProblemSolving', '#Ideation'],
    },
  ],
  'Decision Clarity & Mental Models': [
    {
      title: 'The 10/10/10 Rule',
      prompt: 'How will I feel about this choice in 10 minutes, in 10 months, and in 10 years?',
      mode: 'decision',
      tags: ['#Decisions', '#Perspective'],
    },
    {
      title: 'Pre-Mortem Analysis',
      prompt: 'Assume we move forward and everything goes completely wrong in 6 months. What was the exact hidden point of failure?',
      mode: 'decision',
      tags: ['#RiskManagement', '#Strategy'],
    },
    {
      title: 'Reversibility Check (Type 1 vs Type 2)',
      prompt: 'Is this decision a one-way door (irreversible) or a two-way door (reversible)? What is the actual cost of reversing it?',
      mode: 'decision',
      tags: ['#DecisionFramework', '#Clarity'],
    },
  ],
  'Emotional Decompression & Freewriting': [
    {
      title: 'The Mental Clear-Out',
      prompt: 'Write continuously for 3 minutes without filtering, judging, or correcting grammar. What is your mind holding onto?',
      mode: 'freewrite',
      tags: ['#Freewrite', '#EmotionalHealth'],
    },
    {
      title: 'Letter to Future Self',
      prompt: 'What reassurance does your future self need to whisper to your present self right now?',
      mode: 'reflection',
      tags: ['#Mindfulness', '#Compassion'],
    },
  ],
};

export const PromptInspirationsModal: React.FC<PromptInspirationsModalProps> = ({
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Daily Introspection & Grounding');
  const [aiPrompts, setAiPrompts] = useState<
    Array<{ title: string; prompt: string; mode: JournalMode; suggestedTags: string[] }>
  >([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [moodInput, setMoodInput] = useState('Curious & Reflective');

  const handleGenerateAiPrompts = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetchInspirationalPrompts({
        category: selectedCategory,
        currentMood: moodInput,
      });
      setAiPrompts(response.prompts || []);
    } catch (err) {
      console.error('Failed to generate AI prompts:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const currentStaticPrompts = STATIC_CATEGORIES[selectedCategory] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#434338]/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#F9F9F6] border border-[#DEDECF] rounded-2xl max-w-3xl w-full p-6 shadow-2xl text-[#434338] relative my-8">
        <button
          id="btn-close-prompts-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#8A8A75] hover:text-[#2D2D24] hover:bg-[#EBEBE3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#EBEBE3] border border-[#DEDECF] text-[#84846D] flex items-center justify-center shadow-xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#2D2D24]">
              Prompt & Brainstorm Muse
            </h2>
            <p className="text-xs text-[#8A8A75]">
              Catalyze your thinking with proven introspective prompts or generate custom AI sparks.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-[#DEDECF] no-scrollbar text-xs">
          {Object.keys(STATIC_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setAiPrompts([]);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs font-medium ${
                selectedCategory === cat
                  ? 'bg-[#DEDECF] text-[#2D2D24] font-bold border border-[#D3D3C2]'
                  : 'text-[#8A8A75] hover:text-[#2D2D24] bg-[#EBEBE3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic AI Prompt Trigger Bar */}
        <div className="p-3.5 rounded-xl bg-[#EBEBE3] border border-[#DEDECF] mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <Sparkles className="w-4 h-4 text-[#84846D] shrink-0" />
            <span className="text-[#8A8A75]">Your Current State:</span>
            <input
              type="text"
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              placeholder="e.g. Anxious, Ambitious, Unfocused"
              className="bg-white border border-[#D3D3C2] rounded-lg px-2.5 py-1 text-[#434338] text-xs focus:outline-none focus:border-[#84846D] flex-1 sm:w-48 shadow-xs"
            />
          </div>

          <button
            id="btn-generate-ai-prompts"
            onClick={handleGenerateAiPrompts}
            disabled={isLoadingAi}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#84846D] hover:bg-[#6B6B58] text-white transition-colors disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Generating...' : 'Ask Gemini for Sparks'}</span>
          </button>
        </div>

        {/* Prompts Grid */}
        <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
          {/* If AI Prompts were generated, show them first */}
          {aiPrompts.length > 0 && (
            <div className="space-y-3 mb-4">
              <span className="text-xs font-bold text-[#2D2D24] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#84846D]" />
                <span>Freshly Generated Sparks:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiPrompts.map((p, idx) => (
                  <div
                    key={`ai-${idx}`}
                    className="p-4 rounded-xl bg-white border border-[#84846D]/40 hover:border-[#84846D] transition-colors text-left flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <h4 className="font-serif text-xs font-semibold text-[#2D2D24] mb-1.5">
                        {p.title}
                      </h4>
                      <p className="text-xs text-[#434338] leading-relaxed mb-3">
                        {p.prompt}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F5F5F0] flex items-center justify-between">
                      <div className="flex gap-1">
                        {p.suggestedTags?.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EBEBE3] text-[#434338] border border-[#DEDECF] font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          onSelectPrompt(p.title, p.prompt, p.mode);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#84846D] hover:text-[#6B6B58] transition-colors"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curated Evergreen Prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentStaticPrompts.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-[#DEDECF] hover:border-[#84846D] transition-colors text-left flex flex-col justify-between shadow-xs"
              >
                <div>
                  <h4 className="font-serif text-xs font-semibold text-[#2D2D24] mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#8A8A75] leading-relaxed mb-3">
                    {item.prompt}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#F5F5F0] flex items-center justify-between">
                  <div className="flex gap-1">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EBEBE3] text-[#434338] border border-[#DEDECF]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      onSelectPrompt(item.title, item.prompt, item.mode);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#84846D] hover:text-[#6B6B58] transition-colors"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
