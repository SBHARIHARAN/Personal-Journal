import React from 'react';
import {
  BookOpen,
  Target,
  Search,
  Download,
  Plus,
  Sparkles,
  User as UserIcon,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onNewEntry: () => void;
  onOpenGoals: () => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  activeView: 'journal' | 'goals';
  setActiveView: (v: 'journal' | 'goals') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onNewEntry,
  onOpenGoals,
  onOpenSearch,
  onOpenExport,
  onSignIn,
  onSignOut,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="h-16 border-b border-[#DEDECF] bg-[#F6F6F2] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('journal')}>
          <div className="w-9 h-9 rounded-xl bg-[#84846D] text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-display font-semibold text-lg text-[#2D2D24] tracking-tight">
                Gemini Hub
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EBEBE3] text-[#6B6B58] border border-[#D3D3C2]">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-[#7A7A66] hidden sm:block">Introspective Journal & SMART Goals</p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="hidden md:flex items-center bg-[#EAEAE0] p-1 rounded-xl border border-[#DEDECF] ml-2">
          <button
            id="nav-tab-journal"
            onClick={() => setActiveView('journal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'journal'
                ? 'bg-white text-[#2D2D24] shadow-xs'
                : 'text-[#6B6B58] hover:text-[#2D2D24]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journal</span>
          </button>
          <button
            id="nav-tab-goals"
            onClick={onOpenGoals}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'goals'
                ? 'bg-white text-[#2D2D24] shadow-xs'
                : 'text-[#6B6B58] hover:text-[#2D2D24]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>SMART Goals</span>
          </button>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Semantic Memory Search Button */}
        <button
          id="btn-nav-search-memories"
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#EBEBE3] hover:bg-[#E2E2D6] border border-[#D3D3C2] rounded-xl text-xs font-medium text-[#434338] transition-colors shadow-2xs"
          title="Search reflections (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#84846D]" />
          <span>Search Memories</span>
          <kbd className="text-[10px] bg-[#DCDCCF] px-1.5 py-0.5 rounded text-[#5C5C4B] font-mono">⌘K</kbd>
        </button>

        {/* Goals Trigger for Mobile */}
        <button
          id="btn-nav-goals-mobile"
          onClick={onOpenGoals}
          className="flex md:hidden p-2 rounded-xl border border-[#DEDECF] bg-[#EBEBE3] text-[#434338]"
          title="Goals"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Export Button */}
        <button
          id="btn-nav-export"
          onClick={onOpenExport}
          className="p-2 sm:px-3 sm:py-1.5 bg-[#EBEBE3] hover:bg-[#E2E2D6] border border-[#D3D3C2] rounded-xl text-xs font-medium text-[#434338] transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Export Markdown / JSON"
        >
          <Download className="w-3.5 h-3.5 text-[#84846D]" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* New Entry Button */}
        <button
          id="btn-nav-new-entry"
          onClick={onNewEntry}
          className="px-3 py-1.5 bg-[#84846D] hover:bg-[#6B6B58] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">New Reflection</span>
        </button>

        {/* User Auth Profile */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-[#DEDECF]">
            <div
              className="w-8 h-8 rounded-full bg-[#E2E2D6] border border-[#C5C5B0] text-[#5C5C4B] flex items-center justify-center text-xs font-bold"
              title={user.email || 'Authenticated User'}
            >
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : <ShieldCheck className="w-4 h-4 text-[#84846D]" />}
            </div>
            <button
              id="btn-signout"
              onClick={onSignOut}
              className="p-1.5 text-[#7A7A66] hover:text-[#2D2D24] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="btn-signin-google"
            onClick={onSignIn}
            className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-[#D3D3C2] bg-white hover:bg-[#EBEBE3] text-[#434338] transition-colors flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#84846D]" />
            <span className="hidden sm:inline">Guest Mode</span>
          </button>
        )}
      </div>
    </header>
  );
};
