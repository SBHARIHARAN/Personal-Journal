import React, { useState } from 'react';
import {
  X,
  Target,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  TrendingUp,
  Clock,
  BookOpen,
  Trash2,
  MessageSquare,
  AlertCircle,
  Award,
} from 'lucide-react';
import type { SmartGoal, GoalCategory, Milestone, CheckInRecord } from '../types';
import { refineSmartGoal, fetchGoalProgressFeedback } from '../services/api';
import { saveGoal, deleteGoal } from '../services/firestore';

interface GoalsModalProps {
  userId: string;
  goals: SmartGoal[];
  onUpdateGoals: (updated: SmartGoal[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onStartJournalForGoal: (goal: SmartGoal) => void;
}

const CATEGORIES: GoalCategory[] = [
  'Personal Growth',
  'Career & Business',
  'Health & Wellness',
  'Creativity',
  'Relationships',
  'Finance',
];

export const GoalsModal: React.FC<GoalsModalProps> = ({
  userId,
  goals,
  onUpdateGoals,
  isOpen,
  onClose,
  onStartJournalForGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create'>('dashboard');

  // Creation State
  const [rawGoalInput, setRawGoalInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('Personal Growth');
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [refinedGoalData, setRefinedGoalData] = useState<Partial<SmartGoal> | null>(null);

  // Check-In Coaching State
  const [checkInGoal, setCheckInGoal] = useState<SmartGoal | null>(null);
  const [checkInNote, setCheckInNote] = useState('');
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  if (!isOpen) return null;

  // Handle AI Goal Transformation
  const handleRefineGoal = async () => {
    if (!rawGoalInput.trim() || isAiRefining) return;
    setIsAiRefining(true);
    try {
      const response = await refineSmartGoal({
        rawGoal: rawGoalInput.trim(),
        category: selectedCategory,
      });
      setRefinedGoalData(response.smartGoal);
    } catch (err: any) {
      console.error('Goal refinement failed:', err);
      alert(`Could not refine goal: ${err.message || 'Please check your connection.'}`);
    } finally {
      setIsAiRefining(false);
    }
  };

  // Save the refined or custom SMART goal
  const handleSaveGoal = async () => {
    if (!refinedGoalData?.title) return;

    const milestones: Milestone[] = (refinedGoalData.milestones || []).map((m: any, idx: number) => ({
      id: `ms-${Date.now()}-${idx}`,
      title: typeof m === 'string' ? m : m.title,
      description: m.description || '',
      targetDay: m.targetDay || (idx + 1) * 15,
      completed: false,
    }));

    const newGoal: SmartGoal = {
      id: `goal-${Date.now()}`,
      title: refinedGoalData.title || rawGoalInput.slice(0, 30),
      category: selectedCategory,
      specific: refinedGoalData.specific || '',
      measurable: refinedGoalData.measurable || '',
      achievable: refinedGoalData.achievable || '',
      relevant: refinedGoalData.relevant || '',
      timeBound: refinedGoalData.timeBound || '90 Days',
      milestones,
      potentialObstacles: refinedGoalData.potentialObstacles || [],
      progress: 0,
      status: 'active',
      checkIns: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveGoal(userId, newGoal);
    onUpdateGoals([newGoal, ...goals]);

    // Reset Creation State
    setRawGoalInput('');
    setRefinedGoalData(null);
    setActiveTab('dashboard');
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (goal: SmartGoal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined } : m
    );

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);
    const status = progress === 100 ? 'completed' : 'active';

    const updatedGoal: SmartGoal = {
      ...goal,
      milestones: updatedMilestones,
      progress,
      status,
      updatedAt: new Date().toISOString(),
    };

    await saveGoal(userId, updatedGoal);
    onUpdateGoals(goals.map((g) => (g.id === goal.id ? updatedGoal : g)));
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this SMART goal?')) {
      await deleteGoal(userId, goalId);
      onUpdateGoals(goals.filter((g) => g.id !== goalId));
    }
  };

  // Submit Weekly Check-In & Get AI Coaching
  const handleSubmitCheckIn = async () => {
    if (!checkInGoal || !checkInNote.trim() || isSubmittingCheckIn) return;
    setIsSubmittingCheckIn(true);

    try {
      const completedCount = checkInGoal.milestones.filter((m) => m.completed).length;
      const response = await fetchGoalProgressFeedback({
        goal: checkInGoal,
        checkInNote: checkInNote.trim(),
        completedMilestonesCount: completedCount,
        totalMilestonesCount: checkInGoal.milestones.length,
      });

      const newCheckIn: CheckInRecord = {
        id: `ci-${Date.now()}`,
        date: new Date().toISOString(),
        note: checkInNote.trim(),
        completedMilestonesSnapshot: completedCount,
        aiFeedback: response.coaching,
      };

      const updatedGoal: SmartGoal = {
        ...checkInGoal,
        checkIns: [newCheckIn, ...(checkInGoal.checkIns || [])],
        updatedAt: new Date().toISOString(),
      };

      await saveGoal(userId, updatedGoal);
      onUpdateGoals(goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
      setCheckInGoal(updatedGoal);
      setCheckInNote('');
    } catch (err: any) {
      console.error('Check in error:', err);
      alert(`Could not process check-in: ${err.message || 'Error occurred.'}`);
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#F6F6F2] border border-[#DEDECF] rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#DEDECF] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#84846D] text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-lg sm:text-xl text-[#2D2D24]">
                SMART Goals & Coaching Hub
              </h2>
              <p className="text-xs text-[#7A7A66]">
                Transform fuzzy ambitions into measurable execution plans with Gemini coaching.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#EBEBE3] p-1 rounded-xl border border-[#DEDECF]">
              <button
                id="tab-goals-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-[#2D2D24] shadow-xs'
                    : 'text-[#6B6B58] hover:text-[#2D2D24]'
                }`}
              >
                Active Goals ({goals.length})
              </button>
              <button
                id="tab-goals-create"
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeTab === 'create'
                    ? 'bg-white text-[#2D2D24] shadow-xs'
                    : 'text-[#6B6B58] hover:text-[#2D2D24]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New SMART Goal</span>
              </button>
            </div>

            <button
              id="btn-close-goals-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-[#8A8A75] hover:text-[#2D2D24] hover:bg-[#EBEBE3] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'create' ? (
            /* Creation Tab */
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white p-5 rounded-2xl border border-[#DEDECF] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#84846D]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#434338]">
                    AI Goal Architect
                  </h3>
                </div>

                <p className="text-xs text-[#7A7A66] leading-relaxed">
                  Enter your raw dream or intention in plain English. Gemini will automatically structure it into Specific, Measurable, Achievable, Relevant, and Time-bound milestones.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#434338] mb-1">
                      Target Ambition:
                    </label>
                    <textarea
                      id="input-raw-goal"
                      rows={3}
                      value={rawGoalInput}
                      onChange={(e) => setRawGoalInput(e.target.value)}
                      placeholder="e.g. I want to launch my newsletter, write consistently twice a week, and build my first 500 subscribers."
                      className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[#FBFBFA] border border-[#D3D3C2] text-[#2D2D24] placeholder-[#A0A08B] focus:outline-none focus:border-[#84846D]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#8A8A75] font-medium">Category:</span>
                      <select
                        id="select-goal-category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as GoalCategory)}
                        className="px-2.5 py-1 rounded-lg bg-[#F5F5F0] border border-[#D3D3C2] text-xs font-semibold text-[#434338] focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      id="btn-refine-smart-goal"
                      onClick={handleRefineGoal}
                      disabled={!rawGoalInput.trim() || isAiRefining}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#84846D] hover:bg-[#6B6B58] text-white transition-all disabled:opacity-40 shadow-xs flex items-center gap-1.5"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isAiRefining ? 'animate-spin' : ''}`} />
                      <span>{isAiRefining ? 'Architecting Plan...' : '✨ Transform into SMART Plan'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Refined Plan Preview */}
              {refinedGoalData && (
                <div className="bg-white p-5 rounded-2xl border border-[#84846D] shadow-md space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#F0F0EB] pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#84846D] tracking-wider">
                        Generated Blueprint
                      </span>
                      <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#2D2D24]">
                        {refinedGoalData.title}
                      </h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#EBEBE3] text-[#5C5C4B] font-semibold">
                      {selectedCategory}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#EBEBE3]">
                      <strong className="text-[#84846D] block mb-1">Specific:</strong>
                      <p className="text-[#434338] leading-relaxed">{refinedGoalData.specific}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#EBEBE3]">
                      <strong className="text-[#84846D] block mb-1">Measurable:</strong>
                      <p className="text-[#434338] leading-relaxed">{refinedGoalData.measurable}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#EBEBE3]">
                      <strong className="text-[#84846D] block mb-1">Achievable:</strong>
                      <p className="text-[#434338] leading-relaxed">{refinedGoalData.achievable}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#EBEBE3]">
                      <strong className="text-[#84846D] block mb-1">Time-Bound:</strong>
                      <p className="text-[#434338] leading-relaxed">{refinedGoalData.timeBound}</p>
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  {refinedGoalData.milestones && (
                    <div className="space-y-2 pt-2">
                      <strong className="text-xs text-[#434338] block font-semibold">
                        Planned Milestones:
                      </strong>
                      <div className="space-y-1.5">
                        {refinedGoalData.milestones.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[#F5F5F0] border border-[#E5E5DA] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Circle className="w-3.5 h-3.5 text-[#84846D]" />
                              <span className="font-medium text-[#2D2D24]">
                                {typeof m === 'string' ? m : m.title}
                              </span>
                            </div>
                            {m.targetDay && (
                              <span className="text-[10px] text-[#8A8A75] font-mono">
                                Target: Day {m.targetDay}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F0EB]">
                    <button
                      onClick={() => setRefinedGoalData(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl text-[#6B6B58] hover:bg-[#EBEBE3]"
                    >
                      Discard
                    </button>
                    <button
                      id="btn-confirm-save-goal"
                      onClick={handleSaveGoal}
                      className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#84846D] hover:bg-[#6B6B58] text-white shadow-xs"
                    >
                      Save to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Dashboard Tab */
            <div className="space-y-6">
              {goals.length === 0 ? (
                <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mx-auto shadow-2xs border border-[#D3D3C2]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif-display font-semibold text-base text-[#2D2D24]">
                      No Goals Tracked Yet
                    </h3>
                    <p className="text-xs text-[#7A7A66] mt-1">
                      Set your first SMART goal to get structured milestones and intelligent weekly check-in coaching.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#84846D] hover:bg-[#6B6B58] text-white shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create My First Goal</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-white p-5 rounded-2xl border border-[#DEDECF] shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#84846D]">
                              {goal.category}
                            </span>
                            <h4 className="font-serif-display font-bold text-sm sm:text-base text-[#2D2D24]">
                              {goal.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-[#A0A08B] hover:text-rose-600 p-1 transition-colors"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-medium text-[#5C5C4B]">
                            <span>Progress</span>
                            <span className="font-mono font-bold">{goal.progress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#EBEBE3] overflow-hidden">
                            <div
                              className="h-full bg-[#84846D] transition-all duration-300 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Milestones Checklist */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A75]">
                            Milestones ({goal.milestones.filter((m) => m.completed).length}/
                            {goal.milestones.length})
                          </span>
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                            {goal.milestones.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => handleToggleMilestone(goal, m.id)}
                                className={`w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 transition-colors border ${
                                  m.completed
                                    ? 'bg-[#F5F5F0] border-transparent text-[#8A8A75] line-through'
                                    : 'bg-[#FBFBFA] border-[#EBEBE3] text-[#2D2D24] hover:bg-[#F5F5F0]'
                                }`}
                              >
                                {m.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#84846D] shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-[#C5C5B0] shrink-0" />
                                )}
                                <span className="line-clamp-1">{m.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Goal Card Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#F0F0EB]">
                        <button
                          onClick={() => setCheckInGoal(goal)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#EBEBE3] hover:bg-[#E2E2D6] text-[#434338] transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#84846D]" />
                          <span>Check-In & Coach</span>
                        </button>

                        <button
                          onClick={() => {
                            onStartJournalForGoal(goal);
                            onClose();
                          }}
                          className="text-xs text-[#84846D] hover:text-[#6B6B58] font-semibold flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Reflect in Journal</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Check-In Modal Overlay */}
        {checkInGoal && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#F6F6F2] border border-[#DEDECF] rounded-3xl w-full max-w-xl max-h-[85vh] shadow-2xl p-6 flex flex-col overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-[#DEDECF] pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#84846D]">
                    Goal Progress Check-In
                  </span>
                  <h3 className="font-serif-display font-bold text-base text-[#2D2D24]">
                    {checkInGoal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setCheckInGoal(null)}
                  className="p-1.5 rounded-lg text-[#8A8A75] hover:text-[#2D2D24]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                <p className="text-xs text-[#7A7A66]">
                  Share your recent wins, friction points, or momentum. Gemini will provide targeted cognitive reframing and micro-actions.
                </p>

                <textarea
                  id="input-checkin-note"
                  rows={3}
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  placeholder="e.g. Finished milestone 1, but feeling a bit overwhelmed by the technical setup..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl bg-white border border-[#D3D3C2] text-[#2D2D24] placeholder-[#A0A08B] focus:outline-none focus:border-[#84846D]"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      onStartJournalForGoal(checkInGoal);
                      onClose();
                    }}
                    className="text-xs text-[#84846D] hover:text-[#6B6B58] font-semibold flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Or full journal reflection</span>
                  </button>

                  <button
                    id="btn-submit-checkin-ai"
                    onClick={handleSubmitCheckIn}
                    disabled={!checkInNote.trim() || isSubmittingCheckIn}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#84846D] hover:bg-[#6B6B58] text-white transition-all disabled:opacity-40 shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSubmittingCheckIn ? 'animate-spin' : ''}`} />
                    <span>{isSubmittingCheckIn ? 'Coaching...' : 'Submit to AI Coach'}</span>
                  </button>
                </div>

                {/* Past Check-In Feedback History */}
                {checkInGoal.checkIns && checkInGoal.checkIns.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#DEDECF]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A75]">
                      Recent Coaching Insights ({checkInGoal.checkIns.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {checkInGoal.checkIns.map((ci) => (
                        <div
                          key={ci.id}
                          className="p-3 rounded-xl bg-white border border-[#E5E5DA] text-xs space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#8A8A75]">
                            <span>{new Date(ci.date).toLocaleDateString()}</span>
                            <span>Milestones: {ci.completedMilestonesSnapshot}</span>
                          </div>
                          <p className="text-[#5C5C4B] italic">"{ci.note}"</p>
                          {ci.aiFeedback && (
                            <div className="p-2.5 rounded-lg bg-[#F5F5F0] border border-[#EBEBE3] space-y-1.5">
                              <p className="text-[#38382F] leading-relaxed">{ci.aiFeedback.feedback}</p>
                              {ci.aiFeedback.mindsetAnchor && (
                                <div className="text-[11px] font-semibold text-[#84846D]">
                                  🎯 {ci.aiFeedback.mindsetAnchor}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
