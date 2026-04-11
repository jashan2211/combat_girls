'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Link2,
  ChevronDown,
  X,
  CheckCircle,
  Search,
  Youtube,
  Instagram,
  Facebook,
  Swords,
  Music2,
  ImageOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURED_ATHLETES } from '@/lib/data';
import Avatar from '@/components/ui/Avatar';

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | null;
type VideoFormat = 'horizontal' | 'vertical' | 'shorts';
type Visibility = 'public' | 'premium' | 'ppv';
type Step = 'url' | 'details' | 'success';

interface Athlete {
  id: string;
  name: string;
  slug: string;
  image: string;
}

const mockAthletes: Athlete[] = FEATURED_ATHLETES.slice(0, 20).map((a, i) => ({
  id: String(i + 1),
  name: a.name,
  slug: a.slug,
  image: a.image,
}));

const categories = [
  { value: 'fight', label: 'Fight' },
  { value: 'highlight', label: 'Highlight' },
  { value: 'training', label: 'Training' },
  { value: 'behind-scenes', label: 'Behind the Scenes' },
  { value: 'interview', label: 'Interview' },
  { value: 'shorts', label: 'Shorts' },
];

const sports = ['MMA', 'Boxing', 'Muay Thai', 'BJJ', 'Wrestling', 'Kickboxing', 'Judo'];

function parseVideoUrl(url: string): { platform: Platform; videoId: string; isShort: boolean } | null {
  const trimmed = url.trim();

  // YouTube: youtube.com/shorts/{id}
  const ytShortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (ytShortsMatch) return { platform: 'youtube', videoId: ytShortsMatch[1], isShort: true };

  // YouTube: youtube.com/watch?v={id}
  const ytWatchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (ytWatchMatch) return { platform: 'youtube', videoId: ytWatchMatch[1], isShort: false };

  // YouTube: youtu.be/{id}
  const ytShortUrlMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (ytShortUrlMatch) return { platform: 'youtube', videoId: ytShortUrlMatch[1], isShort: false };

  // Instagram: instagram.com/reel/ or instagram.com/p/
  const igMatch = trimmed.match(/instagram\.com\/(reel|p)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return { platform: 'instagram', videoId: igMatch[2], isShort: igMatch[1] === 'reel' };

  // TikTok: tiktok.com/@user/video/{id}
  const ttMatch = trimmed.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return { platform: 'tiktok', videoId: ttMatch[1], isShort: true };

  // Facebook: facebook.com/watch/ or fb.watch/
  const fbWatchMatch = trimmed.match(/facebook\.com\/watch\/?\??[^\s]*/);
  if (fbWatchMatch) return { platform: 'facebook', videoId: 'fb-video', isShort: false };

  const fbShortMatch = trimmed.match(/fb\.watch\/([a-zA-Z0-9_-]+)/);
  if (fbShortMatch) return { platform: 'facebook', videoId: fbShortMatch[1], isShort: false };

  return null;
}

const platformConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  youtube: { label: 'YouTube', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  instagram: { label: 'Instagram', color: 'text-purple-400', bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10', border: 'border-purple-500/30' },
  tiktok: { label: 'TikTok', color: 'text-white', bg: 'bg-dark-900', border: 'border-dark-400' },
  facebook: { label: 'Facebook', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case 'youtube':
      return <Youtube className={cn('text-red-500', className)} />;
    case 'instagram':
      return <Instagram className={cn('text-purple-400', className)} />;
    case 'tiktok':
      return <Music2 className={cn('text-white', className)} />;
    case 'facebook':
      return <Facebook className={cn('text-blue-500', className)} />;
    default:
      return <Link2 className={cn('text-dark-400', className)} />;
  }
}

function FighterSearch({
  label,
  selected,
  onSelect,
  onClear,
  excludeId,
}: {
  label: string;
  selected: Athlete | null;
  onSelect: (a: Athlete) => void;
  onClear: () => void;
  excludeId?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = mockAthletes.filter(
    (a) =>
      a.id !== excludeId &&
      a.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-dark-700 border border-dark-500 rounded-xl">
        <Avatar src={selected.image || null} name={selected.name} size="sm" />
        <span className="text-sm font-medium text-white flex-1 truncate">
          {selected.name}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="p-0.5 rounded-full hover:bg-dark-600 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-dark-300" />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={label}
          className="input-field pl-9"
        />
      </div>
      {open && query.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-600 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-dark-300">No fighters found</p>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onSelect(a);
                  setQuery('');
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-dark-700 transition-colors text-left"
              >
                <Avatar src={a.image || null} name={a.name} size="sm" />
                <span className="text-sm text-white">{a.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [platform, setPlatform] = useState<Platform>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [sport, setSport] = useState('');
  const [tags, setTags] = useState('');
  const [format, setFormat] = useState<VideoFormat>('horizontal');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [fighter1, setFighter1] = useState<Athlete | null>(null);
  const [fighter2, setFighter2] = useState<Athlete | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const parsed = parseVideoUrl(value);
    if (parsed) {
      setVideoId(parsed.videoId);
      setPlatform(parsed.platform);
      if (parsed.isShort) {
        setFormat('shorts');
        setCategory('shorts');
      }
      setStep('details');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  const handleReset = () => {
    setStep('url');
    setUrl('');
    setVideoId('');
    setPlatform(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setSport('');
    setTags('');
    setFormat('horizontal');
    setVisibility('public');
    setFighter1(null);
    setFighter2(null);
  };

  /* ------ Step 3: Success ------ */
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-500/10 mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Video posted successfully!
        </h1>
        <p className="text-dark-200 mb-8">
          Your video is now live on Combat Girls.
        </p>
        <button onClick={handleReset} className="btn-primary px-8">
          Post Another
        </button>
      </div>
    );
  }

  /* ------ Step 1: Paste URL ------ */
  if (step === 'url') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-red/10 mb-4">
            <Link2 className="h-7 w-7 text-brand-red" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            Post a Video
          </h1>
          <p className="text-dark-200 text-sm">
            Paste a video link from your favorite platform
          </p>
        </div>

        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text');
              setTimeout(() => handleUrlChange(pasted), 0);
            }}
            placeholder="Paste YouTube, Instagram, TikTok, or Facebook URL..."
            className="w-full h-14 pl-12 pr-4 bg-dark-800 border-2 border-dark-600 rounded-2xl text-white placeholder-dark-400 text-base focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>

        <p className="text-xs text-dark-400 mt-3 text-center">
          Supports youtube.com, youtu.be, instagram.com/reel, tiktok.com, facebook.com/watch
        </p>

        <div className="mt-10 grid grid-cols-4 gap-3 text-center">
          {/* YouTube */}
          <div className="card p-4 border border-red-500/20">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto mb-2">
              <Youtube className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-xs font-medium text-white">YouTube</p>
            <p className="text-[10px] text-dark-400">Videos & Shorts</p>
          </div>
          {/* Instagram */}
          <div className="card p-4 border border-purple-500/20">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto mb-2">
              <Instagram className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xs font-medium text-white">Instagram</p>
            <p className="text-[10px] text-dark-400">Reels & Posts</p>
          </div>
          {/* TikTok */}
          <div className="card p-4 border border-dark-400/30 bg-dark-900">
            <div className="h-8 w-8 rounded-lg bg-dark-700 flex items-center justify-center mx-auto mb-2">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs font-medium text-white">TikTok</p>
            <p className="text-[10px] text-dark-400">Videos</p>
          </div>
          {/* Facebook */}
          <div className="card p-4 border border-blue-500/20">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <Facebook className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xs font-medium text-white">Facebook</p>
            <p className="text-[10px] text-dark-400">Watch & Videos</p>
          </div>
        </div>
      </div>
    );
  }

  /* ------ Step 2: Details Form ------ */
  const isYouTube = platform === 'youtube';
  const thumbnailUrl = isYouTube ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const pConfig = platform ? platformConfig[platform] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-white">Video Details</h1>
          {platform && pConfig && (
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', pConfig.border, pConfig.color, pConfig.bg)}>
              <span className="flex items-center gap-1">
                <PlatformIcon platform={platform} className="h-3 w-3" />
                {pConfig.label}
              </span>
            </span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-full hover:bg-dark-700 transition-colors"
        >
          <X className="h-5 w-5 text-dark-200" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail + URL preview */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="md:w-80 shrink-0">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-700">
              {isYouTube && thumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                  {platform && <PlatformIcon platform={platform} className="h-8 w-8" />}
                  <ImageOff className="h-5 w-5 text-dark-400" />
                  <p className="text-xs text-dark-300 text-center leading-relaxed">
                    Preview not available — embed will work after posting
                  </p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-dark-400 mt-1.5 truncate">{url}</p>
          </div>
          <div className="flex-1 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your video"
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your video..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Category & Sport */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field appearance-none pr-10"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-100 mb-1.5">
              Sport
            </label>
            <div className="relative">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="input-field appearance-none pr-10"
              >
                <option value="">Select sport</option>
                {sports.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Video Format */}
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">
            Format
          </label>
          <div className="flex gap-3">
            {(['horizontal', 'vertical', 'shorts'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border',
                  format === f
                    ? 'bg-brand-red/10 border-brand-red text-brand-red'
                    : 'bg-dark-700 border-dark-500 text-dark-200 hover:border-dark-300'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">
            Visibility
          </label>
          <div className="flex gap-3">
            {([
              { value: 'public', label: 'Public', desc: 'Free for everyone' },
              { value: 'premium', label: 'Premium', desc: 'Subscribers only' },
              { value: 'ppv', label: 'PPV', desc: 'Pay-per-view' },
            ] as const).map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setVisibility(v.value)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-center transition-all border',
                  visibility === v.value
                    ? 'bg-brand-red/10 border-brand-red'
                    : 'bg-dark-700 border-dark-500 hover:border-dark-300'
                )}
              >
                <p
                  className={cn(
                    'text-sm font-medium',
                    visibility === v.value ? 'text-brand-red' : 'text-dark-100'
                  )}
                >
                  {v.label}
                </p>
                <p className="text-[10px] text-dark-300 mt-0.5">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Athletes */}
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-2">
            <span className="flex items-center gap-1.5">
              <Swords className="h-4 w-4 text-brand-red" />
              Tag Athletes
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <FighterSearch
                label="Fighter 1"
                selected={fighter1}
                onSelect={setFighter1}
                onClear={() => setFighter1(null)}
                excludeId={fighter2?.id}
              />
            </div>
            <span className="text-sm font-bold text-dark-400 shrink-0 pt-0.5">vs</span>
            <div className="flex-1">
              <FighterSearch
                label="Fighter 2"
                selected={fighter2}
                onSelect={setFighter2}
                onClear={() => setFighter2(null)}
                excludeId={fighter1?.id}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-dark-100 mb-1.5">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas"
            className="input-field"
          />
          <p className="text-[10px] text-dark-400 mt-1">
            e.g. knockout, highlight, training, technique
          </p>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary w-full text-center py-3 text-base">
          Post Video
        </button>
      </form>
    </div>
  );
}
