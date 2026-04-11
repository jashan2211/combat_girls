'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { SHORTS } from '@/lib/data';
import Avatar from '@/components/ui/Avatar';

interface ShortData {
  id: string;
  youtubeId: string;
  title: string;
  athlete: { name: string; verified: boolean };
  description: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  liked: boolean;
  saved: boolean;
}

const mockShorts: ShortData[] = SHORTS.map(s => ({
  id: s.id,
  youtubeId: s.id,
  title: s.title,
  athlete: { name: 'Combat Girls', verified: true },
  description: s.description,
  likes: s.views,
  comments: Math.floor(s.views * 0.04),
  shares: Math.floor(s.views * 0.08),
  saves: Math.floor(s.views * 0.03),
  liked: false,
  saved: false,
}));

function ShortCard({
  short,
  isActive,
  muted,
  onToggleLike,
  onToggleSave,
}: {
  short: ShortData;
  isActive: boolean;
  muted: boolean;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
}) {
  const [playing, setPlaying] = useState(false);

  // Reset playing state when this card is no longer active
  useEffect(() => {
    if (!isActive) {
      setPlaying(false);
    }
  }, [isActive]);

  const thumbnailUrl = `https://img.youtube.com/vi/${short.youtubeId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${short.youtubeId}?autoplay=1&loop=1&playlist=${short.youtubeId}&controls=0&modestbranding=1&rel=0&playsinline=1&mute=${muted ? 1 : 0}`;

  return (
    <div
      className="relative w-full bg-dark-900 flex-shrink-0"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* Thumbnail or YouTube iframe */}
      <div className="absolute inset-0 bg-dark-900">
        {playing && isActive ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full h-full group cursor-pointer"
            aria-label={`Play ${short.title}`}
          >
            {/* Thumbnail image */}
            <img
              src={thumbnailUrl}
              alt={short.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Right side action buttons */}
      <div className="absolute right-3 bottom-32 z-10 flex flex-col items-center gap-5">
        {/* Like */}
        <button
          onClick={() => onToggleLike(short.id)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center',
              short.liked
                ? 'bg-brand-red/20'
                : 'bg-dark-900/50 backdrop-blur-sm'
            )}
          >
            <Heart
              className={cn(
                'h-5 w-5',
                short.liked
                  ? 'text-brand-red fill-brand-red'
                  : 'text-white'
              )}
            />
          </div>
          <span className="text-white text-[10px] font-medium">
            {formatCount(short.likes)}
          </span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1">
          <div className="h-10 w-10 rounded-full bg-dark-900/50 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-[10px] font-medium">
            {formatCount(short.comments)}
          </span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="h-10 w-10 rounded-full bg-dark-900/50 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-[10px] font-medium">
            {formatCount(short.shares)}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={() => onToggleSave(short.id)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center',
              short.saved
                ? 'bg-brand-gold/20'
                : 'bg-dark-900/50 backdrop-blur-sm'
            )}
          >
            <Bookmark
              className={cn(
                'h-5 w-5',
                short.saved
                  ? 'text-brand-gold fill-brand-gold'
                  : 'text-white'
              )}
            />
          </div>
          <span className="text-white text-[10px] font-medium">
            {formatCount(short.saves)}
          </span>
        </button>
      </div>

      {/* Bottom overlay - athlete info + description */}
      <div className="absolute bottom-4 left-3 right-16 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Avatar
            name={short.athlete.name}
            size="sm"
            verified={short.athlete.verified}
          />
          <span className="text-white text-sm font-semibold">
            {short.athlete.name}
          </span>
          <button className="ml-2 px-3 py-1 rounded-full border border-white/30 text-white text-xs font-medium hover:bg-white/10 transition-colors">
            Follow
          </button>
        </div>
        <p className="text-white text-xs leading-relaxed line-clamp-2">
          {short.description}
        </p>
      </div>
    </div>
  );
}

export default function ShortsPage() {
  const [muted, setMuted] = useState(true);
  const [shorts, setShorts] = useState(mockShorts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shortRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleLike = useCallback((id: string) => {
    setShorts((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 }
          : s
      )
    );
  }, []);

  const toggleSave = useCallback((id: string) => {
    setShorts((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, saved: !s.saved, saves: s.saved ? s.saves - 1 : s.saves + 1 }
          : s
      )
    );
  }, []);

  // Scroll to a specific short by index
  const scrollToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, shorts.length - 1));
    const el = shortRefs.current[clamped];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [shorts.length]);

  const goUp = useCallback(() => {
    scrollToIndex(currentIndex - 1);
  }, [currentIndex, scrollToIndex]);

  const goDown = useCallback(() => {
    scrollToIndex(currentIndex + 1);
  }, [currentIndex, scrollToIndex]);

  // IntersectionObserver to track current visible short
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = shortRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setCurrentIndex(index);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    shortRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [shorts]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          goUp();
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          goDown();
          break;
        case 'm':
          setMuted((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goUp, goDown]);

  return (
    <div className="relative" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Scrollable snap container */}
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {shorts.map((short, index) => (
          <div
            key={short.id}
            ref={(el) => { shortRefs.current[index] = el; }}
            className="snap-start"
          >
            <ShortCard
              short={short}
              isActive={index === currentIndex}
              muted={muted}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
            />
          </div>
        ))}
      </div>

      {/* Sound toggle - top right */}
      <button
        onClick={() => setMuted(!muted)}
        className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-dark-900/50 flex items-center justify-center backdrop-blur-sm hover:bg-dark-900/70 transition-colors"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <VolumeX className="h-4 w-4 text-white" />
        ) : (
          <Volume2 className="h-4 w-4 text-white" />
        )}
      </button>

      {/* Navigation arrows - right side below action buttons */}
      <div className="absolute right-3 bottom-8 z-20 flex flex-col items-center gap-2">
        <button
          onClick={goUp}
          disabled={currentIndex === 0}
          className={cn(
            'h-9 w-9 rounded-full bg-dark-800/60 backdrop-blur-sm flex items-center justify-center transition-colors',
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-dark-700/80'
          )}
          aria-label="Previous short"
        >
          <ChevronUp className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={goDown}
          disabled={currentIndex === shorts.length - 1}
          className={cn(
            'h-9 w-9 rounded-full bg-dark-800/60 backdrop-blur-sm flex items-center justify-center transition-colors',
            currentIndex === shorts.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-dark-700/80'
          )}
          aria-label="Next short"
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Progress dots - far right */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5">
        {shorts.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={cn(
              'rounded-full transition-all duration-200',
              index === currentIndex
                ? 'h-2.5 w-2.5 bg-brand-red'
                : 'h-1.5 w-1.5 bg-dark-400 hover:bg-dark-300'
            )}
            aria-label={`Go to short ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
