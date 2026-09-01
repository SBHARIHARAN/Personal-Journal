import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { JournalWorkspace } from './components/JournalWorkspace';
import { GoalsModal } from './components/GoalsModal';
import { SemanticMemorySearchModal } from './components/SemanticMemorySearchModal';
import { ExportModal } from './components/ExportModal';
import { InspirationModal } from './components/InspirationModal';
import type { JournalEntry, SmartGoal, UserProfile, JournalMode } from './types';
import {
  fetchUserEntries,
  saveJournalEntry,
  deleteJournalEntry,
  fetchUserGoals,
} from './services/firestore';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
} from './services/firebase';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'journal' | 'goals'>('journal');

  // Modals
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false);

  // Track Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
        loadUserData(firebaseUser.uid);
      } else {
        // Automatically sign in anonymously or load local data
        try {
          const anon = await signInAnonymously(auth);
          setUser({
            uid: anon.user.uid,
            email: null,
            displayName: 'Guest Journaler',
            photoURL: null,
            isAnonymous: true,
          });
          loadUserData(anon.user.uid);
        } catch {
          setUser(null);
          loadUserData('');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    const loadedEntries = await fetchUserEntries(uid);
    const loadedGoals = await fetchUserGoals(uid);
    setEntries(loadedEntries);
    setGoals(loadedGoals);
    if (loadedEntries.length > 0) {
      setActiveEntryId(loadedEntries[0].id);
    }
  };

  // Keyboard shortcut for Semantic Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.warn('Google sign-in skipped or cancelled:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Create New Journal Entry
  const handleCreateNewEntry = (initialPrompt?: string, mode: JournalMode = 'reflection') => {
    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: initialPrompt ? initialPrompt.slice(0, 35) + '...' : 'New Reflection',
      mode,
      messages: initialPrompt
        ? [
            {
              id: `msg-${Date.now()}`,
              sender: 'user',
              text: initialPrompt,
              timestamp: now,
            },
          ]
        : [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setActiveEntryId(newEntry.id);
    setActiveView('journal');
    saveJournalEntry(user?.uid || '', newEntry);
  };

  // Update existing entry
  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    const updated = entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e));
    setEntries(updated);
    saveJournalEntry(user?.uid || '', updatedEntry);
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this reflection?')) {
      const updated = entries.filter((e) => e.id !== entryId);
      setEntries(updated);
      await deleteJournalEntry(user?.uid || '', entryId);
      if (activeEntryId === entryId) {
        setActiveEntryId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // Start Journal Entry linked to a Goal
  const handleStartJournalForGoal = (goal: SmartGoal) => {
    const prompt = `Reflecting on goal: "${goal.title}"\nTarget: ${goal.specific}\nCurrent Progress: ${goal.progress}%\n\nWhat are my current insights or roadblocks regarding this goal?`;
    handleCreateNewEntry(prompt, 'reflection');
  };

  // Active Entry
  const activeEntry = entries.find((e) => e.id === activeEntryId);

  return (
    <div className="min-h-screen bg-[#F6F6F2] flex flex-col selection:bg-[#84846D]/20 text-[#2D2D24]">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onNewEntry={() => handleCreateNewEntry()}
        onOpenGoals={() => setIsGoalsModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar for Journal Entries */}
        <Sidebar
          entries={entries}
          activeEntryId={activeEntryId}
          onSelectEntry={(id) => {
            setActiveEntryId(id);
            setActiveView('journal');
          }}
          onDeleteEntry={handleDeleteEntry}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Sidebar Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-2 bottom-4 z-20 p-2 rounded-xl bg-white/90 backdrop-blur-xs border border-[#DEDECF] text-[#6B6B58] hover:text-[#2D2D24] shadow-xs transition-colors"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Primary Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F6F6F2]">
          {activeEntry ? (
            <JournalWorkspace
              key={activeEntry.id}
              entry={activeEntry}
              onUpdateEntry={handleUpdateEntry}
              onOpenInspiration={() => setIsInspirationModalOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <h2 className="font-serif-display font-bold text-2xl text-[#2D2D24]">
                Begin Your First Reflection
              </h2>
              <p className="text-sm text-[#7A7A66] max-w-md">
                Capture thoughts, dissect decisions, or brainstorm freely with your empathetic Gemini companion.
              </p>
              <button
                onClick={() => handleCreateNewEntry()}
                className="px-5 py-2.5 rounded-2xl bg-[#84846D] hover:bg-[#6B6B58] text-white text-xs font-semibold shadow-xs transition-all"
              >
                Create New Reflection
              </button>
            </div>
          )}
        </main>
      </div>

      {/* SMART Goals Modal */}
      <GoalsModal
        userId={user?.uid || ''}
        goals={goals}
        onUpdateGoals={setGoals}
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        onStartJournalForGoal={handleStartJournalForGoal}
      />

      {/* Semantic Memory Search Modal */}
      <SemanticMemorySearchModal
        entries={entries}
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectEntry={(id) => {
          setActiveEntryId(id);
          setActiveView('journal');
        }}
      />

      {/* Export Data Modal */}
      <ExportModal
        entries={entries}
        goals={goals}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Journal Inspiration Library Modal */}
      <InspirationModal
        isOpen={isInspirationModalOpen}
        onClose={() => setIsInspirationModalOpen(false)}
        onSelectPrompt={(prompt, mode) => {
          handleCreateNewEntry(prompt, mode);
        }}
      />
    </div>
  );
}

export default App;
