'use client';

import React, { useState } from 'react';
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
import Avatar from '@/components/ui/Avatar';

interface VideoData {
  youtubeId: string;
  title: string;
  description: string;
  athlete: {
    id: string;
    name: string;
    image: string | null;
    verified: boolean;
    followers: number;
  };
  views: number;
  likes: number;
  duration: number;
  sport: string;
  category: string;
  createdAt: string;
  liked: boolean;
  saved: boolean;
}

const defaultVideo: VideoData = {
  youtubeId: 'pZm4Wg5qFT0',
  title: 'MOUNTED ARM TRIANGLE CHOKE | Female Jiu Jitsu Match',
  description:
    'Welcome to Combat Girls, the home of technical excellence in women\'s combat sports!\n\nWatch this incredible mounted arm triangle choke finish from a female jiu jitsu match. The technique, the timing, the finish - pure grappling excellence.\n\nSubscribe for the best women\'s MMA, BJJ, Wrestling, Boxing and more!\n\nFollow us:\nInstagram: @combat_girls\nYouTube: @combat_girls',
  athlete: {
    id: 'combat-girls',
    name: 'Combat Girls',
    image: null,
    verified: true,
    followers: 47600,
  },
  views: 603,
  likes: 87,
  duration: 83,
  sport: 'BJJ',
  category: 'fight',
  createdAt: '2026-04-09T14:30:00Z',
  liked: false,
  saved: false,
};

const videosDatabase: Record<string, VideoData> = {
  'pZm4Wg5qFT0': {
    ...defaultVideo,
  },
  'JJL_wGBME48': {
    youtubeId: 'JJL_wGBME48',
    title: '51 KG GIRL VS 78 KG BOY JIU JITSU | Blue Belt Vs White Belt',
    description:
      'Can a 51 kg blue belt girl beat a 78 kg white belt boy in jiu jitsu? Watch this amazing match to find out!\n\nThis is what happens when technique meets size and strength. Pure jiu jitsu at its finest.\n\nSubscribe for the best women\'s combat sports content!',
    athlete: {
      id: 'combat-girls',
      name: 'Combat Girls',
      image: null,
      verified: true,
      followers: 47600,
    },
    views: 2400,
    likes: 195,
    duration: 300,
    sport: 'BJJ',
    category: 'fight',
    createdAt: '2026-04-09T12:00:00Z',
    liked: false,
    saved: false,
  },
  'EbS-fzLprBU': {
    youtubeId: 'EbS-fzLprBU',
    title: 'Tactical BJJ Match! Megan O\'Neal vs. Charlize Balser',
    description:
      'An incredibly tactical BJJ match between Megan O\'Neal and Charlize Balser. Watch these two elite grapplers battle it out on the mats.\n\nSubscribe for more women\'s combat sports!',
    athlete: {
      id: 'combat-girls',
      name: 'Combat Girls',
      image: null,
      verified: true,
      followers: 47600,
    },
    views: 15000,
    likes: 1200,
    duration: 357,
    sport: 'BJJ',
    category: 'fight',
    createdAt: '2026-04-02T10:00:00Z',
    liked: false,
    saved: false,
  },
  'g5wZd8KADKY': {
    youtubeId: 'g5wZd8KADKY',
    title: 'EPIC ENDING! Megan O\'Neal vs. Charlize Balser | JWI 5',
    description:
      'What an epic ending to this match! Megan O\'Neal vs. Charlize Balser at JWI 5 delivered one of the most exciting finishes we\'ve ever seen.\n\nSubscribe for more women\'s combat sports content!',
    athlete: {
      id: 'combat-girls',
      name: 'Combat Girls',
      image: null,
      verified: true,
      followers: 47600,
    },
    views: 11000,
    likes: 980,
    duration: 354,
    sport: 'BJJ',
    category: 'fight',
    createdAt: '2026-04-01T16:00:00Z',
    liked: false,
    saved: false,
  },
  'otsBRV53TvQ': {
    youtubeId: 'otsBRV53TvQ',
    title: 'Yurivia Jimenez vs Veronica Vargas | Best Women\'s MMA',
    description:
      'One of the best women\'s MMA fights you\'ll ever see! Yurivia Jimenez takes on Veronica Vargas in an action-packed bout.\n\nSubscribe for the best women\'s MMA, BJJ, Wrestling, Boxing and more!',
    athlete: {
      id: 'combat-girls',
      name: 'Combat Girls',
      image: null,
      verified: true,
      followers: 47600,
    },
    views: 89200,
    likes: 4300,
    duration: 720,
    sport: 'MMA',
    category: 'fight',
    createdAt: '2026-03-28T14:00:00Z',
    liked: false,
    saved: false,
  },
  '--TM7wCQFqQ': {
    youtubeId: '--TM7wCQFqQ',
    title: 'Jiu Jitsu In a Dress!',
    description:
      'Who says you can\'t do jiu jitsu in a dress? Watch this amazing short!\n\nSubscribe for the best women\'s combat sports content!',
    athlete: {
      id: 'combat-girls',
      name: 'Combat Girls',
      image: null,
      verified: true,
      followers: 47600,
    },
    views: 42300,
    likes: 3100,
    duration: 45,
    sport: 'BJJ',
    category: 'shorts',
    createdAt: '2026-04-05T08:00:00Z',
    liked: false,
    saved: false,
  },
};

const allRelatedVideos = [
  {
    id: 'pZm4Wg5qFT0',
    title: 'MOUNTED ARM TRIANGLE CHOKE | Female Jiu Jitsu Match',
    thumbnail: 'https://img.youtube.com/vi/pZm4Wg5qFT0/hqdefault.jpg',
    athlete: 'Combat Girls',
    views: 603,
    duration: 83,
    createdAt: '2026-04-09T14:30:00Z',
  },
  {
    id: 'JJL_wGBME48',
    title: '51 KG GIRL VS 78 KG BOY JIU JITSU | Blue Belt Vs White Belt',
    thumbnail: 'https://img.youtube.com/vi/JJL_wGBME48/hqdefault.jpg',
    athlete: 'Combat Girls',
    views: 2400,
    duration: 300,
    createdAt: '2026-04-09T12:00:00Z',
  },
  {
    id: 'EbS-fzLprBU',
    title: 'Tactical BJJ Match! Megan O\'Neal vs. Charlize Balser',
    thumbnail: 'https://img.youtube.com/vi/EbS-fzLprBU/hqdefault.jpg',
    athlete: 'Combat Girls',
    views: 15000,
    duration: 357,
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'g5wZd8KADKY',
    title: 'EPIC ENDING! Megan O\'Neal vs. Charlize Balser | JWI 5',
    thumbnail: 'https://img.youtube.com/vi/g5wZd8KADKY/hqdefault.jpg',
    athlete: 'Combat Girls',
    views: 11000,
    duration: 354,
    createdAt: '2026-04-01T16:00:00Z',
  },
  {
    id: 'otsBRV53TvQ',
    title: 'Yurivia Jimenez vs Veronica Vargas | Best Women\'s MMA',
    thumbnail: 'https://img.youtube.com/vi/otsBRV53TvQ/hqdefault.jpg',
    athlete: 'Combat Girls',
    views: 89200,
    duration: 720,
    createdAt: '2026-03-28T14:00:00Z',
  },
  {
    id: '--TM7wCQFqQ',
    title: 'Jiu Jitsu In a Dress!',
    thumbnail: 'https://img.youtube.com/vi/--TM7wCQFqQ/hqdefault.jpg',
    athlete: 'Combat Girls',
    views: 42300,
    duration: 45,
    createdAt: '2026-04-05T08:00:00Z',
  },
];

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

  const videoData = videosDatabase[videoId] ?? {
    ...defaultVideo,
    youtubeId: videoId,
    title: `Video ${videoId}`,
  };

  const [video, setVideo] = useState(videoData);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const relatedVideos = allRelatedVideos.filter((rv) => rv.id !== videoId);

  const toggleLike = () => {
    setVideo((v) => ({
      ...v,
      liked: !v.liked,
      likes: v.liked ? v.likes - 1 : v.likes + 1,
    }));
  };

  const toggleSave = () => {
    setVideo((v) => ({ ...v, saved: !v.saved }));
  };

  return (
    <div className="max-w-7xl mx-auto lg:flex lg:gap-6 lg:px-4 lg:py-4">
      {/* Main Content */}
      <div className="flex-1">
        {/* YouTube Video Player */}
        <div className="relative aspect-video bg-dark-900 lg:rounded-2xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>

        <div className="px-4 lg:px-0">
          {/* Title & Stats */}
          <h1 className="text-lg md:text-xl font-semibold text-white mt-3 leading-snug">
            {video.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-dark-200">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(video.views)} views
            </span>
            <span>{timeAgo(video.createdAt)}</span>
            <span className="badge-red text-[10px]">{video.sport}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={toggleLike}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                video.liked
                  ? 'bg-brand-red/10 text-brand-red'
                  : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
              )}
            >
              <ThumbsUp
                className={cn('h-4 w-4', video.liked && 'fill-brand-red')}
              />
              {formatCount(video.likes)}
            </button>

            <button
              onClick={toggleSave}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                video.saved
                  ? 'bg-brand-gold/10 text-brand-gold'
                  : 'bg-dark-700 text-dark-100 hover:bg-dark-600'
              )}
            >
              <Bookmark
                className={cn('h-4 w-4', video.saved && 'fill-brand-gold')}
              />
              Save
            </button>

            <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-dark-700 text-dark-100 hover:bg-dark-600 transition-all">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Athlete Info */}
          <div className="flex items-center gap-3 mt-4 py-3 border-y border-dark-600">
            <Link href={`/profile/${video.athlete.id}`}>
              <Avatar
                src={video.athlete.image}
                name={video.athlete.name}
                size="md"
                verified={video.athlete.verified}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${video.athlete.id}`}
                className="text-sm font-semibold text-white hover:underline"
              >
                {video.athlete.name}
              </Link>
              <p className="text-xs text-dark-300">
                {formatCount(video.athlete.followers)} followers
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
              {video.description}
            </p>
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
        <h3 className="text-sm font-semibold text-white mb-3">Related Videos</h3>
        <div className="space-y-3">
          {relatedVideos.map((rv) => (
            <Link
              key={rv.id}
              href={`/watch/${rv.id}`}
              className="flex gap-3 group"
            >
              <div className="relative shrink-0 w-40 aspect-video bg-dark-700 rounded-lg overflow-hidden">
                <img src={rv.thumbnail} alt={rv.title} className="absolute inset-0 w-full h-full object-cover" />
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
                <p className="text-[10px] text-dark-300 mt-1">{rv.athlete}</p>
                <p className="text-[10px] text-dark-300">
                  {formatCount(rv.views)} views - {timeAgo(rv.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Related Videos */}
      <div className="lg:hidden px-4 pb-8">
        <h3 className="text-sm font-semibold text-white mb-3">Related Videos</h3>
        <div className="space-y-3">
          {relatedVideos.map((rv) => (
            <Link
              key={rv.id}
              href={`/watch/${rv.id}`}
              className="flex gap-3 group"
            >
              <div className="relative shrink-0 w-36 aspect-video bg-dark-700 rounded-lg overflow-hidden">
                <img src={rv.thumbnail} alt={rv.title} className="absolute inset-0 w-full h-full object-cover" />
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
                <p className="text-[10px] text-dark-300 mt-1">{rv.athlete}</p>
                <p className="text-[10px] text-dark-300">
                  {formatCount(rv.views)} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
