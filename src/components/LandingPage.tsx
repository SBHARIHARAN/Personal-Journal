import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Tag,
  Brain,
  ArrowRight,
  Lock,
  Compass,
  Layers,
  FileText,
  Lightbulb,
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  isLoading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'reflection' | 'brainstorm' | 'memory'>('reflection');

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-[#434338] flex flex-col justify-between selection:bg-[#DEDECF] selection:text-[#2D2D24]">
      {/* Top Banner */}
      <div className="border-b border-[#DEDECF] bg-[#EBEBE3] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5F5F0] border border-[#DEDECF] flex items-center justify-center text-[#84846D] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold tracking-tight text-[#2D2D24]">
                Gemini Journal & Brainstorming Hub
              </span>
            </div>
          </div>

          <button
            id="btn-landing-top-signin"
            onClick={onSignIn}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#84846D] hover:bg-[#6B6B58] text-white transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBEBE3] border border-[#DEDECF] text-[#434338] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#84846D]" />
              <span>Multi-Tenant Firestore & Gemini 3.6 Flash</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#2D2D24] leading-[1.15]">
              A private mind space to <span className="italic text-[#84846D] font-normal">reflect</span>, brainstorm, and evolve.
            </h1>

            <p className="text-[#434338] text-base sm:text-lg max-w-2xl leading-relaxed font-light">
              Transform fleeting thoughts into permanent clarity. Converse with Gemini 3.6 Flash as a compassionate sounding board, automatically extract emotional themes, and query your historical memories with semantic retrospectives.
            </p>

            {error && (
              <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] text-xs">
                {error}
              </div>
            )}

            {/* Primary Sign-In Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                id="btn-hero-google-signin"
                onClick={onSignIn}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold rounded-xl bg-[#84846D] hover:bg-[#6B6B58] text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-[#8A8A75]">
                <ShieldCheck className="w-4 h-4 text-[#84846D]" />
                <span>Isolated Security (`users/{'{userId}'}`)</span>
              </div>
            </div>
          </div>

          {/* Interactive Feature Demo Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#DEDECF] rounded-2xl p-6 shadow-xl relative overflow-hidden text-[#434338]">
              <div className="flex items-center justify-between border-b border-[#DEDECF] pb-4 mb-4">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveTab('reflection')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors font-medium ${
                      activeTab === 'reflection'
                        ? 'bg-[#DEDECF] text-[#2D2D24]'
                        : 'text-[#8A8A75] hover:text-[#434338]'
                    }`}
                  >
                    Deep Reflection
                  </button>
                  <button
                    onClick={() => setActiveTab('brainstorm')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors font-medium ${
                      activeTab === 'brainstorm'
                        ? 'bg-[#DEDECF] text-[#2D2D24]'
                        : 'text-[#8A8A75] hover:text-[#434338]'
                    }`}
                  >
                    Brainstorming
                  </button>
                  <button
                    onClick={() => setActiveTab('memory')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors font-medium ${
                      activeTab === 'memory'
                        ? 'bg-[#DEDECF] text-[#2D2D24]'
                        : 'text-[#8A8A75] hover:text-[#434338]'
                    }`}
                  >
                    Semantic Search
                  </button>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A75]">LIVE PREVIEW</span>
              </div>

              {activeTab === 'reflection' && (
                <div className="space-y-3.5 text-xs text-left">
                  <div className="bg-[#F5F5F0] border border-[#DEDECF] p-3.5 rounded-xl text-[#434338]">
                    <p className="font-semibold text-[#2D2D24] mb-1">You wrote:</p>
                    <p className="italic text-[#8A8A75]">
                      "I feel torn between polishing current project features or starting the new prototype. I feel a bit overwhelmed by the backlog."
                    </p>
                  </div>

                  <div className="bg-[#EBEBE3] border border-[#DEDECF] p-3.5 rounded-xl text-[#2D2D24]">
                    <div className="flex items-center gap-1.5 text-[#84846D] font-semibold mb-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini 3.6 Flash</span>
                    </div>
                    <p className="leading-relaxed text-[#434338]">
                      "Notice the tension here between the comfort of incremental refinement and the creative risk of new creation. If you applied the <strong>80/20 rule</strong>, which single feature would unlock 80% of the value before prototyping?"
                    </p>
                  </div>

                  <div className="bg-[#F5F5F0] border border-[#DEDECF] p-3 rounded-xl">
                    <div className="text-[11px] font-semibold text-[#434338] mb-1.5 flex items-center justify-between">
                      <span>Automated Distillation</span>
                      <span className="text-[#84846D] font-bold text-[10px]">#Reflective</span>
                    </div>
                    <p className="text-[#434338] text-[11px] mb-2">
                      "Struggling with prioritization between refinement and exploration; seeking focus framework."
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#DEDECF] text-[#434338] text-[10px] font-bold">#WorkStress</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#DEDECF] text-[#434338] text-[10px] font-bold">#Prioritization</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#DEDECF] text-[#434338] text-[10px] font-bold">#Clarity</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'brainstorm' && (
                <div className="space-y-3 text-xs text-left">
                  <div className="bg-[#F5F5F0] border border-[#DEDECF] p-3.5 rounded-xl text-[#434338]">
                    <p className="font-semibold text-[#2D2D24] mb-1">Brainstorming Prompt:</p>
                    <p className="italic text-[#8A8A75]">
                      "How can we gamify reading classical literature for teenagers?"
                    </p>
                  </div>

                  <div className="bg-[#EBEBE3] border border-[#DEDECF] p-3.5 rounded-xl text-[#2D2D24]">
                    <div className="flex items-center gap-1.5 text-[#84846D] font-semibold mb-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Creative Sparks Generated</span>
                    </div>
                    <ul className="space-y-1.5 list-disc list-inside text-[#434338]">
                      <li><strong>Detective Logs:</strong> Frame Shakespearean tragedies as unsolved crime dossiers.</li>
                      <li><strong>Choose-Your-Path Epilogues:</strong> Prompt alternate endings scored by character integrity.</li>
                      <li><strong>Character Battle Arena:</strong> Cross-novel moral debates judged by peer consensus.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="space-y-3 text-xs text-left">
                  <div className="bg-[#F5F5F0] border border-[#DEDECF] p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-[#434338] mb-1 text-[11px]">
                      <Search className="w-3 h-3 text-[#84846D]" />
                      <span>Query: "When was the last time I felt overwhelmed at work?"</span>
                    </div>
                  </div>

                  <div className="bg-[#EBEBE3] border border-[#DEDECF] p-3.5 rounded-xl text-[#434338] space-y-2">
                    <p className="text-[#434338] leading-relaxed">
                      "Across 3 entries in July and August, your primary trigger was <strong>context switching between meetings and deep work</strong>. In the Aug 14 reflection, setting a 2-hour morning focus block reduced your self-reported stress from 8/10 to 4/10."
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[10px] text-[#434338] bg-[#DEDECF] px-2 py-0.5 rounded-full font-semibold">
                        Cited: "Aug 14, 2026 – Morning Timeblocking"
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-[#DEDECF] hover:border-[#84846D] transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D2D24] mb-2">
              Multi-Turn Socratic AI
            </h3>
            <p className="text-[#8A8A75] text-xs leading-relaxed font-light">
              Powered by Gemini 3.6 Flash. Engage in rich multi-turn dialogues with customized modes: Deep Reflection, Creative Brainstorming, Decision Matrices, or Freewriting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DEDECF] hover:border-[#84846D] transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mb-4">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D2D24] mb-2">
              Automated Distillation & Tags
            </h3>
            <p className="text-[#8A8A75] text-xs leading-relaxed font-light">
              Every reflection generates a 1-2 sentence core summary, emotion classifications, and searchable thematic tags (#Gratitude, #WorkStress, #Brainstorming).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#DEDECF] hover:border-[#84846D] transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#EBEBE3] text-[#84846D] flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D2D24] mb-2">
              Multi-Tenant Cloud Security
            </h3>
            <p className="text-[#8A8A75] text-xs leading-relaxed font-light">
              Enforced document isolation under <code className="text-[#434338] font-bold text-[10px] bg-[#EBEBE3] px-1 py-0.5 rounded">users/{'{userId}'}</code> with Firestore rules. Zero shared storage or unauthorized cross-user reads.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DEDECF] py-6 px-4 text-center text-xs text-[#8A8A75]">
        <p>
          Personal Gemini Journal & Brainstorming Hub • Built with Gemini 3.6 Flash, Cloud Firestore & Firebase Auth
        </p>
      </footer>
    </div>
  );
};
