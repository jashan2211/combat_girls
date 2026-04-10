'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Users,
  Flame,
  MessageCircle,
  ThumbsUp,
  BarChart3,
  Play,
  ChevronRight,
  TrendingUp,
  Award,
  CheckCircle,
  Target,
} from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Quick Polls Data
// ---------------------------------------------------------------------------

interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
}

const polls: Poll[] = [
  {
    question: 'Who is the GOAT of Women\'s MMA?',
    options: [
      { label: 'Amanda Nunes', votes: 4832 },
      { label: 'Valentina Shevchenko', votes: 3291 },
      { label: 'Ronda Rousey', votes: 2876 },
      { label: 'Zhang Weili', votes: 1504 },
    ],
  },
  {
    question: 'Best women\'s fight of 2026 so far?',
    options: [
      { label: 'Grasso vs Shevchenko III', votes: 3100 },
      { label: 'Weili vs Namajunas II', votes: 2450 },
      { label: 'Nunes vs Harrison', votes: 1980 },
      { label: 'Dern vs Andrade', votes: 1320 },
    ],
  },
  {
    question: 'Most exciting fighting style?',
    options: [
      { label: 'Aggressive Striker', votes: 5200 },
      { label: 'Submission Specialist', votes: 3800 },
      { label: 'Wrestler / Controller', votes: 1900 },
      { label: 'Counter Fighter', votes: 2100 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Trending Topics Data
// ---------------------------------------------------------------------------

interface Topic {
  id: number;
  title: string;
  replies: number;
  views: number;
  hot: boolean;
  author: string;
  timeAgo: string;
}

const topics: Topic[] = [
  { id: 1, title: 'Is Alexa Grasso the future of WMMA?', replies: 234, views: 8900, hot: true, author: 'CombatFanatic', timeAgo: '2h ago' },
  { id: 2, title: 'Best submission artist in women\'s MMA?', replies: 187, views: 6200, hot: true, author: 'GrappleQueen', timeAgo: '4h ago' },
  { id: 3, title: 'Most underrated female fighter?', replies: 156, views: 5100, hot: false, author: 'MMAInsider', timeAgo: '6h ago' },
  { id: 4, title: 'Who wins: Nunes vs Shevchenko 3?', replies: 312, views: 12400, hot: true, author: 'FightNerd42', timeAgo: '1h ago' },
  { id: 5, title: 'Should women\'s MMA have more weight classes?', replies: 98, views: 3400, hot: false, author: 'WeighInWatcher', timeAgo: '8h ago' },
  { id: 6, title: 'Kayla Harrison: Judo to MMA transition GOAT?', replies: 145, views: 4800, hot: false, author: 'JudoJunkie', timeAgo: '5h ago' },
];

// ---------------------------------------------------------------------------
// Prediction Results Data
// ---------------------------------------------------------------------------

const predictionResults = [
  { fight: 'Grasso vs Shevchenko', winner: 'Alexa Grasso', correct: true, communityPct: 58 },
  { fight: 'Weili vs Namajunas', winner: 'Zhang Weili', correct: true, communityPct: 68 },
  { fight: 'Nunes vs Pena', winner: 'Amanda Nunes', correct: true, communityPct: 78 },
  { fight: 'Harrison vs Holm', winner: 'Kayla Harrison', correct: false, communityPct: 62 },
  { fight: 'Dern vs Andrade', winner: 'Jessica Andrade', correct: true, communityPct: 55 },
];

// ---------------------------------------------------------------------------
// Quick Poll Component
// ---------------------------------------------------------------------------

function QuickPoll({ poll, onNext }: { poll: Poll; onNext: () => void }) {
  const [voted, setVoted] = useState<string | null>(null);

  const totalVotes = useMemo(() => poll.options.reduce((s, o) => s + o.votes, 0), [poll]);

  const handleVote = (label: string) => {
    if (voted) return;
    setVoted(label);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-gold" />
          Quick Poll
        </h3>
        <span className="text-xs text-dark-300">{formatCount(totalVotes + (voted ? 1 : 0))} votes</span>
      </div>

      <p className="text-sm text-white font-semibold mb-4">{poll.question}</p>

      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const adjustedVotes = opt.votes + (voted === opt.label ? 1 : 0);
          const adjustedTotal = totalVotes + (voted ? 1 : 0);
          const pct = Math.round((adjustedVotes / adjustedTotal) * 100);

          return (
            <button
              key={opt.label}
              onClick={() => handleVote(opt.label)}
              className={cn(
                'w-full text-left rounded-lg p-3 relative overflow-hidden transition-all',
                'border',
                voted
                  ? voted === opt.label
                    ? 'border-brand-gold bg-dark-700'
                    : 'border-dark-600 bg-dark-800'
                  : 'border-dark-600 bg-dark-700 hover:border-dark-400 cursor-pointer',
              )}
            >
              {/* Fill bar */}
              {voted && (
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-700 rounded-lg',
                    voted === opt.label ? 'bg-brand-red/20' : 'bg-dark-600/50',
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <span className="text-sm text-white">{opt.label}</span>
                {voted && (
                  <span
                    className={cn(
                      'text-sm font-bold',
                      voted === opt.label ? 'text-brand-gold' : 'text-dark-300',
                    )}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          setVoted(null);
          onNext();
        }}
        className="mt-4 w-full py-2.5 rounded-lg bg-dark-700 text-dark-200 text-sm font-medium hover:bg-dark-600 transition-colors"
      >
        Next Poll
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trending Topic Card
// ---------------------------------------------------------------------------

function TopicCard({ topic }: { topic: Topic }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors cursor-pointer">
      <div className="shrink-0 mt-0.5">
        <MessageCircle className="h-5 w-5 text-dark-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {topic.hot && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-red/20 text-brand-red">
              <Flame className="h-2.5 w-2.5" />
              HOT
            </span>
          )}
          <h4 className="text-sm text-white font-medium truncate">{topic.title}</h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-dark-300">
          <span>by {topic.author}</span>
          <span>{topic.timeAgo}</span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" />
            {topic.replies}
          </span>
          <span>{formatCount(topic.views)} views</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-dark-500 shrink-0 mt-1" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CommunityPage() {
  const [pollIndex, setPollIndex] = useState(0);

  const currentPoll = polls[pollIndex % polls.length];

  const handleNextPoll = () => {
    setPollIndex((prev) => prev + 1);
  };

  const overallAccuracy = useMemo(() => {
    const correct = predictionResults.filter((r) => r.correct).length;
    return Math.round((correct / predictionResults.length) * 100);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
          COMMUNITY <Users className="inline h-8 w-8 text-brand-red -mt-1" />
        </h1>
        <p className="text-dark-200 mt-2 text-sm md:text-base">
          Connect, debate, and vote with fellow combat sports fans
        </p>
      </div>

      {/* Top Grid: Poll + Fight of the Week */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Poll */}
        <QuickPoll poll={currentPoll} onNext={handleNextPoll} />

        {/* Fight of the Week */}
        <div className="card overflow-hidden">
          <div className="relative aspect-video bg-dark-700">
            <Image
              src="https://img.youtube.com/vi/lPQCizd2meU/hqdefault.jpg"
              alt="Fight of the Week"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <a
                href="https://www.youtube.com/watch?v=lPQCizd2meU"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full bg-brand-red/90 flex items-center justify-center hover:bg-brand-red transition-colors shadow-lg"
              >
                <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
              </a>
            </div>
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-brand-gold text-dark-900">
                FIGHT OF THE WEEK
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-bold text-white">
              Andrea Lee Inverted Triangle Choke Submission
            </h3>
            <p className="text-xs text-dark-300 mt-1">
              Best Of Female Jiu Jitsu | Combat Girls
            </p>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-red" />
            Trending Topics
          </h2>
          <span className="text-xs text-dark-400">{topics.length} discussions</span>
        </div>
        <div className="space-y-2">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>

      {/* Fan Predictions Results */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-gold" />
            Fan Predictions Results
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-300">Last week&apos;s accuracy:</span>
            <span className="text-sm font-bold text-brand-gold">{overallAccuracy}%</span>
          </div>
        </div>

        {/* Accuracy bar */}
        <div className="h-3 rounded-full bg-dark-700 overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full transition-all duration-700"
            style={{ width: `${overallAccuracy}%` }}
          />
        </div>

        <div className="space-y-2">
          {predictionResults.map((result, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-800"
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                  result.correct ? 'bg-green-500/20' : 'bg-red-500/20',
                )}
              >
                {result.correct ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <span className="text-red-500 text-xs font-bold">X</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{result.fight}</p>
                <p className="text-[11px] text-dark-300">
                  Community picked: {result.winner} ({result.communityPct}%)
                </p>
              </div>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-1 rounded',
                  result.correct
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500',
                )}
              >
                {result.correct ? 'CORRECT' : 'WRONG'}
              </span>
            </div>
          ))}
        </div>

        {/* Stats footer */}
        <div className="mt-5 pt-4 border-t border-dark-700 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-dark-300">
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-brand-gold" />
            <strong className="text-white">
              {predictionResults.filter((r) => r.correct).length}/{predictionResults.length}
            </strong>{' '}
            correct
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-brand-red" />
            <strong className="text-white">2,847</strong> participants
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <strong className="text-white">{overallAccuracy}%</strong> accuracy
          </span>
        </div>
      </div>
    </div>
  );
}
