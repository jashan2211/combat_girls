'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Play, Eye, Calendar, UserPlus, CheckCircle } from 'lucide-react';
import { cn, formatCount, formatDuration } from '@/lib/utils';

const categories = ['All', 'MMA', 'Boxing', 'Muay Thai', 'BJJ', 'Wrestling', 'Kickboxing'];

const featuredAthletes = [
  { name: 'Amanda Nunes', slug: 'amanda-nunes', image: '/fighters/amanda-nunes.png', discipline: 'MMA', followers: 2100000, verified: true },
  { name: 'Valentina Shevchenko', slug: 'valentina-shevchenko', image: '/fighters/valentina-shevchenko.png', discipline: 'MMA', followers: 1500000, verified: true },
  { name: 'Zhang Weili', slug: 'zhang-weili', image: '/fighters/zhang-weili.png', discipline: 'MMA', followers: 980000, verified: true },
  { name: 'Rose Namajunas', slug: 'rose-namajunas', image: '/fighters/rose-namajunas.png', discipline: 'MMA', followers: 1200000, verified: true },
  { name: 'Alexa Grasso', slug: 'alexa-grasso', image: '/fighters/alexa-grasso.png', discipline: 'MMA', followers: 890000, verified: true },
  { name: 'Holly Holm', slug: 'holly-holm', image: '/fighters/holly-holm.png', discipline: 'Boxing', followers: 1100000, verified: true },
  { name: 'Kayla Harrison', slug: 'kayla-harrison', image: '/fighters/kayla-harrison.png', discipline: 'Judo', followers: 750000, verified: true },
  { name: 'Mackenzie Dern', slug: 'mackenzie-dern', image: '/fighters/mackenzie-dern.png', discipline: 'BJJ', followers: 650000, verified: true },
  { name: 'Ronda Rousey', slug: 'ronda-rousey', image: '/fighters/ronda-rousey.png', discipline: 'Judo', followers: 3200000, verified: true },
  { name: 'Joanna Jedrzejczyk', slug: 'joanna-jedrzejczyk', image: '/fighters/joanna-jedrzejczyk.png', discipline: 'Muay Thai', followers: 920000, verified: true },
  { name: 'Jessica Andrade', slug: 'jessica-andrade', image: '/fighters/jessica-andrade.png', discipline: 'MMA', followers: 780000, verified: true },
];

const trendingVideos = [
  { id: 'pZm4Wg5qFT0', title: 'MOUNTED ARM TRIANGLE CHOKE | Female Jiu Jitsu Match', sport: 'BJJ', views: 603, duration: 83 },
  { id: 'JJL_wGBME48', title: '51 KG GIRL VS 78 KG BOY JIU JITSU', sport: 'BJJ', views: 2400, duration: 300 },
  { id: 'EbS-fzLprBU', title: 'Tactical BJJ Match! Megan O\'Neal vs. Charlize Balser', sport: 'BJJ', views: 15000, duration: 357 },
  { id: 'g5wZd8KADKY', title: 'EPIC ENDING! Megan O\'Neal vs. Charlize Balser', sport: 'BJJ', views: 11000, duration: 354 },
  { id: 'otsBRV53TvQ', title: 'Yurivia Jimenez vs Veronica Vargas | Best Women\'s MMA', sport: 'MMA', views: 89200, duration: 720 },
  { id: '--TM7wCQFqQ', title: 'Jiu Jitsu In a Dress!', sport: 'BJJ', views: 42300, duration: 45, format: 'shorts' as const },
];

const upcomingEvents = [
  {
    id: 'e1',
    title: 'Combat Girls FC 12: Championship Night',
    date: 'April 26, 2026',
    location: 'Las Vegas, NV',
    interested: 12400,
  },
  {
    id: 'e2',
    title: 'Women of War: Boxing Showcase',
    date: 'May 3, 2026',
    location: 'Los Angeles, CA',
    interested: 8700,
  },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [followedSlugs, setFollowedSlugs] = useState<Set<string>>(new Set());

  const toggleFollow = (slug: string) => {
    setFollowedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const filteredAthletes =
    activeCategory === 'All'
      ? featuredAthletes
      : featuredAthletes.filter(
          (a) => a.discipline.toLowerCase() === activeCategory.toLowerCase()
        );

  const filteredVideos =
    activeCategory === 'All'
      ? trendingVideos
      : trendingVideos.filter(
          (v) => v.sport.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300" />
        <input
          type="text"
          placeholder="Search athletes, fights, events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeCategory === cat
                ? 'bg-brand-red text-white'
                : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Athletes */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Featured Athletes</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.slug}
              className="shrink-0 w-40 card p-4 flex flex-col items-center text-center"
            >
              <Link href={`/profile/${athlete.slug}`} className="block">
                <div className="relative w-16 h-16 mx-auto">
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="w-16 h-16 rounded-full object-cover bg-dark-700"
                  />
                  {athlete.verified && (
                    <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-brand-gold fill-dark-900" />
                  )}
                </div>
              </Link>
              <Link href={`/profile/${athlete.slug}`}>
                <h3 className="text-sm font-semibold text-white mt-2 truncate w-full hover:underline">
                  {athlete.name}
                </h3>
              </Link>
              <span className="badge-red text-[10px] mt-1">{athlete.discipline}</span>
              <p className="text-[10px] text-dark-300 mt-1">
                {formatCount(athlete.followers)} followers
              </p>
              <button
                onClick={() => toggleFollow(athlete.slug)}
                className={cn(
                  'mt-2 w-full py-1.5 rounded-lg text-xs font-semibold transition-all',
                  followedSlugs.has(athlete.slug)
                    ? 'bg-dark-600 text-dark-100 border border-dark-400'
                    : 'bg-brand-red text-white'
                )}
              >
                {followedSlugs.has(athlete.slug) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredVideos.map((video) => (
            <Link
              key={video.id}
              href={`/watch/${video.id}`}
              className="group"
            >
              <div className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900/20">
                  <div className="h-10 w-10 rounded-full bg-dark-900/60 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-1.5 bg-dark-900/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </span>
                <span className="absolute top-1.5 left-1.5 bg-dark-900/70 text-dark-100 text-[10px] px-1.5 py-0.5 rounded">
                  {video.sport}
                </span>
              </div>
              <h3 className="text-xs font-medium text-white mt-1.5 line-clamp-2">
                {video.title}
              </h3>
              <p className="flex items-center gap-1 text-[10px] text-dark-300 mt-0.5">
                <Eye className="h-3 w-3" />
                {formatCount(video.views)} views
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Upcoming Events</h2>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="card p-4">
              <div className="flex gap-4">
                <div className="shrink-0 w-24 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-dark-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-dark-200 mt-0.5">{event.date}</p>
                  <p className="text-[10px] text-dark-300 mt-0.5">{event.location}</p>
                  <p className="text-[10px] text-dark-300 mt-1">
                    {formatCount(event.interested)} interested
                  </p>
                </div>
                <button className="shrink-0 self-center px-3 py-1.5 rounded-lg bg-dark-600 text-xs font-medium text-dark-100 hover:bg-dark-500 transition-colors border border-dark-400">
                  Interested
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
