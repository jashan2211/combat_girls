'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  SkipForward,
  Crown,
  Medal,
  Award,
  ThumbsUp,
  BarChart3,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { FEATURED_ATHLETES, type AthleteItem } from '@/lib/data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RankedFighter extends AthleteItem {
  points: number;
  trend: 'up' | 'down' | 'neutral';
  votes: number;
}

type LeaderboardTab = 'All Time' | 'This Week' | 'P4P Best' | 'Fan Favorites';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function initRankedFighters(): RankedFighter[] {
  return FEATURED_ATHLETES.map((a, i) => ({
    ...a,
    points: Math.floor(seededRandom(i + 42) * 150) + 50,
    trend: (['up', 'down', 'neutral'] as const)[Math.floor(seededRandom(i + 99) * 3)],
    votes: Math.floor(seededRandom(i + 7) * 800) + 100,
  }));
}

function getRandomPair(fighters: AthleteItem[]): [AthleteItem, AthleteItem] {
  const shuffled = [...fighters].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function recordString(r: { wins: number; losses: number; draws: number }) {
  return `${r.wins}-${r.losses}-${r.draws}`;
}

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function VoteToast({ show, fighter }: { show: boolean; fighter: string }) {
  return (
    <div
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl',
        'bg-brand-gold/90 text-dark-900 font-bold text-sm shadow-lg shadow-brand-gold/20',
        'transition-all duration-500',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none',
      )}
    >
      +3 points for {fighter}!
    </div>
  );
}

// ---------------------------------------------------------------------------
// Head-to-Head Vote Card
// ---------------------------------------------------------------------------

function HeadToHead({
  onVote,
}: {
  onVote: (slug: string) => void;
}) {
  // Use deterministic initial pair to prevent SSR/client mismatch
  const [pair, setPair] = useState<[AthleteItem, AthleteItem]>(() => [FEATURED_ATHLETES[0], FEATURED_ATHLETES[1]]);
  const [voted, setVoted] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; name: string }>({ show: false, name: '' });

  // Randomize after mount
  useEffect(() => {
    setPair(getRandomPair(FEATURED_ATHLETES));
  }, []);

  const nextMatchup = useCallback(() => {
    setVoted(null);
    setPair(getRandomPair(FEATURED_ATHLETES));
  }, []);

  const handleVote = (fighter: AthleteItem) => {
    if (voted) return;
    setVoted(fighter.slug);
    onVote(fighter.slug);
    setToast({ show: true, name: fighter.name });
    setTimeout(() => setToast({ show: false, name: '' }), 2000);
    setTimeout(nextMatchup, 2500);
  };

  return (
    <>
      <VoteToast show={toast.show} fighter={toast.name} />

      <div className="card p-6 md:p-8 mb-8">
        <h2 className="text-center text-lg font-display font-bold text-white mb-6 tracking-wide uppercase">
          Who Wins?
        </h2>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Fighter 1 */}
          <button
            onClick={() => handleVote(pair[0])}
            className={cn(
              'flex-1 rounded-2xl p-4 md:p-6 transition-all duration-500 border-2 border-transparent',
              'bg-dark-700 hover:bg-dark-600 cursor-pointer group',
              voted === pair[0].slug && 'border-brand-gold shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-[1.02]',
              voted && voted !== pair[0].slug && 'opacity-40 scale-95',
            )}
          >
            <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full overflow-hidden bg-dark-600 mb-3">
              <Image src={pair[0].image} alt={pair[0].name} fill className="object-cover" />
            </div>
            <p className="text-white font-bold text-sm md:text-base text-center">{pair[0].name}</p>
            {pair[0].nickname && (
              <p className="text-brand-gold text-xs text-center">&quot;{pair[0].nickname}&quot;</p>
            )}
            {pair[0].record && (
              <p className="text-dark-200 text-xs text-center mt-1">
                {recordString(pair[0].record)}
              </p>
            )}
            {pair[0].weightClass && (
              <p className="text-dark-300 text-[10px] text-center mt-0.5">{pair[0].weightClass}</p>
            )}
          </button>

          {/* VS */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <Zap className="h-5 w-5 text-brand-red" />
            <span className="text-xl md:text-2xl font-display font-black text-brand-red">VS</span>
          </div>

          {/* Fighter 2 */}
          <button
            onClick={() => handleVote(pair[1])}
            className={cn(
              'flex-1 rounded-2xl p-4 md:p-6 transition-all duration-500 border-2 border-transparent',
              'bg-dark-700 hover:bg-dark-600 cursor-pointer group',
              voted === pair[1].slug && 'border-brand-gold shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-[1.02]',
              voted && voted !== pair[1].slug && 'opacity-40 scale-95',
            )}
          >
            <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full overflow-hidden bg-dark-600 mb-3">
              <Image src={pair[1].image} alt={pair[1].name} fill className="object-cover" />
            </div>
            <p className="text-white font-bold text-sm md:text-base text-center">{pair[1].name}</p>
            {pair[1].nickname && (
              <p className="text-brand-gold text-xs text-center">&quot;{pair[1].nickname}&quot;</p>
            )}
            {pair[1].record && (
              <p className="text-dark-200 text-xs text-center mt-1">
                {recordString(pair[1].record)}
              </p>
            )}
            {pair[1].weightClass && (
              <p className="text-dark-300 text-[10px] text-center mt-0.5">{pair[1].weightClass}</p>
            )}
          </button>
        </div>

        <div className="flex justify-center mt-5">
          <button
            onClick={nextMatchup}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-700 text-dark-100 text-sm font-medium hover:bg-dark-600 transition-colors"
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard Row
// ---------------------------------------------------------------------------

function LeaderboardRow({ fighter, rank }: { fighter: RankedFighter; rank: number }) {
  const rankColor =
    rank === 1
      ? 'text-brand-gold'
      : rank === 2
      ? 'text-gray-300'
      : rank === 3
      ? 'text-amber-600'
      : 'text-dark-300';

  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null;

  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors">
      {/* Rank */}
      <div className={cn('w-8 text-center font-display font-bold text-lg', rankColor)}>
        {RankIcon ? <RankIcon className="h-5 w-5 mx-auto" /> : rank}
      </div>

      {/* Photo */}
      <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-dark-600 shrink-0">
        <Image src={fighter.image} alt={fighter.name} fill className="object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm font-semibold truncate">{fighter.name}</span>
          {fighter.verified && (
            <span className="text-brand-gold text-[10px]">&#10003;</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-dark-300">
          {fighter.nickname && <span>&quot;{fighter.nickname}&quot;</span>}
          {fighter.weightClass && <span>{fighter.weightClass}</span>}
        </div>
      </div>

      {/* Record */}
      <div className="hidden md:block text-xs text-dark-200 font-mono">
        {fighter.record ? recordString(fighter.record) : '--'}
      </div>

      {/* Points */}
      <div className="text-right">
        <span className="text-brand-gold font-bold text-sm">{fighter.points}</span>
        <span className="text-dark-400 text-[10px] ml-1">pts</span>
      </div>

      {/* Trend */}
      <div className="w-5">
        {fighter.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
        {fighter.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
        {fighter.trend === 'neutral' && <Minus className="h-4 w-4 text-dark-400" />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Sidebar
// ---------------------------------------------------------------------------

function StatsSidebar({ fighters }: { fighters: RankedFighter[] }) {
  const biggestRisers = useMemo(
    () => fighters.filter((f) => f.trend === 'up').slice(0, 3),
    [fighters],
  );

  const mostVoted = useMemo(
    () => [...fighters].sort((a, b) => b.votes - a.votes).slice(0, 3),
    [fighters],
  );

  const bestWinRate = useMemo(
    () =>
      [...fighters]
        .filter((f) => f.record)
        .map((f) => ({
          ...f,
          winRate: f.record!.wins / (f.record!.wins + f.record!.losses + f.record!.draws),
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 3),
    [fighters],
  );

  return (
    <div className="space-y-6">
      {/* Biggest Risers */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Biggest Risers
        </h3>
        <div className="space-y-2">
          {biggestRisers.map((f) => (
            <div key={f.slug} className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-dark-600 shrink-0">
                <Image src={f.image} alt={f.name} fill className="object-cover" />
              </div>
              <span className="text-xs text-white truncate flex-1">{f.name}</span>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Most Voted */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <ThumbsUp className="h-4 w-4 text-brand-red" />
          Most Voted
        </h3>
        <div className="space-y-2">
          {mostVoted.map((f) => (
            <div key={f.slug} className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-dark-600 shrink-0">
                <Image src={f.image} alt={f.name} fill className="object-cover" />
              </div>
              <span className="text-xs text-white truncate flex-1">{f.name}</span>
              <span className="text-[10px] text-dark-200">{formatCount(f.votes)} votes</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Win Rate */}
      <div className="card p-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-brand-gold" />
          Best Win Rate
        </h3>
        <div className="space-y-2">
          {bestWinRate.map((f) => (
            <div key={f.slug} className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-dark-600 shrink-0">
                <Image src={f.image} alt={f.name} fill className="object-cover" />
              </div>
              <span className="text-xs text-white truncate flex-1">{f.name}</span>
              <span className="text-[10px] text-brand-gold font-bold">
                {Math.round(f.winRate * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const TABS: LeaderboardTab[] = ['All Time', 'This Week', 'P4P Best', 'Fan Favorites'];

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('All Time');
  const [fighters, setFighters] = useState<RankedFighter[]>(() => initRankedFighters());

  const totalVotes = useMemo(() => fighters.reduce((s, f) => s + f.votes, 0), [fighters]);

  const handleVote = useCallback((slug: string) => {
    setFighters((prev) =>
      prev.map((f) =>
        f.slug === slug ? { ...f, points: f.points + 3, votes: f.votes + 1, trend: 'up' as const } : f,
      ),
    );
  }, []);

  const sortedFighters = useMemo(() => {
    const copy = [...fighters];
    switch (activeTab) {
      case 'This Week':
        return copy.sort((a, b) => b.votes - a.votes);
      case 'P4P Best':
        return copy
          .filter((f) => f.record)
          .sort((a, b) => {
            const aWr = a.record!.wins / (a.record!.wins + a.record!.losses + a.record!.draws || 1);
            const bWr = b.record!.wins / (b.record!.wins + b.record!.losses + b.record!.draws || 1);
            return bWr - aWr;
          });
      case 'Fan Favorites':
        return copy.sort((a, b) => b.followers - a.followers);
      default:
        return copy.sort((a, b) => b.points - a.points);
    }
  }, [fighters, activeTab]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
          FIGHTER RANKINGS <Flame className="inline h-8 w-8 text-brand-red -mt-1" />
        </h1>
        <p className="text-dark-200 mt-2 text-sm md:text-base">
          Vote for your favorite fighters &mdash;{' '}
          <span className="text-brand-gold font-semibold">
            <AnimatedCounter target={totalVotes} />
          </span>{' '}
          total votes
        </p>
      </div>

      {/* Head-to-Head */}
      <HeadToHead onVote={handleVote} />

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Leaderboard */}
        <div>
          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  activeTab === tab
                    ? 'bg-brand-red text-white'
                    : 'bg-dark-700 text-dark-100 hover:bg-dark-600',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {sortedFighters.map((fighter, idx) => (
              <LeaderboardRow key={fighter.slug} fighter={fighter} rank={idx + 1} />
            ))}
          </div>
        </div>

        {/* Sidebar — below on mobile */}
        <div className="hidden lg:block">
          <StatsSidebar fighters={fighters} />
        </div>
      </div>

      {/* Mobile stats */}
      <div className="lg:hidden mt-8">
        <StatsSidebar fighters={fighters} />
      </div>

      {/* Community Stats Bar */}
      <div className="mt-8 py-4 px-6 rounded-xl bg-dark-800 border border-dark-700 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-dark-200">
        <span className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-brand-gold" />
          <strong className="text-white">{FEATURED_ATHLETES.length}</strong> fighters ranked
        </span>
        <span className="text-dark-500">|</span>
        <span className="flex items-center gap-1.5">
          <ThumbsUp className="h-4 w-4 text-brand-red" />
          <strong className="text-white">{formatCount(totalVotes)}</strong> votes cast
        </span>
        <span className="text-dark-500">|</span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-green-500" />
          Updated live
        </span>
      </div>
    </div>
  );
}
