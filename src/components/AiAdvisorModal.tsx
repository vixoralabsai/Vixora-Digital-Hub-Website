import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  Bot, 
  User, 
  Building2, 
  GraduationCap, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ACADEMY_COURSES, AcademyCourse } from '../data/vixoraContent';

export interface SuggestedAction {
  label: string;
  actionType: 'navigate_course' | 'enroll_course' | 'start_project' | 'whatsapp_consultation';
  target?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  category?: 'business' | 'academy' | 'general';
  suggestedActions?: SuggestedAction[];
  timestamp: string;
}

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjectModal: () => void;
  onNavigateToCourse: (courseSlug: string) => void;
  onEnrollCourse: (course: AcademyCourse) => void;
}

const STARTER_PROMPTS = [
  {
    icon: GraduationCap,
    label: 'Which course should I take to earn in 90 days?',
    track: 'academy' as const
  },
  {
    icon: Building2,
    label: 'What AI tools can automate my customer support on WhatsApp?',
    track: 'business' as const
  },
  {
    icon: Sparkles,
    label: 'Tell me about the ₦10,000 AI Content Creation sprint.',
    track: 'academy' as const
  },
  {
    icon: Building2,
    label: 'How much does custom web & mobile software cost to build?',
    track: 'business' as const
  }
];

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  onOpenProjectModal,
  onNavigateToCourse,
  onEnrollCourse
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'all' | 'business' | 'academy'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when modal opens & fetch quota status
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      fetchQuotaStatus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchQuotaStatus = async () => {
    try {
      const res = await fetch('/api/ai/advisor/status');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.remaining === 'number') {
          setRemainingQuota(data.remaining);
        }
      }
    } catch {
      // Ignore background network status errors
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = (customPrompt || inputMessage).trim();
    if (!messageToSend || isLoading) return;

    setInputMessage('');
    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          conversationHistory: history,
          track: selectedTrack
        })
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to receive advice from AI Advisor.');
      }

      if (responseData.quota?.remaining !== undefined) {
        setRemainingQuota(responseData.quota.remaining);
      }

      const advisorReply = responseData.data;

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: advisorReply.reply || 'Here is your recommendation.',
        category: advisorReply.category,
        suggestedActions: advisorReply.suggestedActions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('[AI Advisor Client Error]:', err);
      setErrorMessage(err?.message || 'The AI Advisor is temporarily resting. Please try again or reach out on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: SuggestedAction) => {
    if (action.actionType === 'start_project') {
      onClose();
      onOpenProjectModal();
    } else if (action.actionType === 'navigate_course') {
      const slug = action.target || 'ai-image-short-videos-creation';
      onClose();
      onNavigateToCourse(slug);
    } else if (action.actionType === 'enroll_course') {
      const targetSlug = action.target || '';
      const course = ACADEMY_COURSES.find(c => c.slug === targetSlug || c.id === targetSlug) || ACADEMY_COURSES[0];
      onClose();
      onEnrollCourse(course);
    } else if (action.actionType === 'whatsapp_consultation') {
      const encodedText = encodeURIComponent(`Hello Vixora Team, I spoke with your AI Advisor and would like to discuss a project consultation.`);
      window.open(`https://wa.me/12792574850?text=${encodedText}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-5 bg-[#000028]/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl h-[90vh] max-h-[720px] bg-[#070A1E] border border-white/15 rounded-3xl shadow-[0_24px_64px_rgba(0,0,72,0.6)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Hairline */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#480878] via-[#7000F8] to-[#10B981]" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0B0F2A]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7000F8] to-[#480878] text-white flex items-center justify-center shadow-md shadow-purple-900/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  Vixora AI Advisor
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Digital Architect & Tech Career Matcher
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {remainingQuota !== null && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-purple-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                {remainingQuota} queries left
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Advisor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Track Filter Segmented Control */}
        <div className="px-4 py-2.5 bg-[#090D24] border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider shrink-0 font-semibold">
            Advisory Focus:
          </span>
          <div className="inline-flex p-1 bg-white/5 rounded-xl border border-white/10 gap-1">
            <button
              onClick={() => setSelectedTrack('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedTrack === 'all'
                  ? 'bg-[#7000F8] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setSelectedTrack('business')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedTrack === 'business'
                  ? 'bg-[#7000F8] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Business & AI</span>
            </button>
            <button
              onClick={() => setSelectedTrack('academy')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                selectedTrack === 'academy'
                  ? 'bg-[#7000F8] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Academy Cohorts</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-6 py-6">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-300 shadow-xl">
                <Bot className="w-8 h-8 text-[#7000F8]" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white tracking-tight">
                  How can Vixora help you today?
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Ask anything about architecting custom AI software, building automated WhatsApp & CRM workflows, or finding the right high-income course.
                </p>
              </div>

              {/* Starter Prompts */}
              <div className="w-full space-y-2 text-left">
                <div className="text-[10px] font-mono uppercase text-purple-300/80 font-bold px-1">
                  Suggested Prompts:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {STARTER_PROMPTS.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedTrack(prompt.track);
                          handleSendMessage(prompt.label);
                        }}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-purple-900/40 text-purple-300 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs text-neutral-200 group-hover:text-white font-medium">
                            {prompt.label}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#480878] to-[#7000F8] text-white shadow-md'
                        : 'bg-white/5 border border-white/10 text-neutral-200 backdrop-blur-md'
                    }`}
                  >
                    <div className="prose prose-invert prose-xs max-w-none text-neutral-200 font-sans leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* Interactive Suggested Action Buttons */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(action)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#7000F8]/30 hover:bg-[#7000F8] text-white border border-[#7000F8]/60 transition-all cursor-pointer shadow-sm"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-neutral-400 text-right font-mono">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming / Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    <span className="font-mono text-[11px] text-purple-200">
                      Vixora AI is architecting recommendation...
                    </span>
                  </div>
                </div>
              )}

              {/* Error Callout */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{errorMessage}</p>
                    <button
                      onClick={() => handleSendMessage()}
                      className="text-[11px] underline text-rose-300 hover:text-white cursor-pointer font-mono"
                    >
                      Retry request
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#090D24] border-t border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about a custom software build or tech course..."
              disabled={isLoading}
              maxLength={2000}
              className="flex-1 bg-white/5 border border-white/15 focus:border-[#7000F8] focus:ring-1 focus:ring-[#7000F8] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 rounded-2xl bg-[#7000F8] hover:bg-[#5B00D0] disabled:bg-white/10 disabled:text-neutral-600 text-white transition-all shadow-md shadow-purple-900/30 cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 px-2 pt-2 font-mono">
            <span>Powered by Gemini 3.8 Intelligence</span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
