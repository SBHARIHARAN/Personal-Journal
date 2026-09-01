import React, { useState } from 'react';
import { X, Download, FileText, Database, Check } from 'lucide-react';
import type { JournalEntry, SmartGoal } from '../types';

interface ExportModalProps {
  entries: JournalEntry[];
  goals: SmartGoal[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  entries,
  goals,
  isOpen,
  onClose,
}) => {
  const [exportedType, setExportedType] = useState<'md' | 'json' | null>(null);

  if (!isOpen) return null;

  // Export as Markdown Bundle
  const handleExportMarkdown = () => {
    let mdContent = `# Personal Journal & SMART Goals Archive\n*Exported on: ${new Date().toLocaleString()}*\n\n---\n\n`;

    mdContent += `## 🎯 SMART Goals (${goals.length})\n\n`;
    goals.forEach((g, idx) => {
      mdContent += `### ${idx + 1}. ${g.title} [${g.status.toUpperCase()} - ${g.progress}%]\n`;
      mdContent += `- **Category:** ${g.category}\n`;
      mdContent += `- **Specific:** ${g.specific}\n`;
      mdContent += `- **Measurable:** ${g.measurable}\n`;
      mdContent += `- **Time-Bound:** ${g.timeBound}\n`;
      mdContent += `\n**Milestones:**\n`;
      g.milestones.forEach((m) => {
        mdContent += `  - [${m.completed ? 'x' : ' '}] ${m.title}\n`;
      });
      mdContent += `\n---\n\n`;
    });

    mdContent += `## 📖 Journal Reflections (${entries.length})\n\n`;
    entries.forEach((e, idx) => {
      mdContent += `### ${idx + 1}. ${e.title} (${e.mode.toUpperCase()})\n`;
      mdContent += `*Date: ${new Date(e.createdAt).toLocaleString()}*\n\n`;
      if (e.metadata?.summary) {
        mdContent += `> **Summary:** ${e.metadata.summary}\n`;
        mdContent += `> **Dominant Emotion:** ${e.metadata.dominantEmotion || 'N/A'} | **Mood:** ${e.metadata.moodScore || 'N/A'}/10\n\n`;
      }
      e.messages.forEach((m) => {
        mdContent += `**${m.sender === 'user' ? (m.isPrivateNote ? 'User (Private Note)' : 'User') : 'Gemini Companion'}:**\n${m.text}\n\n`;
      });
      mdContent += `---\n\n`;
    });

    downloadFile(mdContent, `journal-hub-export-${Date.now()}.md`, 'text/markdown');
    setExportedType('md');
  };

  // Export as Raw JSON Archive
  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      entries,
      goals,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, `journal-hub-archive-${Date.now()}.json`, 'application/json');
    setExportedType('json');
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F6F6F2] border border-[#DEDECF] rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#DEDECF] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#84846D] text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="font-serif-display font-bold text-lg text-[#2D2D24]">
              Data Portability & Export
            </h3>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8A75] hover:text-[#2D2D24]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#7A7A66] leading-relaxed">
          Own 100% of your thoughts and goals. Download an organized Markdown document or raw JSON archive at any time.
        </p>

        <div className="space-y-3">
          {/* Markdown Option */}
          <button
            id="btn-export-markdown"
            onClick={handleExportMarkdown}
            className="w-full p-4 rounded-2xl bg-white border border-[#DEDECF] hover:border-[#84846D] transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-[#F5F5F0] text-[#84846D] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D2D24] group-hover:text-[#84846D]">
                  Markdown Document (.md)
                </h4>
                <p className="text-[11px] text-[#7A7A66]">
                  Human-readable format for Obsidian, Notion, or printing
                </p>
              </div>
            </div>
            {exportedType === 'md' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-4 h-4 text-[#8A8A75]" />
            )}
          </button>

          {/* JSON Option */}
          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="w-full p-4 rounded-2xl bg-white border border-[#DEDECF] hover:border-[#84846D] transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-[#F5F5F0] text-[#84846D] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D2D24] group-hover:text-[#84846D]">
                  Full JSON Archive (.json)
                </h4>
                <p className="text-[11px] text-[#7A7A66]">
                  Machine-readable raw data for backup or programmatic migration
                </p>
              </div>
            </div>
            {exportedType === 'json' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-4 h-4 text-[#8A8A75]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
