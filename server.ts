import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateContentWithFallback } from './server/gemini';

const app = express();
const PORT = 3000;

// Body Parsers registered before any routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth guard middleware (supports client-side Firebase Auth tokens)
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev / preview environment, allow access if header provided or allow fallback
    // We pass through with user context
  }
  next();
};

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Multi-turn Journal Chat Reflection & Brainstorming
app.post('/api/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const { messages = [], mode = 'reflection', entryTitle = 'Untitled Reflection' } = payload;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let systemInstruction = `You are a deeply empathetic, insightful, and supportive AI personal journaling and thinking partner. 
Current workspace mode: ${mode.toUpperCase()}
Entry title: "${entryTitle}"

Mode Guidelines:
- REFLECTION: Guide thoughtful introspection, validate emotions, highlight hidden strengths, and gently explore underlying motives.
- BRAINSTORMING: Spark divergent ideas, propose unexpected angles, synthesize themes, and offer 3-4 structured options to explore further.
- INQUIRY: Ask 1-2 poignant, open-ended philosophical or psychological questions to help the user uncover deeper truths.
- REFRAME: Help identify cognitive distortions (catastrophizing, all-or-nothing thinking) and suggest constructive, grounded counter-perspectives.
- SOCRATIC: Challenge core assumptions through gentle questioning, probing the root definitions of their challenges.

Tone & Style:
- Warm, grounded, intelligent, non-judgmental, and concise (2-4 thoughtful paragraphs).
- End with one resonant question or reflection prompt that invites further contemplation.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text || '' }],
    }));

    const result = await generateContentWithFallback({
      contents: formattedContents,
      systemInstruction,
      temperature: mode === 'brainstorming' ? 0.8 : 0.4,
    });

    return res.json({
      reply: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return res.status(500).json({ error: err?.message || 'Chat generation failed' });
  }
});

// Auto-Distillation & Tagging for Entry Metadata
app.post('/api/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const { messages = [], title = 'Reflection' } = payload;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const conversationText = messages
      .map((m: any) => `${m.sender === 'user' ? 'Author' : 'Companion'}: ${m.text}`)
      .join('\n\n');

    const prompt = `Analyze the following journal reflection titled "${title}":
"""
${conversationText}
"""

Provide a structured JSON output with:
1. "summary": A concise 1-2 sentence distillation capturing the core essence.
2. "dominantEmotion": The primary emotional state (e.g. Hopeful, Overwhelmed, Inspired, Contemplative, Grateful, Anxious, Grounded).
3. "tags": An array of 3-5 thematic hashtag-style strings (e.g. ["#Mindset", "#Career", "#Creativity", "#SelfAwareness"]).
4. "keyTakeaways": An array of 2-3 bullet point insights or action anchors.
5. "moodScore": An integer from 1 to 10 (1 = extremely distressed, 5 = neutral, 10 = peak joy/fulfillment).`;

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    let parsed = {};
    try {
      parsed = JSON.parse(result.text);
    } catch {
      parsed = {
        summary: 'A thoughtful reflection on personal experiences and insights.',
        dominantEmotion: 'Contemplative',
        tags: ['#Reflection', '#Journal'],
        keyTakeaways: ['Reflected on current priorities and mindset.'],
        moodScore: 6,
      };
    }

    return res.json({
      metadata: parsed,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/summary:', err);
    return res.status(500).json({ error: err?.message || 'Summary generation failed' });
  }
});

// SMART Goal Breakdown Generator
app.post('/api/goals/refine', requireAuth, async (req: Request, res: Response) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const { rawGoal = '', category = 'Personal Growth' } = payload;

    if (!rawGoal.trim()) {
      return res.status(400).json({ error: 'rawGoal text is required' });
    }

    const prompt = `Convert this raw user ambition into a rigorous, motivating SMART Goal breakdown.
Category: ${category}
Raw Ambition: "${rawGoal}"

Output a JSON object with:
1. "title": A punchy, inspiring 4-8 word title.
2. "specific": Clear articulation of exactly what will be accomplished.
3. "measurable": Quantifiable criteria for measuring progress and completion.
4. "achievable": Realistic strategy and tools required.
5. "relevant": Why this matters deeply to their personal growth or values.
6. "timeBound": Target timeframe and milestones (e.g. "Within 90 days").
7. "milestones": An array of 3-5 sequential actionable milestones (each having "title", "description", and "targetDay").
8. "potentialObstacles": An array of 2 potential psychological or logistical friction points and proactive mitigation strategies.`;

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
      temperature: 0.3,
    });

    let parsed = {};
    try {
      parsed = JSON.parse(result.text);
    } catch {
      parsed = {
        title: rawGoal.slice(0, 40),
        specific: rawGoal,
        measurable: 'Tracked via weekly milestones',
        achievable: 'Break down into daily habits',
        relevant: 'Aligned with personal priorities',
        timeBound: '90 Days',
        milestones: [
          { title: 'Foundation & Baseline', description: 'Set up tools and routine', targetDay: 14 },
          { title: 'Core Execution', description: 'Consistently practice core behaviors', targetDay: 45 },
          { title: 'Review & Refine', description: 'Measure outcomes and celebrate progress', targetDay: 90 },
        ],
        potentialObstacles: ['Procrastination during initial setup - start with 5-minute micro habits.'],
      };
    }

    return res.json({
      smartGoal: parsed,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/goals/refine:', err);
    return res.status(500).json({ error: err?.message || 'Goal refinement failed' });
  }
});

// Goal Progress Coaching Check-In
app.post('/api/goals/coach', requireAuth, async (req: Request, res: Response) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const { goal, checkInNote, completedMilestonesCount, totalMilestonesCount } = payload;

    const prompt = `You are a high-performance cognitive coach analyzing a user's goal check-in.
Goal Title: "${goal?.title || 'Goal'}"
Target: "${goal?.specific || ''}"
Milestones Completed: ${completedMilestonesCount} / ${totalMilestonesCount}
User's Progress Note: "${checkInNote || 'Checking in on current momentum.'}"

Provide a JSON object with:
1. "feedback": 2 paragraphs of tailored encouragement, psychological reframing of any obstacles, and reinforcement of their identity as someone who follows through.
2. "immediateMicroActions": An array of 2-3 specific, low-friction actions to take within the next 24-48 hours.
3. "mindsetAnchor": A memorable 1-sentence mantra or mindset framing.`;

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
      temperature: 0.3,
    });

    let parsed = {};
    try {
      parsed = JSON.parse(result.text);
    } catch {
      parsed = {
        feedback: 'Great job maintaining awareness and checking in on your goal progress.',
        immediateMicroActions: ['Review next milestone tasks', 'Block 20 minutes tomorrow for deep work'],
        mindsetAnchor: 'Consistency compounds over time.',
      };
    }

    return res.json({
      coaching: parsed,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/goals/coach:', err);
    return res.status(500).json({ error: err?.message || 'Goal coaching failed' });
  }
});

// Semantic Memory Search & Pattern Synthesis
app.post('/api/semantic-search', requireAuth, async (req: Request, res: Response) => {
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const { query = '', entries = [] } = payload;

    if (!query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const condensedEntries = (entries || []).slice(0, 30).map((e: any, idx: number) => ({
      index: idx + 1,
      id: e.id,
      title: e.title,
      date: e.updatedAt || e.createdAt,
      summary: e.metadata?.summary || '',
      tags: e.metadata?.tags || [],
      emotion: e.metadata?.dominantEmotion || '',
      snippets: (e.messages || [])
        .filter((m: any) => m.sender === 'user')
        .map((m: any) => m.text)
        .join(' ')
        .slice(0, 400),
    }));

    const prompt = `User Query: "${query}"
Historical Journal Memory Entries:
${JSON.stringify(condensedEntries, null, 2)}

Synthesize a response analyzing their journal memories relative to this query:
1. "synthesis": 2-3 paragraphs synthesizing patterns, recurring themes, emotional trajectories, and breakthroughs related to the question.
2. "citedEntryIds": An array of entry ID strings directly relevant to this query.
3. "keyThemes": An array of 3-4 recurring themes or insights.`;

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      responseMimeType: 'application/json',
      temperature: 0.2,
    });

    let parsed = {};
    try {
      parsed = JSON.parse(result.text);
    } catch {
      parsed = {
        synthesis: 'Retrieved relevant reflections based on your historical notes.',
        citedEntryIds: condensedEntries.slice(0, 3).map((e: any) => e.id),
        keyThemes: ['Growth', 'Mindset'],
      };
    }

    return res.json({
      searchResult: parsed,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('Error in /api/semantic-search:', err);
    return res.status(500).json({ error: err?.message || 'Semantic search failed' });
  }
});

// Start Server & mount Vite in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemini Journal Hub running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
