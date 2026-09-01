import { auth } from './firebase';
import type { ChatMessage, JournalMode, EntryMetadata, SmartGoal, SemanticSearchResponse } from '../types';

async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Continue without token in offline/guest mode
  }
  return headers;
}

export async function sendChatMessage(params: {
  messages: ChatMessage[];
  mode: JournalMode;
  entryTitle: string;
}): Promise<{ reply: string; modelUsed: string }> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Chat request failed (${response.status})`);
  }

  return response.json();
}

export async function generateEntrySummary(params: {
  messages: ChatMessage[];
  title: string;
}): Promise<{ metadata: EntryMetadata; modelUsed: string }> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/summary', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Summary request failed (${response.status})`);
  }

  return response.json();
}

export async function refineSmartGoal(params: {
  rawGoal: string;
  category: string;
}): Promise<{ smartGoal: Partial<SmartGoal>; modelUsed: string }> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/goals/refine', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Goal refinement failed (${response.status})`);
  }

  return response.json();
}

export async function fetchGoalProgressFeedback(params: {
  goal: SmartGoal;
  checkInNote: string;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
}): Promise<{
  coaching: {
    feedback: string;
    immediateMicroActions: string[];
    mindsetAnchor: string;
  };
  modelUsed: string;
}> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/goals/coach', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Goal coaching failed (${response.status})`);
  }

  return response.json();
}

export async function querySemanticMemory(params: {
  query: string;
  entries: any[];
}): Promise<{ searchResult: SemanticSearchResponse; modelUsed: string }> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/semantic-search', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Semantic search failed (${response.status})`);
  }

  return response.json();
}
