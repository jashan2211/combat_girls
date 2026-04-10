'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Target,
  Trophy,
  CheckCircle,
  ChevronRight,
  Calendar,
  Swords,
  Users,
  Award,
} from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { FEATURED_ATHLETES } from '@/lib/data';

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  event: string;
  date: string;
  weightClass: string;
  odds1: string;
  odds2: string;
}

type Method = 'KO/TKO' | 'Submission' | 'Decision';

interface Prediction {
  fightId: number;
  winner: string;
  method?: Method;
}

const fights: Fight[] = [
  { id: 1, fighter1: 'Alexa Grasso', fighter2: 'Valentina Shevchenko', event: 'UFC 300', date: 'Apr 26, 2026', weightClass: 'Flyweight', odds1: '-150', odds2: '+130' },
  { id: 2, fighter1: 'Zhang Weili', fighter2: 'Rose Namajunas', event: 'UFC Fight Night', date: 'May 3, 2026', weightClass: 'Strawweight', odds1: '-200', odds2: '+170' },
  { id: 3, fighter1: 'Amanda Nunes', fighter2: 'Julianna Pena', event: 'Combat Girls FC 12', date: 'May 10, 2026', weightClass: 'Bantamweight', odds1: '-300', odds2: '+250' },
  { id: 4, fighter1: 'Kayla Harrison', fighter2: 'Holly Holm', event: 'UFC 301', date: 'May 17, 2026', weightClass: 'Bantamweight', odds1: '-175', odds2: '+145' },
  { id: 5, fighter1: 'Mackenzie Dern', fighter2: 'Jessica Andrade', event: 'UFC Fight Night', date: 'May 24, 2026', weightClass: 'Strawweight', odds1: '+120', odds2: '-140' },
];

const topPredictors = [
  { name: 'FightOracle99', accuracy: 84, picks: 127 },
  { name: 'MMAQueenBee', accuracy: 79, picks: 98 },
  { name: 'TapoutTasha', accuracy: 76, picks: 156 },
  { name: 'KnockoutKing', accuracy: 74, picks: 89 },
  { name: 'GroundGame_Guru', accuracy: 71, picks: 201 },
];

// Community prediction mock data (percentage for fighter1)
const communityPredictions: Record<number, number> = {
  1: 58,
  2: 68,
  3: 78,
  4: 62,
  5: 45,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getAthlete(name: string) {
  return FEATURED_ATHLETES.find((a) => a.name === name);
}

function recordString(r: { wins: number; losses: number; draws: number }) {
  return `${r.wins}-${r.losses}-${r.draws}`;
}

// ---------------------------------------------------------------------------
// Fight Card
// ---------------------------------------------------------------------------

function FightCard({
  fight,
  prediction,
  onPick,
  onMethod,
}: {
  fight: Fight;
  prediction?: Prediction;
  onPick: (fightId: number, winner: string) => void;
  onMethod: (fightId: number, method: Method) => void;
}) {
  const a1 = getAthlete(fight.fighter1);
  const a2 = getAthlete(fight.fighter2);
  const communityPct = communityPredictions[fight.id] ?? 50;
  const picked = prediction?.winner;

  return (
    <div className="card overflow-hidden">
      {/* Event header */}
      <div className="px-4 py-3 bg-dark-700 flex items-center justify-between border-b border-dark-600">
        <div className="flex items-center gap-2 text-xs text-dark-200">
          <Swords className="h-3.5 w-3.5 text-brand-red" />
          <span className="font-semibold text-white">{fight.event}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-dark-300">
          <Calendar className="h-3 w-3" />
          {fight.date}
        </div>
      </div>

      {/* Fighters */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Fighter 1 */}
          <button
            onClick={() => onPick(fight.id, fight.fighter1)}
            className={cn(
              'flex-1 rounded-xl p-4 transition-all duration-400 border-2',
              'bg-dark-700 hover:bg-dark-600 cursor-pointer',
              picked === fight.fighter1
                ? 'border-brand-gold shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'border-transparent',
            )}
          >
            <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden bg-dark-600 mb-2">
              <Image
                src={a1?.image ?? `/fighters/${slugify(fight.fighter1)}.png`}
                alt={fight.fighter1}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-white font-bold text-sm md:text-base text-center">{fight.fighter1}</p>
            {a1?.record && (
              <p className="text-dark-200 text-xs text-center">{recordString(a1.record)}</p>
            )}
            <p className="text-dark-400 text-[10px] text-center mt-0.5">{fight.weightClass}</p>
            <div className="mt-2 text-center">
              <span className="text-xs font-mono text-dark-300">{fight.odds1}</span>
            </div>
            {picked === fight.fighter1 && (
              <div className="flex justify-center mt-2">
                <CheckCircle className="h-5 w-5 text-brand-gold" />
              </div>
            )}
          </button>

          {/* VS */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <span className="text-lg md:text-xl font-display font-black text-brand-red">VS</span>
            <span className="text-[10px] text-dark-400">{fight.weightClass}</span>
          </div>

          {/* Fighter 2 */}
          <button
            onClick={() => onPick(fight.id, fight.fighter2)}
            className={cn(
              'flex-1 rounded-xl p-4 transition-all duration-400 border-2',
              'bg-dark-700 hover:bg-dark-600 cursor-pointer',
              picked === fight.fighter2
                ? 'border-brand-gold shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'border-transparent',
            )}
          >
            <div className="relative w-16 h-16 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden bg-dark-600 mb-2">
              <Image
                src={a2?.image ?? `/fighters/${slugify(fight.fighter2)}.png`}
                alt={fight.fighter2}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-white font-bold text-sm md:text-base text-center">{fight.fighter2}</p>
            {a2?.record && (
              <p className="text-dark-200 text-xs text-center">{recordString(a2.record)}</p>
            )}
            <p className="text-dark-400 text-[10px] text-center mt-0.5">{fight.weightClass}</p>
            <div className="mt-2 text-center">
              <span className="text-xs font-mono text-dark-300">{fight.odds2}</span>
            </div>
            {picked === fight.fighter2 && (
              <div className="flex justify-center mt-2">
                <CheckCircle className="h-5 w-5 text-brand-gold" />
              </div>
            )}
          </button>
        </div>

        {/* Community prediction bar */}
        <div className="mt-5">
          <p className="text-xs text-dark-300 text-center mb-2">Community Prediction</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white font-semibold w-10 text-right">{communityPct}%</span>
            <div className="flex-1 h-3 rounded-full overflow-hidden bg-dark-600 flex">
              <div
                className="bg-brand-red h-full rounded-l-full transition-all duration-700"
                style={{ width: `${communityPct}%` }}
              />
              <div
                className="bg-blue-500 h-full rounded-r-full transition-all duration-700"
                style={{ width: `${100 - communityPct}%` }}
              />
            </div>
            <span className="text-xs text-white font-semibold w-10">{100 - communityPct}%</span>
          </div>
        </div>

        {/* Method prediction */}
        {picked && (
          <div className="mt-4">
            <p className="text-xs text-dark-300 text-center mb-2">How does {picked} win?</p>
            <div className="flex justify-center gap-2">
              {(['KO/TKO', 'Submission', 'Decision'] as Method[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onMethod(fight.id, m)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    prediction?.method === m
                      ? 'bg-brand-red text-white'
                      : 'bg-dark-700 text-dark-200 hover:bg-dark-600',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PredictPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const handlePick = (fightId: number, winner: string) => {
    setPredictions((prev) => {
      const existing = prev.find((p) => p.fightId === fightId);
      if (existing) {
        return prev.map((p) => (p.fightId === fightId ? { ...p, winner } : p));
      }
      return [...prev, { fightId, winner }];
    });
  };

  const handleMethod = (fightId: number, method: Method) => {
    setPredictions((prev) =>
      prev.map((p) => (p.fightId === fightId ? { ...p, method } : p)),
    );
  };

  const madeCount = predictions.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">
          FIGHT PREDICTOR <Sparkles className="inline h-8 w-8 text-brand-gold -mt-1" />
        </h1>
        <p className="text-dark-200 mt-2 text-sm md:text-base">
          Pick the winners for upcoming fights
        </p>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-200">Your Predictions</span>
          <span className="text-sm font-bold text-brand-gold">{madeCount}/5 picks made</span>
        </div>
        <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
          <div
            className="h-full bg-brand-gold rounded-full transition-all duration-500"
            style={{ width: `${(madeCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Fight Cards */}
      <div className="space-y-6 mb-8">
        {fights.map((fight) => (
          <FightCard
            key={fight.id}
            fight={fight}
            prediction={predictions.find((p) => p.fightId === fight.id)}
            onPick={handlePick}
            onMethod={handleMethod}
          />
        ))}
      </div>

      {/* Your Predictions Summary */}
      {predictions.length > 0 && (
        <div className="card p-5 mb-8">
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-brand-red" />
            Your Picks
          </h2>
          <div className="space-y-2">
            {predictions.map((pred) => {
              const fight = fights.find((f) => f.id === pred.fightId)!;
              const loser = pred.winner === fight.fighter1 ? fight.fighter2 : fight.fighter1;
              return (
                <div
                  key={pred.fightId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-700"
                >
                  <CheckCircle className="h-4 w-4 text-brand-gold shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white font-semibold">{pred.winner}</span>
                    <span className="text-xs text-dark-300"> defeats </span>
                    <span className="text-sm text-dark-200">{loser}</span>
                    {pred.method && (
                      <span className="ml-2 text-xs text-brand-red font-medium">
                        via {pred.method}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-dark-400 shrink-0">{fight.event}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Predictors Leaderboard */}
      <div className="card p-5">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-brand-gold" />
          Top Predictors
        </h2>
        <div className="space-y-2">
          {topPredictors.map((user, idx) => (
            <div
              key={user.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
            >
              <span
                className={cn(
                  'w-7 text-center font-bold text-sm',
                  idx === 0 ? 'text-brand-gold' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-dark-400',
                )}
              >
                {idx + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-dark-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-dark-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-dark-300">{user.picks} picks</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-brand-gold">{user.accuracy}%</span>
                <p className="text-[10px] text-dark-400">accuracy</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
