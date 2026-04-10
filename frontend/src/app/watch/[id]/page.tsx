'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Play,
  ThumbsUp,
  Bookmark,
  Share2,
  Eye,
  ChevronDown,
  ChevronUp,
  Send,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { cn, formatCount, formatDuration, timeAgo } from '@/lib/utils';
import { VIDEOS_MAP, VIDEOS } from '@/lib/data';
import Avatar from '@/components/ui/Avatar';

const mockComments = [
  {
    id: 'c1',
    user: { name: 'Jessica Martinez', image: null },
    text: 'The Cyborg knockout will never get old. Amanda is the GOAT, no question about it.',
    likes: 342,
    createdAt: '2026-04-10T02:15:00Z',
  },
  {
    id: 'c2',
    user: { name: 'Sarah Kim', image: null },
    text: 'I started training MMA because of this woman. Such an inspiration for all female fighters out there.',
    likes: 218,
    createdAt: '2026-04-09T22:40:00Z',
  },
  {
    id: 'c3',
    user: { name: 'Brittany Torres', image: null },
    text: 'That right hand against Rousey was absolutely picture perfect. 48 seconds and it was over.',
    likes: 156,
    createdAt: '2026-04-09T18:30:00Z',
  },
  {
    id: 'c4',
    user: { name: 'Alexis Chen', image: null },
    text: 'Please make a breakdown of her ground game finishes too! The submissions are just as impressive.',
    likes: 89,
    createdAt: '2026-04-09T16:00:00Z',
  },
];

export default function WatchPage() {
  const params = useParams();
  const videoId = params.id as string;

  // Look up the video from the central data store
  const videoItem = VIDEOS_MAP[videoId];

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(videoItem?.views ? Math.round(videoItem.views * 0.05) : 87);
  const [saved, setSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const videoTitle = videoItem?.title ?? `Video ${videoId}`;
  const youtubeId = videoItem?.id ?? videoId;
  const description = videoItem?.description ?? '';
  const views = videoItem?.views ?? 0;
  const sport = videoItem?.sport ?? 'MMA';
  const createdAt = videoItem?.createdAt ?? new Date().toISOString();
  const duration = videoItem?.duration ?? 0;
  const fighters = videoItem?.fighters ?? [];

  useEffect(() => {
    document.title = `${videoTitle} | COMBAT GIRLS`;
  }, [videoTitle]);

  // Build sorted related videos: same fighters first, then the rest
  const currentFighterSlugs = new Set(fighters.map((f) => f.slug));
  const otherVideos = VIDEOS.filter((v) => v.id !== videoId);

  const relatedVideos = [...otherVideos].sort((a, b) => {
    const aMatch = a.fighters?.some((f) => currentFighterSlugs.has(f.slug)) ? 1 : 0;
    const bMatch = b.fighters?.some((f) => currentFighterSlugs.has(f.slug)) ? 1 : 0;
    if (bMatch !== aMatch) return bMatch - aMatch;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleSave = () => {
    setSaved((prev) => !prev);
  };

  function RelatedVideoCard({ rv }: { rv: (typeof relatedVideos)[0] }) {
    return (
      <Link href={`/watch/${rv.id}`} className="flex gap-3 group">
        <div className="relative shrink-0 w-40 aspect-video bg-dark-700 rounded-lg overflow-hidden">
          <img
            src={rv.thumbnail}
            alt={rv.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
          <span className="absolute bottom-1 right-1 bg-dark-900/80 text-white text-[9px] font-medium px-1 py-0.5 rounded">
            {formatDuration(rv.duration)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-white line-clamp-2 leading-snug">
            {rv.title}
          </h4>
          <p className="text-[10px] text-dark-300 mt-1">Combat Girls</p>
          <p className="text-[10px] text-dark-300">
            {formatCount(rv.views)} views - {timeAgo(rv.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="max-w-7xl mx-auto lg:flex lg:gap-6 lg:px-4 lg:py-4">
      {/* Main Content */}
      <div className="flex-1">
        {/* YouTube Video Player */}
        <div className="relative aspect-video bg-dark-900 lg:rounded-2xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>

        <div className="px-4 lg:px-0">
          {/* Title & Stats */}
          <h1 className="text-lg md:text-xl font-semibold text-white mt-3 leading-snug">
            {videoTitle}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-dark-200">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(views)} views
            </span>
            <span>{timeAgo(createdAt)}</span>
            <span className="badge-red text-[10px]">{sport}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={toggleLike}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                liked
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
              )}
            >
              <ThumbsUp
                className={cn('h-4 w-4', liked && 'fill-brand-red')}
              />
              {formatCount(likes)}
            </button>

            <button
              onClick={toggleSave}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                saved
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
              )}
            >
              <Bookmark
                className={cn('h-4 w-4', saved && 'fill-brand-gold')}
              />
              Save
            </button>

            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-dark-700 text-dark-100 hover:bg-dark-600 transition-all">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Fighters in this video */}
          {fighters.length >= 2 && (
            <div className="mt-4 p-4 bg-dark-700 rounded-xl border border-dark-600">
              <h3 className="text-xs font-semibold text-dark-200 uppercase tracking-wider mb-3">
                Fighters in this video
              </h3>
              <div className="flex items-center justify-center gap-3">
                {/* Fighter 1 */}
                <Link
                  href={`/profile/${fighters[0].slug}`}
                  className="flex items-center gap-2.5 flex-1 justify-end hover:opacity-80 transition-opacity"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {fighters[0].name}
                    </p>
                  </div>
                  {fighters[0].image ? (
                    <img
                      src={fighters[0].image}
                      alt={fighters[0].name}
                      className="w-10 h-10 rounded-full object-cover border border-dark-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-dark-200 border border-dark-500">
                      {fighters[0].name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}
                </Link>

                {/* VS */}
                <span className="text-brand-red font-display text-lg font-bold shrink-0 px-2">
                  VS
                </span>

                {/* Fighter 2 */}
                <Link
                  href={`/profile/${fighters[1].slug}`}
                  className="flex items-center gap-2.5 flex-1 hover:opacity-80 transition-opacity"
                >
                  {fighters[1].image ? (
                    <img
                      src={fighters[1].image}
                      alt={fighters[1].name}
                      className="w-10 h-10 rounded-full object-cover border border-dark-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-dark-200 border border-dark-500">
                      {fighters[1].name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {fighters[1].name}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Single fighter card */}
          {fighters.length === 1 && (
            <div className="mt-4 p-4 bg-dark-700 rounded-xl border border-dark-600">
              <h3 className="text-xs font-semibold text-dark-200 uppercase tracking-wider mb-3">
                Fighter in this video
              </h3>
              <Link
                href={`/profile/${fighters[0].slug}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {fighters[0].image ? (
                  <img
                    src={fighters[0].image}
                    alt={fighters[0].name}
                    className="w-10 h-10 rounded-full object-cover border border-dark-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-dark-200 border border-dark-500">
                    {fighters[0].name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <p className="text-sm font-semibold text-white">
                  {fighters[0].name}
                </p>
              </Link>
            </div>
          )}

          {/* Athlete Info */}
          <div className="flex items-center gap-3 mt-4 py-3 border-y border-dark-600">
            <Link href="/profile/combat-girls">
              <Avatar
                src={null}
                name="Combat Girls"
                size="md"
                verified={true}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href="/profile/combat-girls"
                className="text-sm font-semibold text-white hover:underline"
              >
                Combat Girls
              </Link>
              <p className="text-xs text-dark-300">
                {formatCount(47600)} followers
              </p>
            </div>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                isFollowing
                  ? 'bg-dark-600 text-dark-100 border border-dark-400'
                  : 'bg-brand-red text-white'
              )}
            >
              <UserPlus className="h-4 w-4" />
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Description */}
          <div className="mt-3 p-3 bg-dark-800 rounded-xl">
            <p
              className={cn(
                'text-sm text-dark-100 whitespace-pre-line leading-relaxed',
                !showFullDescription && 'line-clamp-3'
              )}
            >
              {description}
            </p>
            {description.length > 120 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="flex items-center gap-1 mt-2 text-xs font-medium text-dark-200 hover:text-white transition-colors"
              >
                {showFullDescription ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-6 mb-8">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
              <MessageCircle className="h-5 w-5" />
              Comments
              <span className="text-sm text-dark-300 font-normal">
                ({mockComments.length})
              </span>
            </h2>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <Avatar src={null} name="You" size="sm" />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="input-field text-sm py-2"
                />
                <button
                  className={cn(
                    'p-2 rounded-xl transition-all',
                    commentText.trim()
                      ? 'bg-brand-red text-white'
                      : 'bg-dark-700 text-dark-400'
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    src={comment.user.image}
                    name={comment.user.name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {comment.user.name}
                      </span>
                      <span className="text-[10px] text-dark-300">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-dark-100 mt-0.5 leading-relaxed">
                      {comment.text}
                    </p>
                    <button className="flex items-center gap-1 mt-1 text-xs text-dark-300 hover:text-white transition-colors">
                      <ThumbsUp className="h-3 w-3" />
                      {comment.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Related Videos (desktop) */}
      <aside className="hidden lg:block w-80 shrink-0">
        <h3 className="text-sm font-semibold text-white mb-3">
          Related Videos
        </h3>
        <div className="space-y-3">
          {relatedVideos.slice(0, 8).map((rv) => (
            <RelatedVideoCard key={rv.id} rv={rv} />
          ))}
        </div>
      </aside>

      {/* Mobile Related Videos */}
      <div className="lg:hidden px-4 pb-8">
        <h3 className="text-sm font-semibold text-white mb-3">
          Related Videos
        </h3>
        <div className="space-y-3">
          {relatedVideos.slice(0, 6).map((rv) => (
            <RelatedVideoCard key={rv.id + '-m'} rv={rv} />
          ))}
        </div>
      </div>
    </div>
  );
}
