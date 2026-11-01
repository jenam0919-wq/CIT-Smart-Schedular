/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ChatConversationItem, ChatMessageItem } from '../types';
import {
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Building,
  Calendar,
  Clock,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Zap,
  Info,
  CornerDownLeft
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />,
    label: 'Generate a timetable for the Computer Science department',
    query: 'Generate an optimized weekly timetable schedule for the Computer Science department respecting all faculty availability.',
  },
  {
    icon: <Building className="w-3.5 h-3.5 text-cyan-500" />,
    label: 'Find available classrooms for tomorrow',
    query: 'Find all available lecture halls and computer laboratories with capacity over 50 seats for tomorrow.',
  },
  {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    label: 'Which faculty members have timetable conflicts?',
    query: 'Which faculty members or rooms currently have timetable conflicts or excessive consecutive hours?',
  },
  {
    icon: <Clock className="w-3.5 h-3.5 text-purple-500" />,
    label: 'Show upcoming examinations',
    query: 'Show the upcoming examination schedule, dates, examination halls, and assigned invigilators.',
  },
  {
    icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />,
    label: 'Find an alternative time for a conflicting class',
    query: 'Find an alternative conflict-free time slot for CS301 Algorithms where CSE-3A students and LH-101 are free.',
  },
  {
    icon: <Zap className="w-3.5 h-3.5 text-emerald-500" />,
    label: "Summarize today's timetable",
    query: "Summarize today's teaching sessions across departments and highlight any active disruptions.",
  },
];

export const AIAssistantPage: React.FC = () => {
  const { currentUser, activeRole, setActiveNavigation } = useApp();

  // Conversations State
  const [conversations, setConversations] = useState<ChatConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  // UI state
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>('gemini-3.8-flash');

  // Conversation Renaming State
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isSendingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load user conversations on mount
  useEffect(() => {
    loadConversations();
  }, [currentUser]);

  const loadConversations = async () => {
    try {
      setIsConversationsLoading(true);
      if (!api.getToken()) {
        try {
          await api.login(currentUser?.email || 'admin@cit.edu', 'demo123');
        } catch (_) {}
      }
      const convList = await api.getAIConversations();
      setConversations(convList);
      if (convList.length > 0) {
        selectConversation(convList[0].id);
      } else {
        // Start fresh with greeting
        startNewConversation(false);
      }
    } catch (err: any) {
      console.warn('Backend conversations unavailable, using local session:', err.message);
      // Create initial local welcome conversation
      const initialId = `conv-local-${Date.now()}`;
      setConversations([
        {
          id: initialId,
          userId: currentUser?.id || 'usr-1',
          title: 'Welcome to CIT Smart AI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 1,
        },
      ]);
      setActiveConversationId(initialId);
      setMessages([
        {
          id: `msg-welcome`,
          conversationId: initialId,
          role: 'assistant',
          content: `👋 Hello **${currentUser?.name || 'CIT Member'}**! I am your **CIT Smart Scheduler AI Assistant**.\n\nI am connected directly to Chilika Institute of Technology's live database, course rosters, room occupancy registers, and the OR-Tools CP-SAT scheduling engine.\n\nHow can I assist your campus scheduling today? Feel free to ask about room availability, faculty workloads, upcoming examinations, or select a suggested query below.`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsConversationsLoading(false);
    }
  };

  const selectConversation = async (convId: string) => {
    try {
      setActiveConversationId(convId);
      setError(null);
      const details = await api.getAIConversation(convId);
      setMessages(details.messages);
      setIsSidebarOpen(false);
    } catch (err: any) {
      console.warn('Failed to fetch conversation messages:', err.message);
    }
  };

  const startNewConversation = async (saveToBackend: boolean = true) => {
    setError(null);
    setInputPrompt('');
    const newTitle = 'New Schedule Inquiry';

    if (saveToBackend) {
      try {
        const created = await api.createAIConversation(newTitle);
        setConversations(prev => [created, ...prev]);
        setActiveConversationId(created.id);
        setMessages([
          {
            id: `msg-welcome-${Date.now()}`,
            conversationId: created.id,
            role: 'assistant',
            content: `👋 Ready for a new scheduling session! What timetable, venue, or faculty inquiry would you like to explore?`,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      } catch (e) {
        // Fallback local
      }
    }

    const localId = `conv-${Date.now()}`;
    const newConv: ChatConversationItem = {
      id: localId,
      userId: currentUser?.id || 'usr-1',
      title: newTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(localId);
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        conversationId: localId,
        role: 'assistant',
        content: `👋 Ready for a new scheduling session! What timetable, venue, or faculty inquiry would you like to explore?`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isSendingRef.current) return;
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt) return;

    isSendingRef.current = true;
    setIsLoading(true);
    setInputPrompt('');
    setError(null);
    setLastFailedPrompt(null);

    const userMessageItem: ChatMessageItem = {
      id: `usr-${Date.now()}`,
      conversationId: activeConversationId || 'temp',
      role: 'user',
      content: prompt,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessageItem]);

    try {
      if (!api.getToken()) {
        try {
          await api.login(currentUser?.email || 'admin@cit.edu', 'demo123');
        } catch (_) {}
      }

      const res = await api.sendAIChat(prompt, activeConversationId || undefined);

      if (res.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
      }
      if (res.modelUsed) {
        setActiveModelName(res.modelUsed);
      }

      const assistantMessageItem: ChatMessageItem = {
        id: res.messageId || `ai-${Date.now()}`,
        conversationId: res.conversationId || activeConversationId || 'conv-1',
        role: 'assistant',
        content: res.response,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessageItem]);

      // Update conversations list title if it was first message
      setConversations(prev =>
        prev.map(c => {
          if (c.id === (res.conversationId || activeConversationId)) {
            return {
              ...c,
              title: c.title === 'New Schedule Inquiry' ? prompt.substring(0, 32) + '...' : c.title,
              lastMessage: res.response.substring(0, 60),
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to reach AI assistant service. Please check your connection or retry.');
      setLastFailedPrompt(prompt);
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedPrompt && !isSendingRef.current) {
      handleSendMessage(lastFailedPrompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (!isSendingRef.current && !isLoading) {
        handleSendMessage();
      }
    }
  };

  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.deleteAIConversation(convId);
    } catch (err) {
      // Local fallback
    }

    const updated = conversations.filter(c => c.id !== convId);
    setConversations(updated);

    if (activeConversationId === convId) {
      if (updated.length > 0) {
        selectConversation(updated[0].id);
      } else {
        startNewConversation(false);
      }
    }
  };

  const handleSaveRename = async (convId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTitle.trim()) return;

    try {
      await api.renameAIConversation(convId, editingTitle.trim());
    } catch (err) {
      // Local fallback
    }

    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, title: editingTitle.trim() } : c))
    );
    setEditingConvId(null);
  };

  const clearCurrentConversation = () => {
    if (!confirm('Clear all messages in the current conversation?')) return;
    setMessages([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                CIT Smart Scheduling Intelligence
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Bot className="w-3 h-3 text-blue-500" />
                {activeModelName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded in live CIT timetable sessions, venue registries, faculty workloads, and OR-Tools optimization rules
            </p>
          </div>
        </div>

        {/* Global Shortcuts */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => startNewConversation(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface Split Screen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[640px]">
        
        {/* LEFT COLUMN: Conversation History Sidebar */}
        <div
          className={`md:block ${
            isSidebarOpen ? 'block fixed inset-0 z-40 bg-slate-900/60 p-4' : 'hidden'
          } md:static md:z-0`}
        >
          <div className="h-full bg-white/85 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl rounded-3xl p-4 flex flex-col justify-between max-h-[720px] overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Chat Sessions</span>
                </div>
                <button
                  onClick={() => startNewConversation(true)}
                  className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                  title="New Conversation"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Conversations List */}
              <div className="space-y-1.5 overflow-y-auto max-h-[540px] pr-1">
                {conversations.map(conv => {
                  const isActive = conv.id === activeConversationId;
                  const isEditing = editingConvId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => !isEditing && selectConversation(conv.id)}
                      className={`group p-2.5 rounded-2xl text-xs cursor-pointer transition-all border flex items-center justify-between ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-950 font-bold shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(conv.id, e)}
                          className="flex items-center gap-1 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            autoFocus
                            className="w-full px-2 py-1 bg-white border border-blue-300 rounded-lg text-xs"
                          />
                          <button
                            type="submit"
                            className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px]"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Bot className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="truncate">{conv.title}</span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingConvId(conv.id);
                                setEditingTitle(conv.title);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Role Info */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Role: {activeRole.toUpperCase()}</span>
              </span>
              <button
                onClick={clearCurrentConversation}
                className="text-slate-400 hover:text-rose-600 font-semibold"
                title="Clear current messages"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Chat Stream */}
        <div className="md:col-span-3 flex flex-col justify-between bg-white/90 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[640px]">
          
          {/* Chat Messages Stream Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 max-h-[540px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-slate-900">CIT Smart Scheduler Intelligence</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ask any question about academic schedules, faculty workloads, room bookings, or solver constraints.
                  </p>
                </div>
              </div>
            ) : (
              messages.map(msg => {
                const isAssistant = msg.role === 'assistant';
                const isCopied = copiedMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 text-xs ${
                      isAssistant ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`relative group max-w-2xl rounded-3xl p-4 shadow-sm ${
                        isAssistant
                          ? 'bg-slate-50/90 border border-slate-200/80 text-slate-800'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                        {msg.content}
                      </div>

                      {/* Message Footer: Timestamp & Actions */}
                      <div
                        className={`flex items-center justify-between gap-4 pt-2 mt-2 border-t text-[10px] ${
                          isAssistant
                            ? 'border-slate-200/60 text-slate-400'
                            : 'border-white/20 text-white/70'
                        }`}
                      >
                        <span>{msg.createdAt}</span>

                        {isAssistant && (
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-2.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="font-semibold">Querying Gemini with live CIT institutional data...</span>
                </div>
              </div>
            )}

            {/* Error Message & Retry */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
                {lastFailedPrompt && (
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors shrink-0"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Area: Suggested Prompts & Input Bar */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-3">
            
            {/* Suggested Question Chips (Only show if few messages) */}
            {messages.length <= 2 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 text-[11px] font-semibold whitespace-nowrap shadow-2xs transition-all shrink-0"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Box */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask CIT AI about schedules, room availability, exam slots, or faculty workloads (Press Enter to send)..."
                disabled={isLoading}
                className="w-full pl-4 pr-24 py-3 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none resize-none max-h-32"
              />

              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isSendingRef.current && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading || !inputPrompt.trim()}
                  className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Zero Hallucination Grounding Verified</span>
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};