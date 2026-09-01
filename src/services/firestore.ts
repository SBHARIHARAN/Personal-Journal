import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { JournalEntry, SmartGoal } from '../types';

const sanitizePayload = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
};

// Entries CRUD
export async function fetchUserEntries(userId: string): Promise<JournalEntry[]> {
  try {
    if (!userId) return getLocalEntries();
    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return getLocalEntries();
    }

    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      entries.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });

    // Sync to local cache
    saveLocalEntries(entries);
    return entries;
  } catch (err) {
    console.warn('Firestore fetch error, falling back to local storage:', err);
    return getLocalEntries();
  }
}

export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  const sanitized = sanitizePayload(entry);

  // Update local cache immediately
  const current = getLocalEntries();
  const index = current.findIndex((e) => e.id === entry.id);
  if (index >= 0) {
    current[index] = sanitized;
  } else {
    current.unshift(sanitized);
  }
  saveLocalEntries(current);

  // Persist to Firestore if user is authenticated
  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'entries', entry.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err) {
      console.error('Firestore save entry error:', err);
    }
  }
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  const current = getLocalEntries().filter((e) => e.id !== entryId);
  saveLocalEntries(current);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'entries', entryId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore delete entry error:', err);
    }
  }
}

// Goals CRUD
export async function fetchUserGoals(userId: string): Promise<SmartGoal[]> {
  try {
    if (!userId) return getLocalGoals();
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return getLocalGoals();
    }

    const goals: SmartGoal[] = [];
    snapshot.forEach((docSnap) => {
      goals.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });

    saveLocalGoals(goals);
    return goals;
  } catch (err) {
    console.warn('Firestore fetch goals error, falling back to local storage:', err);
    return getLocalGoals();
  }
}

export async function saveGoal(userId: string, goal: SmartGoal): Promise<void> {
  const sanitized = sanitizePayload(goal);
  const current = getLocalGoals();
  const index = current.findIndex((g) => g.id === goal.id);
  if (index >= 0) {
    current[index] = sanitized;
  } else {
    current.unshift(sanitized);
  }
  saveLocalGoals(current);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'goals', goal.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err) {
      console.error('Firestore save goal error:', err);
    }
  }
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  const current = getLocalGoals().filter((g) => g.id !== goalId);
  saveLocalGoals(current);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'goals', goalId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore delete goal error:', err);
    }
  }
}

// Local Storage Helpers
function getLocalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem('gemini_journal_entries');
    if (!raw) return getSampleInitialEntries();
    return JSON.parse(raw);
  } catch {
    return getSampleInitialEntries();
  }
}

function saveLocalEntries(entries: JournalEntry[]) {
  try {
    localStorage.setItem('gemini_journal_entries', JSON.stringify(entries));
  } catch (e) {
    console.warn('Failed to write to localStorage', e);
  }
}

function getLocalGoals(): SmartGoal[] {
  try {
    const raw = localStorage.getItem('gemini_journal_goals');
    if (!raw) return getSampleInitialGoals();
    return JSON.parse(raw);
  } catch {
    return getSampleInitialGoals();
  }
}

function saveLocalGoals(goals: SmartGoal[]) {
  try {
    localStorage.setItem('gemini_journal_goals', JSON.stringify(goals));
  } catch (e) {
    console.warn('Failed to write to localStorage', e);
  }
}

function getSampleInitialEntries(): JournalEntry[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'entry-welcome-1',
      title: 'First Thought & Reflection on Growth',
      mode: 'reflection',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'I want to build more consistency in my creative work and stop overthinking every draft before sharing it.',
          timestamp: now,
        },
        {
          id: 'm2',
          sender: 'ai',
          text: 'Overthinking often disguises itself as high standards, but it is frequently perfectionism trying to protect us from vulnerability. What would happen if you treated your next three drafts as playful experiments rather than finished statements?',
          timestamp: now,
        },
      ],
      metadata: {
        summary: 'Examining perfectionism and overthinking in creative work, exploring low-pressure iterative drafts.',
        dominantEmotion: 'Inspired',
        tags: ['#Creativity', '#Mindset', '#Growth'],
        keyTakeaways: [
          'Reframe perfectionism into playful experimentation.',
          'Lower initial friction to build publishing momentum.',
        ],
        moodScore: 8,
      },
    },
  ];
}

function getSampleInitialGoals(): SmartGoal[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'goal-welcome-1',
      title: 'Daily 20-Minute Deep Work Routine',
      category: 'Personal Growth',
      specific: 'Establish a focused, uninterrupted 20-minute daily morning writing and reflection habit.',
      measurable: 'Tracked via 5 weekly check-ins and completed milestone checklist.',
      achievable: 'Pair with morning coffee before checking phone or email notifications.',
      relevant: 'Deepens clarity, strengthens cognitive focus, and reduces daily reactivity.',
      timeBound: '30 Days',
      progress: 40,
      status: 'active',
      milestones: [
        { id: 'ms1', title: 'Prepare quiet writing space and notebook', completed: true },
        { id: 'ms2', title: 'Complete first 7 consecutive days of 20-minute blocks', completed: true },
        { id: 'ms3', title: 'Conduct weekly retrospective analysis of insights gained', completed: false },
        { id: 'ms4', title: 'Reach full 30-day streak with zero phone distractions', completed: false },
      ],
      checkIns: [
        {
          id: 'ci1',
          date: now,
          note: 'Completed first week with great focus. Morning block felt natural.',
          completedMilestonesSnapshot: 2,
          aiFeedback: {
            feedback: 'Terrific execution in establishing the early baseline. Protecting this morning boundary builds profound self-trust.',
            immediateMicroActions: ['Keep phone in another room overnight', 'Write out tomorrow’s topic tonight'],
            mindsetAnchor: 'Action precedes motivation.',
          },
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
