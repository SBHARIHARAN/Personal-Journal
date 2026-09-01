import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Lock,
  Lightbulb,
  Tag,
  Smile,
  CheckCircle2,
  HelpCircle,
  Brain,
  Compass,
  RefreshCw,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import type { JournalEntry, JournalMode, ChatMessage, EntryMetadata } from '../types';
import { sendChatMessage, generateEntrySummary } from '../services/api';

interface JournalWorkspaceProps {
  entry: JournalEntry;
  onUpdateEntry: (updated: JournalEntry) => void;
  onOpenInspiration: () => void;
}

const MODE_CONFIGS: Record<
  JournalMode,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  reflection: {
    label: 'Deep Reflection',
    description: 'Empathetic introspection & self-awareness',
    icon: Compass,
  },
  brainstorming: {
    label: 'Brainstorming',
    description: 'Divergent thinking & creative exploration',
    icon: Lightbulb,
  },
  inquiry: {
    label: 'Structured Inquiry',
    description: 'Targeted psychological questions',
    icon: HelpCircle,
  },
  reframe: {
    label: 'Cognitive Reframe',
    description: 'Constructive perspective shifts',
    icon: Brain,
  },
  socratic: {
    label: 'Socratic Method',
    description: 'Probing core assumptions & roots',
    icon: Sliders,
  },
};

export const JournalWorkspace: React.FC<JournalWorkspaceProps> = ({
  entry,
  onUpdateEntry,
  onOpenInspiration,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.6-flash');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.messages, isGenerating]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  };

  // Send Message to Gemini AI
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...entry.messages, userMessage];
    const updatedEntry: JournalEntry = {
      ...entry,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    };

    onUpdateEntry(updatedEntry);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsGenerating(true);

    try {
      const response = await sendChatMessage({
        messages: updatedMessages,
        mode: entry.mode,
        entryTitle: entry.title,
      });

      setModelUsed(response.modelUsed);

      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const finalizedEntry: JournalEntry = {
        ...updatedEntry,
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      };

      onUpdateEntry(finalizedEntry);

      // Auto trigger summary update after a few turns
      if (finalMessages.length >= 2) {
        triggerAutoDistillation(finalizedEntry);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'system',
        text: `Error connecting to Gemini: ${err.message || 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      onUpdateEntry({
        ...updatedEntry,
        messages: [...updatedMessages, errorMessage],
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Add Private Note without sending to AI
  const handleAddPrivateNote = () => {
    if (!inputText.trim()) return;

    const privateMessage: ChatMessage = {
      id: `msg-priv-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isPrivateNote: true,
    };

    const updatedEntry: JournalEntry = {
      ...entry,
      messages: [...entry.messages, privateMessage],
      updatedAt: new Date().toISOString(),
    };

    onUpdateEntry(updatedEntry);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Distill and Summarize Entry with Gemini
  const triggerAutoDistillation = async (targetEntry = entry) => {
    if (targetEntry.messages.length === 0 || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const { metadata, modelUsed: summaryModel } = await generateEntrySummary({
        messages: targetEntry.messages,
        title: targetEntry.title,
      });

      setModelUsed(summaryModel);
      onUpdateEntry({
        ...targetEntry,
        metadata: {
          ...targetEntry.metadata,
          ...metadata,
          lastSummarizedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Auto distillation skipped:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const ModeIcon = MODE_CONFIGS[entry.mode]?.icon || Compass;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#F6F6F2]">
      {/* Workspace Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#DEDECF] bg-[#F6F6F2] flex flex-wrap items-center justify-between gap-3">
        {/* Title Input */}
        <div className="flex-1 min-w-[220px]">
          <input
            id="input-entry-title"
            type="text"
            value={entry.title}
            onChange={(e) =>
              onUpdateEntry({
                ...entry,
                title: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            placeholder="Untitled Reflection..."
            className="w-full text-base sm:text-lg font-serif-display font-semibold text-[#2D2D24] bg-transparent border-b border-transparent hover:border-[#D3D3C2] focus:border-[#84846D] focus:outline-none transition-colors"
          />
        </div>

        {/* Mode Selector & Distill Button */}
        <div className="flex items-center gap-2">
          {/* Mode Dropdown */}
          <div className="relative inline-block">
            <select
              id="select-journal-mode"
              value={entry.mode}
              onChange={(e) =>
                onUpdateEntry({
                  ...entry,
                  mode: e.target.value as JournalMode,
                  updatedAt: new Date().toISOString(),
                })
              }
              className="appearance-none bg-[#EBEBE3] border border-[#D3D3C2] text-[#434338] text-xs font-semibold pl-8 pr-7 py-1.5 rounded-xl cursor-pointer hover:bg-[#E2E2D6] transition-colors focus:outline-none focus:border-[#84846D]"
            >
              <option value="reflection">Compass • Reflection</option>
              <option value="brainstorming">Lightbulb • Brainstorming</option>
              <option value="inquiry">HelpCircle • Structured Inquiry</option>
              <option value="reframe">Brain • Cognitive Reframe</option>
              <option value="socratic">Sliders • Socratic Method</option>
            </select>
            <ModeIcon className="w-3.5 h-3.5 text-[#84846D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#8A8A75] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Distill Entry Button */}
          <button
            id="btn-distill-entry"
            onClick={() => triggerAutoDistillation()}
            disabled={isSummarizing || entry.messages.length === 0}
            className="px-2.5 py-1.5 bg-[#EBEBE3] hover:bg-[#E2E2D6] border border-[#D3D3C2] text-[#434338] rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-2xs"
            title="Extract core takeaways, dominant emotion, and tags"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#84846D] ${isSummarizing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSummarizing ? 'Distilling...' : 'Distill'}</span>
          </button>

          {/* Model Tag */}
          <span className="hidden md:inline-block text-[10px] font-mono text-[#8A8A75] bg-[#EBEBE3] px-2 py-0.5 rounded border border-[#DEDECF]">
            {modelUsed}
          </span>
        </div>
      </div>

      {/* Main Conversation & Insights Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Distilled Reflection Card */}
        {entry.metadata && (entry.metadata.summary || entry.metadata.dominantEmotion) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DEDECF] shadow-xs space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#F0F0EB] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#84846D]" />
                <h3 className="text-xs font-bold text-[#434338] uppercase tracking-wider">
                  Distilled Core Reflection
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {entry.metadata.dominantEmotion && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F5F0] text-[#5C5C4B] border border-[#DEDECF] flex items-center gap-1">
                    <Smile className="w-3 h-3 text-[#84846D]" />
                    <span>{entry.metadata.dominantEmotion}</span>
                  </span>
                )}

                {typeof entry.metadata.moodScore === 'number' && (
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBEBE3] text-[#434338] border border-[#D3D3C2]"
                    title="Mood Index (1 to 10)"
                  >
                    Mood: {entry.metadata.moodScore}/10
                  </span>
                )}
              </div>
            </div>

            {entry.metadata.summary && (
              <p className="text-xs sm:text-sm text-[#434338] leading-relaxed font-serif-display italic">
                "{entry.metadata.summary}"
              </p>
            )}

            {/* Key Takeaways & Action Anchors */}
            {entry.metadata.keyTakeaways && entry.metadata.keyTakeaways.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-[#8A8A75] uppercase tracking-wider">
                  Key Takeaways:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                  {entry.metadata.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#5C5C4B] bg-[#F9F9F6] p-2 rounded-lg border border-[#EBEBE3] flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#84846D] shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {entry.metadata.tags && entry.metadata.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {entry.metadata.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium text-[#6B6B58] bg-[#F5F5F0] px-2 py-0.5 rounded-md border border-[#E2E2D6]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State / Prompt Suggestions */}
        {entry.messages.length === 0 && (
          <div className="py-12 px-4 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto shadow-2xs border border-[#D3D3C2]">
              <ModeIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-display font-semibold text-lg text-[#2D2D24]">
                {MODE_CONFIGS[entry.mode]?.label}
              </h3>
              <p className="text-xs text-[#7A7A66] mt-1 leading-relaxed">
                {MODE_CONFIGS[entry.mode]?.description}. Write freely about your thoughts, breakthroughs, or challenges.
              </p>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() =>
                  handleSendMessage('What is consuming the majority of my mental energy right now, and why?')
                }
                className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#F2F2EC] border border-[#DEDECF] text-[#5C5C4B] transition-colors shadow-2xs"
              >
                "What is consuming my mental energy?"
              </button>
              <button
                onClick={() =>
                  handleSendMessage('If I had zero fear of failure or judgment, what would I do next?')
                }
                className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#F2F2EC] border border-[#DEDECF] text-[#5C5C4B] transition-colors shadow-2xs"
              >
                "If I had zero fear of failure..."
              </button>
              <button
                onClick={onOpenInspiration}
                className="text-xs px-3 py-1.5 rounded-full bg-[#EBEBE3] hover:bg-[#E2E2D6] border border-[#D3D3C2] text-[#434338] font-semibold transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3 text-[#84846D]" />
                <span>Browse Prompts Library</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {entry.messages.map((message) => {
          const isUser = message.sender === 'user';
          const isSystem = message.sender === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
                {message.text}
              </div>
            );
          }

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-white border border-[#DEDECF] p-4 text-[#2D2D24] shadow-xs space-y-1">
                  {message.isPrivateNote && (
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8A8A75]">
                      <Lock className="w-3 h-3" />
                      <span>Private Note (Not sent to AI)</span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </p>
                  <div className="text-[10px] text-[#A0A08B] text-right font-mono">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          }

          // AI Response Card
          return (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-tl-xs bg-[#EBEBE3] border border-[#D8D8C8] p-4 sm:p-5 text-[#2D2D24] shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B58] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#84846D]" />
                  <span>Gemini Companion</span>
                </div>
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-[#38382F]">
                  {message.text}
                </div>
                <div className="text-[10px] text-[#8A8A75] font-mono pt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Generating indicator */}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-xs bg-[#EBEBE3] border border-[#D8D8C8] p-4 text-xs text-[#6B6B58] flex items-center gap-2.5 shadow-2xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#84846D]" />
              <span>Contemplating and synthesizing reflection...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer Bar */}
      <div className="p-4 sm:p-6 border-t border-[#DEDECF] bg-[#EBEBE3]">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="relative rounded-2xl bg-white border border-[#D3D3C2] focus-within:border-[#84846D] focus-within:ring-1 focus-within:ring-[#84846D] shadow-sm p-2 flex flex-col">
            <textarea
              id="textarea-journal-input"
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Write your ${entry.mode} reflection or thoughts... (Press ⌘+Enter to reflect)`}
              className="w-full p-2 text-xs sm:text-sm text-[#2D2D24] placeholder-[#8A8A75] bg-transparent border-0 focus:outline-none resize-none min-h-[50px] max-h-[220px]"
            />

            <div className="flex items-center justify-between pt-2 px-2 border-t border-[#F5F5F0]">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  id="btn-add-private-note"
                  type="button"
                  onClick={handleAddPrivateNote}
                  disabled={!inputText.trim()}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-[#6B6B58] bg-[#F5F5F0] hover:bg-[#EBEBE3] hover:text-[#2D2D24] border border-[#DEDECF] transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-2xs"
                  title="Save as private thought without AI response"
                >
                  <Lock className="w-3 h-3 text-[#8A8A75]" />
                  <span>Private Note Only</span>
                </button>

                <button
                  id="btn-trigger-inspiration"
                  type="button"
                  onClick={onOpenInspiration}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-[#6B6B58] bg-[#F5F5F0] hover:bg-[#EBEBE3] hover:text-[#2D2D24] border border-[#DEDECF] transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Inspiration prompts"
                >
                  <Lightbulb className="w-3 h-3 text-[#84846D]" />
                  <span className="hidden sm:inline">Need Inspiration?</span>
                </button>
              </div>

              <button
                id="btn-send-journal-reflection"
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isGenerating}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#84846D] hover:bg-[#6B6B58] text-white transition-all disabled:opacity-40 shadow-xs flex items-center gap-1.5"
              >
                <span>Reflect</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8A8A75] px-1">
            <span>Mode: <strong className="text-[#5C5C4B] capitalize">{entry.mode}</strong></span>
            <span>Shortcut: <kbd className="font-mono bg-[#DCDCCF] px-1.5 py-0.5 rounded text-[#5C5C4B]">⌘+Enter</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};
