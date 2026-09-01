export type JournalMode =
  | 'reflection'
  | 'brainstorming'
  | 'inquiry'
  | 'reframe'
  | 'socratic';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  isPrivateNote?: boolean;
}

export interface EntryMetadata {
  summary?: string;
  dominantEmotion?: string;
  tags?: string[];
  keyTakeaways?: string[];
  moodScore?: number;
  wordCount?: number;
  readingTimeMinutes?: number;
  lastSummarizedAt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  mode: JournalMode;
  messages: ChatMessage[];
  metadata?: EntryMetadata;
  createdAt: string;
  updatedAt: string;
  linkedGoalId?: string;
}

export type GoalCategory =
  | 'Personal Growth'
  | 'Career & Business'
  | 'Health & Wellness'
  | 'Creativity'
  | 'Relationships'
  | 'Finance';

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDay?: number;
  completed: boolean;
  completedAt?: string;
}

export interface CheckInRecord {
  id: string;
  date: string;
  note: string;
  completedMilestonesSnapshot: number;
  aiFeedback?: {
    feedback: string;
    immediateMicroActions: string[];
    mindsetAnchor?: string;
  };
}

export interface SmartGoal {
  id: string;
  title: string;
  category: GoalCategory;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  milestones: Milestone[];
  potentialObstacles?: string[];
  progress: number; // 0 to 100
  status: 'active' | 'completed' | 'paused';
  checkIns: CheckInRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface SemanticSearchResponse {
  synthesis: string;
  citedEntryIds: string[];
  keyThemes: string[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}
