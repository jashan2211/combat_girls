'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Eye, Trophy, Target, Users, Flame, ChevronRight, Star, TrendingUp, Calendar } from 'lucide-react';
import { cn, formatCount, formatDuration, timeAgo } from '@/lib/utils';
import { VIDEOS, FEATURED_ATHLETES } from '@/lib/data';
import Avatar from '@/components/ui/Avatar';

const mockStories = FEATURED_ATHLETES.slice(0, 8).map((a, i) => ({
  id: a.slug,
  name: a.name.split(' ')[0] + (a.name.split(' ').length > 1 ? ' ' + a.name.split(' ')[1][0] + '.' : ''),
  image: a.image,
  watched: i % 3 === 2,
}));

const filterTabs = ['For You', 'Following', 'Trending', 'Live'];

const mockVideos = VIDEOS.map((v) => ({
  id: v.id,
  title: v.title,
  thumbnail: v.thumbnail,
  duration: v.duration,
  athlete: { name: 'Combat Girls', image: null, verified: true },
  fighters: v.fighters && v.fighters.length >= 2
    ? { fighter1: { name: v.fighters[0].name, slug: v.fighters[0].slug, image: v.fighters[0].image }, fighter2: { name: v.fighters[1].name, slug: v.fighters[1].slug, image: v.fighters[1].image } }
    : null,
  views: v.views,
  createdAt: v.createdAt,
  isLive: false,
  sport: v.sport,
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _legacyPlaceholder = [
  {
    id: 'JJL_wGBME48',
    title: '51 KG GIRL VS 78 KG BOY JIU JITSU | Blue Belt Vs White Belt',
    thumbnail: 'https://img.youtube.com/vi/JJL_wGBME48/hqdefault.jpg',
    duration: 300,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: null,
    views: 2400,
    createdAt: '2026-04-09T09:00:00Z',
    isLive: false,
    sport: 'BJJ',
  },
  {
    id: 'EbS-fzLprBU',
    title: 'Tactical BJJ Match! Megan O\'Neal vs. Charlize Balser | JWI Special Rules',
    thumbnail: 'https://img.youtube.com/vi/EbS-fzLprBU/hqdefault.jpg',
    duration: 357,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: { fighter1: { name: 'Megan O\'Neal', slug: 'megan-oneal' }, fighter2: { name: 'Charlize Balser', slug: 'charlize-balser' } },
    views: 15000,
    createdAt: '2026-04-02T16:00:00Z',
    isLive: false,
    sport: 'BJJ',
  },
  {
    id: 'g5wZd8KADKY',
    title: 'EPIC ENDING! Megan O\'Neal vs. Charlize Balser | JWI 5 Special Rules',
    thumbnail: 'https://img.youtube.com/vi/g5wZd8KADKY/hqdefault.jpg',
    duration: 354,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: { fighter1: { name: 'Megan O\'Neal', slug: 'megan-oneal' }, fighter2: { name: 'Charlize Balser', slug: 'charlize-balser' } },
    views: 11000,
    createdAt: '2026-04-01T20:00:00Z',
    isLive: false,
    sport: 'BJJ',
  },
  {
    id: 'otsBRV53TvQ',
    title: 'Yurivia Jimenez vs Veronica Vargas | Best Women\'s MMA Fights',
    thumbnail: 'https://img.youtube.com/vi/otsBRV53TvQ/hqdefault.jpg',
    duration: 720,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: { fighter1: { name: 'Yurivia Jimenez', slug: 'yurivia-jimenez' }, fighter2: { name: 'Veronica Vargas', slug: 'veronica-vargas' } },
    views: 89200,
    createdAt: '2026-03-28T02:00:00Z',
    isLive: false,
    sport: 'MMA',
  },
  {
    id: 'pZm4Wg5qFT0',
    title: 'ALEXA GRASSO vs MAYCEE BARBER | Women\'s Flyweight Bout',
    thumbnail: 'https://img.youtube.com/vi/pZm4Wg5qFT0/hqdefault.jpg',
    duration: 923,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: { fighter1: { name: 'Alexa Grasso', slug: 'alexa-grasso', image: '/fighters/alexa-grasso.png' }, fighter2: { name: 'Maycee Barber', slug: 'maycee-barber' } },
    views: 312000,
    createdAt: '2026-03-25T16:00:00Z',
    isLive: false,
    sport: 'MMA',
  },
  {
    id: 'JJL_wGBME48',
    title: 'ANDREA LEE vs RACHAEL OSTOVICH | Best of WMMA',
    thumbnail: 'https://img.youtube.com/vi/JJL_wGBME48/hqdefault.jpg',
    duration: 1856,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: { fighter1: { name: 'Andrea Lee', slug: 'andrea-lee' }, fighter2: { name: 'Rachael Ostovich', slug: 'rachael-ostovich' } },
    views: 198000,
    createdAt: '2026-03-22T11:00:00Z',
    isLive: false,
    sport: 'MMA',
  },
  {
    id: 'EbS-fzLprBU',
    title: 'TOP WMMA SUBMISSIONS - EP 2',
    thumbnail: 'https://img.youtube.com/vi/EbS-fzLprBU/hqdefault.jpg',
    duration: 1175,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: null,
    views: 543000,
    createdAt: '2026-03-20T23:00:00Z',
    isLive: false,
    sport: 'MMA',
  },
  {
    id: 'g5wZd8KADKY',
    title: 'WOMEN\'S BEACH JIU JITSU - Female Grappling',
    thumbnail: 'https://img.youtube.com/vi/g5wZd8KADKY/hqdefault.jpg',
    duration: 478,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: null,
    views: 267000,
    createdAt: '2026-03-18T12:00:00Z',
    isLive: false,
    sport: 'BJJ',
  },
  {
    id: 'otsBRV53TvQ',
    title: 'Those SLAPS Were Brutal | Jasmine Thompson vs Dei Goni | Subversiv',
    thumbnail: 'https://img.youtube.com/vi/otsBRV53TvQ/hqdefault.jpg',
    duration: 742,
    athlete: { name: 'Combat Girls', image: null, verified: true },
    fighters: { fighter1: { name: 'Jasmine Thompson', slug: 'jasmine-thompson' }, fighter2: { name: 'Dei Goni', slug: 'dei-goni' } },
    views: 421000,
    createdAt: '2026-03-15T20:00:00Z',
    isLive: false,
    sport: 'MMA',
  },
];

function VideoFeedCard({ video }: { video: (typeof mockVideos)[0] }) {
  return (
    <Link href={`/watch/${video.id}`} className="block group">
      <div className="card-hover">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-dark-700 overflow-hidden">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-dark-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
            </div>
          </div>

          {/* Duration badge */}
          {video.duration > 0 && (
            <span className="absolute bottom-2 right-2 bg-dark-900/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}

          {/* Live badge */}
          {video.isLive && (
            <span className="absolute top-2 left-2 badge-live text-[10px]">
              LIVE
            </span>
          )}

          {/* Sport badge */}
          <span className="absolute top-2 right-2 bg-dark-900/70 text-dark-100 text-[10px] font-medium px-1.5 py-0.5 rounded">
            {video.sport}
          </span>
        </div>

        {/* Fighter matchup tag */}
        {video.fighters && (
          <div className="px-3 pt-2 flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-dark-700 rounded-full px-2.5 py-1">
              {video.fighters.fighter1.image && (
                <img src={video.fighters.fighter1.image} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              <Link href={`/profile/${video.fighters.fighter1.slug}`} className="text-white font-medium hover:text-brand-red transition-colors" onClick={(e) => e.stopPropagation()}>{video.fighters.fighter1.name}</Link>
              <span className="text-brand-red font-bold">vs</span>
              {video.fighters.fighter2.image && (
                <img src={video.fighters.fighter2.image} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              <Link href={`/profile/${video.fighters.fighter2.slug}`} className="text-white font-medium hover:text-brand-red transition-colors" onClick={(e) => e.stopPropagation()}>{video.fighters.fighter2.name}</Link>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex gap-3 p-3 pt-2">
          <Avatar
            src={video.athlete.image}
            name={video.athlete.name}
            size="sm"
            verified={video.athlete.verified}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug">
              {video.title}
            </h3>
            <p className="text-xs text-dark-200 mt-1">
              {video.athlete.name}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-dark-300 mt-0.5">
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {formatCount(video.views)}
              </span>
              <span>-</span>
              <span>{timeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('For You');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stories Row */}
      <div className="px-4 pt-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {mockStories.map((story) => (
            <Link
              key={story.id}
              href={`/profile/${story.id}`}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className={cn(
                  'rounded-full p-[2.5px]',
                  story.watched
                    ? 'bg-dark-500'
                    : 'bg-gradient-to-br from-brand-red to-brand-gold'
                )}
              >
                <div className="rounded-full p-[2px] bg-dark-900">
                  <Avatar
                    src={story.image}
                    name={story.name}
                    size="lg"
                  />
                </div>
              </div>
              <span className="text-[10px] text-dark-100 w-16 text-center truncate">
                {story.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeFilter === tab
                  ? 'bg-brand-red text-white'
                  : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <Link href="/rankings" className="card-hover p-3 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-brand-gold" />
            </div>
            <span className="text-xs font-medium text-white">Rankings</span>
            <span className="text-[10px] text-dark-300">Vote now</span>
          </Link>
          <Link href="/predict" className="card-hover p-3 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-brand-red" />
            </div>
            <span className="text-xs font-medium text-white">Predict</span>
            <span className="text-[10px] text-dark-300">Pick winners</span>
          </Link>
          <Link href="/community" className="card-hover p-3 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-white">Community</span>
            <span className="text-[10px] text-dark-300">Join polls</span>
          </Link>
        </div>
      </div>

      {/* Trending Fighters */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-brand-red" /> Trending Fighters
          </h2>
          <Link href="/rankings" className="text-xs text-brand-red hover:text-brand-red-light flex items-center gap-0.5">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {FEATURED_ATHLETES.slice(0, 6).map((athlete, i) => (
            <Link key={athlete.slug} href={`/profile/${athlete.slug}`} className="shrink-0 flex items-center gap-2.5 bg-dark-800 rounded-xl px-3 py-2 border border-dark-600 hover:border-dark-400 transition-colors">
              <span className="text-xs font-bold text-dark-300 w-4">{i + 1}</span>
              <img src={athlete.image} alt={athlete.name} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-xs font-medium text-white">{athlete.name.split(' ')[0]}</p>
                <p className="text-[10px] text-dark-300">{athlete.record ? `${athlete.record.wins}-${athlete.record.losses}` : ''}</p>
              </div>
              <TrendingUp className="h-3 w-3 text-green-400 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Video Feed Grid */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Latest Videos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockVideos.slice(0, 6).map((video) => (
            <VideoFeedCard key={video.id} video={video} />
          ))}
        </div>
      </div>

      {/* Upcoming Fight Card */}
      <div className="px-4 py-4">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-red/20 to-brand-gold/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Next Fight
              </h2>
              <span className="text-[10px] text-dark-200">Apr 26, 2026</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/fighters/alexa-grasso.png" alt="Alexa Grasso" className="w-14 h-14 rounded-full object-cover border-2 border-brand-red" />
                <div>
                  <p className="text-sm font-bold text-white">Alexa Grasso</p>
                  <p className="text-[10px] text-dark-200">16-3-1 (W)</p>
                </div>
              </div>
              <div className="text-center">
                <span className="text-brand-red font-display text-lg font-bold">VS</span>
                <p className="text-[10px] text-dark-300">Flyweight</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-white">Valentina S.</p>
                  <p className="text-[10px] text-dark-200">24-4-0</p>
                </div>
                <img src="/fighters/valentina-shevchenko.png" alt="Valentina Shevchenko" className="w-14 h-14 rounded-full object-cover border-2 border-brand-gold" />
              </div>
            </div>
            <Link href="/predict" className="block mt-3">
              <button className="w-full btn-primary text-sm py-2">Make Your Prediction</button>
            </Link>
          </div>
        </div>
      </div>

      {/* More Videos */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockVideos.slice(6).map((video) => (
            <VideoFeedCard key={video.id + '-more'} video={video} />
          ))}
        </div>
      </div>

      {/* Load more */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-dark-300 text-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-dark-400 animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-dark-400 animate-pulse [animation-delay:0.2s]" />
          <div className="h-1.5 w-1.5 rounded-full bg-dark-400 animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
