'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Swords,
  Ticket,
  Play,
  Users,
} from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';

const eventTabs = ['Upcoming', 'Live Now', 'Past'];

const mockEvents = [
  {
    id: 'e1',
    title: 'Combat Girls FC 12: Championship Night',
    description: 'The biggest night in women\'s combat sports returns with three title fights.',
    date: '2026-04-26T20:00:00Z',
    venue: 'T-Mobile Arena',
    location: 'Las Vegas, NV',
    status: 'upcoming' as const,
    isPPV: true,
    price: 49.99,
    fightCount: 12,
    interested: 24500,
    watching: 0,
    fights: [
      { fighter1: 'Zhang Weili', fighter2: 'Rose Namajunas', weightClass: 'Strawweight', isMainEvent: true },
      { fighter1: 'Valentina Shevchenko', fighter2: 'Alexa Grasso', weightClass: 'Flyweight', isMainEvent: false },
      { fighter1: 'Amanda Nunes', fighter2: 'Kayla Harrison', weightClass: 'Bantamweight', isMainEvent: false },
    ],
  },
  {
    id: 'e2',
    title: 'LIVE: Friday Night Fights - Boxing Edition',
    description: 'An electrifying night of women\'s boxing featuring top contenders.',
    date: '2026-04-10T19:00:00Z',
    venue: 'Barclays Center',
    location: 'Brooklyn, NY',
    status: 'live' as const,
    isPPV: false,
    price: 0,
    fightCount: 8,
    interested: 18200,
    watching: 5430,
    fights: [
      { fighter1: 'Claressa Shields', fighter2: 'Savannah Marshall', weightClass: 'Middleweight', isMainEvent: true },
      { fighter1: 'Katie Taylor', fighter2: 'Amanda Serrano', weightClass: 'Lightweight', isMainEvent: false },
    ],
  },
  {
    id: 'e3',
    title: 'Grappling Queens Invitational',
    description: 'The premier women\'s grappling tournament with BJJ and wrestling.',
    date: '2026-05-10T14:00:00Z',
    venue: 'Convention Center',
    location: 'Austin, TX',
    status: 'upcoming' as const,
    isPPV: false,
    price: 9.99,
    fightCount: 16,
    interested: 9800,
    watching: 0,
    fights: [
      { fighter1: 'Mackenzie Dern', fighter2: 'Gabby Garcia', weightClass: 'Open Weight', isMainEvent: true },
      { fighter1: 'Helen Maroulis', fighter2: 'Adeline Gray', weightClass: 'Freestyle 76kg', isMainEvent: false },
    ],
  },
  {
    id: 'e4',
    title: 'Muay Thai Grand Prix - Women\'s Division',
    description: 'Eight elite women compete in a one-night Muay Thai tournament.',
    date: '2026-05-24T18:00:00Z',
    venue: 'Lumpinee Stadium',
    location: 'Bangkok, Thailand',
    status: 'upcoming' as const,
    isPPV: true,
    price: 29.99,
    fightCount: 7,
    interested: 15600,
    watching: 0,
    fights: [
      { fighter1: 'Janet Todd', fighter2: 'Stamp Fairtex', weightClass: 'Atomweight', isMainEvent: true },
    ],
  },
  {
    id: 'e5',
    title: 'Combat Girls FC 11: Unfinished Business',
    description: 'Rematches and rivalries settled on one incredible card.',
    date: '2026-03-15T20:00:00Z',
    venue: 'Madison Square Garden',
    location: 'New York, NY',
    status: 'completed' as const,
    isPPV: true,
    price: 49.99,
    fightCount: 11,
    interested: 31200,
    watching: 0,
    fights: [
      { fighter1: 'Amanda Nunes', fighter2: 'Cris Cyborg', weightClass: 'Featherweight', isMainEvent: true },
    ],
  },
];

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-bold font-display text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-dark-300 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function HeroEvent({ event }: { event: (typeof mockEvents)[0] }) {
  const countdown = useCountdown(event.date);

  return (
    <div className="card overflow-hidden mb-6">
      <div className="relative h-48 md:h-64 bg-dark-700 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-transparent to-transparent" />
        <Swords className="h-16 w-16 text-dark-500" />
        {event.status === 'live' && (
          <div className="absolute top-3 left-3 badge-live">LIVE NOW</div>
        )}
        {event.isPPV && (
          <div className="absolute top-3 right-3 badge-gold">PPV</div>
        )}
      </div>
      <div className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white">
          {event.title}
        </h2>
        <p className="text-sm text-dark-200 mt-1">{event.description}</p>

        <div className="flex flex-wrap gap-4 mt-3 text-sm text-dark-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-brand-red" />
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-red" />
            {new Date(event.date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand-red" />
            {event.venue}, {event.location}
          </span>
        </div>

        {/* Countdown */}
        {event.status === 'upcoming' && (
          <div className="flex items-center justify-center gap-4 mt-5 py-4 bg-dark-700 rounded-xl">
            <CountdownUnit value={countdown.days} label="Days" />
            <span className="text-dark-400 text-xl font-bold">:</span>
            <CountdownUnit value={countdown.hours} label="Hours" />
            <span className="text-dark-400 text-xl font-bold">:</span>
            <CountdownUnit value={countdown.minutes} label="Min" />
            <span className="text-dark-400 text-xl font-bold">:</span>
            <CountdownUnit value={countdown.seconds} label="Sec" />
          </div>
        )}

        {/* Live viewer count */}
        {event.status === 'live' && (
          <div className="flex items-center gap-2 mt-4 text-sm text-brand-red">
            <Users className="h-4 w-4" />
            <span className="font-semibold">{formatCount(event.watching)} watching now</span>
          </div>
        )}

        {/* Fight card preview */}
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-semibold text-dark-200 uppercase tracking-wider">
            Fight Card ({event.fightCount} bouts)
          </h3>
          {event.fights.map((fight, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg bg-dark-700',
                fight.isMainEvent && 'border border-brand-gold/30'
              )}
            >
              <span className="text-sm text-white font-medium">{fight.fighter1}</span>
              <div className="flex flex-col items-center">
                {fight.isMainEvent && (
                  <span className="text-[8px] text-brand-gold font-bold uppercase tracking-wider">
                    Main Event
                  </span>
                )}
                <span className="text-[10px] text-dark-300">{fight.weightClass}</span>
                <span className="text-xs font-bold text-dark-200">VS</span>
              </div>
              <span className="text-sm text-white font-medium text-right">{fight.fighter2}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="mt-5 flex gap-3">
          {event.status === 'live' ? (
            <button className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Play className="h-4 w-4" fill="white" />
              Watch Live
            </button>
          ) : event.status === 'upcoming' ? (
            <>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Ticket className="h-4 w-4" />
                {event.isPPV ? `Get Access - $${event.price}` : 'Free - Set Reminder'}
              </button>
              <button className="btn-secondary px-4">
                <Users className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Play className="h-4 w-4" />
              Watch Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('Upcoming');

  const filteredEvents = mockEvents.filter((event) => {
    if (activeTab === 'Live Now') return event.status === 'live';
    if (activeTab === 'Past') return event.status === 'completed';
    return event.status === 'upcoming';
  });

  const featuredEvent =
    mockEvents.find((e) => e.status === 'live') ||
    mockEvents.find((e) => e.status === 'upcoming');

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-display font-bold text-white mb-4">Events</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {eventTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-brand-red text-white'
                : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
            )}
          >
            {tab}
            {tab === 'Live Now' &&
              mockEvents.some((e) => e.status === 'live') && (
                <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-brand-red animate-pulse" />
              )}
          </button>
        ))}
      </div>

      {/* Featured / Hero Event */}
      {featuredEvent && <HeroEvent event={featuredEvent} />}

      {/* Other Events List */}
      <div className="space-y-4">
        {filteredEvents
          .filter((e) => e.id !== featuredEvent?.id)
          .map((event) => (
            <div key={event.id} className="card p-4">
              <div className="flex gap-4">
                <div className="shrink-0 w-28 h-20 bg-dark-700 rounded-lg flex items-center justify-center relative">
                  <Swords className="h-8 w-8 text-dark-500" />
                  {event.status === 'live' && (
                    <span className="absolute top-1 left-1 badge-live text-[8px]">LIVE</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-dark-200">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Swords className="h-3 w-3" />
                      {event.fightCount} bouts
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {event.isPPV && (
                      <span className="badge-gold text-[10px]">PPV ${event.price}</span>
                    )}
                    <span className="text-[10px] text-dark-300">
                      {formatCount(event.interested)} interested
                    </span>
                  </div>
                </div>
                <button
                  className={cn(
                    'shrink-0 self-center px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    event.status === 'live'
                      ? 'bg-brand-red text-white'
                      : 'bg-dark-600 text-dark-100 border border-dark-400 hover:bg-dark-500'
                  )}
                >
                  {event.status === 'live' ? 'Watch' : 'Details'}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
