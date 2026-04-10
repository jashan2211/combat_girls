'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  MapPin,
  Dumbbell,
  Play,
  Eye,
  Share2,
  MessageCircle,
  UserPlus,
  ExternalLink,
  Shield,
  Clock,
  Award,
  Ruler,
  Calendar,
  ArrowUpRight,
  X,
  Send,
} from 'lucide-react';
import { cn, formatCount, formatDuration, timeAgo } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';

type ProfileStatus = 'unclaimed' | 'pending' | 'verified';

const mockAthlete = {
  _id: 'amanda-nunes',
  name: 'Amanda Nunes',
  nickname: 'The Lioness',
  image: '/fighters/amanda-nunes.png',
  banner: '',
  role: 'athlete' as const,
  verified: true,
  profileStatus: 'unclaimed' as ProfileStatus,
  bio: 'Two-division UFC champion. Greatest female MMA fighter of all time.',
  fightRecord: { wins: 23, losses: 5, draws: 0, knockouts: 13, submissions: 4 },
  weightClass: 'Bantamweight (135)',
  height: '5\' 8"',
  reach: '69"',
  stance: 'Orthodox',
  dateOfBirth: 'May 30, 1988',
  gym: 'American Top Team',
  location: 'Coconut Creek, FL',
  discipline: ['MMA', 'Boxing', 'BJJ'],
  socialLinks: {
    instagram: '@amanda_leoa',
    twitter: '@Amanda_Leoa',
    youtube: '',
    tiktok: '',
    website: '',
  },
  stats: { followers: 2100000, following: 342, totalViews: 48700000, totalVideos: 156 },
  athleteSubscription: { active: false, tier: 'free' },
  mmaSocialUrl: '',
  ufcStatsUrl: 'http://ufcstats.com/fighter-details/example',
};

const videoIds = [
  'pZm4Wg5qFT0',
  'JJL_wGBME48',
  'EbS-fzLprBU',
  'g5wZd8KADKY',
  'otsBRV53TvQ',
  'dQw4w9WgXcQ',
  'kJQP7kiw5Fk',
  'hT_nvWreIhg',
  '3JZ_D3ELwOQ',
];

const mockVideos = [
  { id: 'pv1', ytId: videoIds[0], title: 'My Greatest Knockout - Breaking Down the Cyborg Fight', duration: 845, views: 3420000, createdAt: '2026-04-08T12:00:00Z', sport: 'MMA' },
  { id: 'pv2', ytId: videoIds[1], title: 'Training Camp Vlog - 6 Weeks Out', duration: 1234, views: 1890000, createdAt: '2026-04-05T10:00:00Z', sport: 'MMA' },
  { id: 'pv3', ytId: videoIds[2], title: 'Pad Work Drills with Coach Mike', duration: 623, views: 876000, createdAt: '2026-04-01T14:00:00Z', sport: 'Boxing' },
  { id: 'pv4', ytId: videoIds[3], title: 'Q&A: Retirement, Motherhood and What Is Next', duration: 2156, views: 2340000, createdAt: '2026-03-28T16:00:00Z', sport: 'MMA' },
  { id: 'pv5', ytId: videoIds[4], title: 'BJJ Rolling Session - Teaching the Next Generation', duration: 1867, views: 654000, createdAt: '2026-03-22T11:00:00Z', sport: 'BJJ' },
  { id: 'pv6', ytId: videoIds[5], title: 'Fight Night Behind the Scenes - Walkout to Knockout', duration: 945, views: 4120000, createdAt: '2026-03-15T20:00:00Z', sport: 'MMA' },
  { id: 'pv7', ytId: videoIds[6], title: 'Strength and Conditioning Full Workout', duration: 2489, views: 1230000, createdAt: '2026-03-10T09:00:00Z', sport: 'MMA' },
  { id: 'pv8', ytId: videoIds[7], title: 'Top 5 Submissions of My Career - Breakdown', duration: 1567, views: 2870000, createdAt: '2026-03-05T13:00:00Z', sport: 'BJJ' },
  { id: 'pv9', ytId: videoIds[8], title: 'Sparring Session: Heavy Hands Day', duration: 734, views: 987000, createdAt: '2026-02-28T15:00:00Z', sport: 'Boxing' },
];

const profileTabs = ['Videos', 'Highlights', 'About', 'Events'];

const socialIcons: Record<string, string> = {
  instagram: 'IG',
  twitter: 'X',
  youtube: 'YT',
  tiktok: 'TT',
  website: 'WEB',
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('Videos');
  const [isFollowing, setIsFollowing] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimProofUrl, setClaimProofUrl] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const athlete = mockAthlete;

  const isPro = athlete.athleteSubscription.active && athlete.athleteSubscription.tier !== 'free';

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Status Banner */}
      {athlete.profileStatus === 'unclaimed' && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-gold shrink-0" />
            <p className="text-sm text-brand-gold font-medium">
              This profile has not been claimed yet
            </p>
          </div>
          <button
            onClick={() => setClaimOpen(true)}
            className="text-sm font-semibold text-dark-900 bg-brand-gold hover:bg-brand-gold/90 px-4 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Claim This Profile
          </button>
        </div>
      )}
      {athlete.profileStatus === 'pending' && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-gold shrink-0" />
          <p className="text-sm text-brand-gold font-medium">
            Claim request pending review
          </p>
        </div>
      )}

      {/* Banner */}
      <div className="relative h-48 md:h-56 bg-dark-700 mt-0">
        {isPro ? (
          <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 via-brand-red/20 to-brand-gold/20" />
        ) : athlete.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={athlete.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-12 relative z-10">
        {/* Avatar */}
        <div className="flex items-end gap-4">
          <div className="rounded-full p-1 bg-dark-900">
            <Avatar
              src={athlete.image || null}
              name={athlete.name}
              size="xl"
              verified={athlete.verified}
            />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-display font-bold text-white truncate">
                {athlete.name}
              </h1>
              {athlete.verified && athlete.profileStatus === 'verified' && (
                <CheckCircle className="h-5 w-5 text-brand-gold fill-brand-gold shrink-0" />
              )}
              {isPro && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-gold to-yellow-500 text-dark-900 text-[10px] font-bold uppercase tracking-wider">
                  <Award className="h-3 w-3" />
                  PRO
                </span>
              )}
            </div>
            {athlete.nickname && (
              <p className="text-sm text-dark-300 font-medium">&quot;{athlete.nickname}&quot;</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {athlete.discipline?.map((d) => (
                <span key={d} className="badge-red text-[10px]">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mt-4 py-3 border-y border-dark-600">
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {formatCount(athlete.stats.followers)}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {formatCount(athlete.stats.following)}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {athlete.stats.totalVideos}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {formatCount(athlete.stats.totalViews)}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">Views</p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-dark-100 mt-3 leading-relaxed">
          {athlete.bio}
        </p>

        {/* Fight Record */}
        {athlete.fightRecord && (
          <div className="mt-4 p-4 bg-dark-800 rounded-xl border border-dark-600">
            <h3 className="text-xs font-semibold text-dark-200 uppercase tracking-wider mb-3">
              Fight Record
            </h3>
            <div className="flex items-center justify-center gap-2 text-center">
              <div>
                <p className="text-3xl font-display font-bold text-green-500">
                  {athlete.fightRecord.wins}
                </p>
                <p className="text-[10px] text-dark-300 uppercase">Wins</p>
              </div>
              <span className="text-2xl font-bold text-dark-400 mx-1">-</span>
              <div>
                <p className="text-3xl font-display font-bold text-brand-red">
                  {athlete.fightRecord.losses}
                </p>
                <p className="text-[10px] text-dark-300 uppercase">Losses</p>
              </div>
              <span className="text-2xl font-bold text-dark-400 mx-1">-</span>
              <div>
                <p className="text-3xl font-display font-bold text-dark-200">
                  {athlete.fightRecord.draws}
                </p>
                <p className="text-[10px] text-dark-300 uppercase">Draws</p>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-3 text-xs text-dark-200">
              <span>{athlete.fightRecord.knockouts} KO/TKO</span>
              <span>{athlete.fightRecord.submissions} SUB</span>
              <span>
                {athlete.fightRecord.wins - athlete.fightRecord.knockouts - athlete.fightRecord.submissions} DEC
              </span>
            </div>
          </div>
        )}

        {/* Physical Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {athlete.height && (
            <div className="p-3 bg-dark-800 rounded-xl border border-dark-600 text-center">
              <Ruler className="h-4 w-4 text-dark-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{athlete.height}</p>
              <p className="text-[10px] text-dark-400 uppercase">Height</p>
            </div>
          )}
          {athlete.reach && (
            <div className="p-3 bg-dark-800 rounded-xl border border-dark-600 text-center">
              <ArrowUpRight className="h-4 w-4 text-dark-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{athlete.reach}</p>
              <p className="text-[10px] text-dark-400 uppercase">Reach</p>
            </div>
          )}
          {athlete.stance && (
            <div className="p-3 bg-dark-800 rounded-xl border border-dark-600 text-center">
              <Dumbbell className="h-4 w-4 text-dark-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{athlete.stance}</p>
              <p className="text-[10px] text-dark-400 uppercase">Stance</p>
            </div>
          )}
          {athlete.dateOfBirth && (
            <div className="p-3 bg-dark-800 rounded-xl border border-dark-600 text-center">
              <Calendar className="h-4 w-4 text-dark-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{athlete.dateOfBirth}</p>
              <p className="text-[10px] text-dark-400 uppercase">Born</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-dark-200">
          {athlete.weightClass && (
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 text-dark-300" />
              {athlete.weightClass}
            </span>
          )}
          {athlete.gym && (
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 text-dark-300" />
              {athlete.gym}
            </span>
          )}
          {athlete.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-dark-300" />
              {athlete.location}
            </span>
          )}
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(athlete.socialLinks).map(
            ([platform, handle]) =>
              handle && (
                <a
                  key={platform}
                  href="#"
                  className="h-8 px-2.5 rounded-lg bg-dark-700 flex items-center justify-center text-[10px] font-bold text-dark-200 hover:bg-dark-600 hover:text-white transition-colors border border-dark-500 gap-1"
                >
                  {socialIcons[platform] || <ExternalLink className="h-3 w-3" />}
                  <span className="text-dark-300 font-normal">{handle}</span>
                </a>
              )
          )}
          {athlete.mmaSocialUrl && (
            <a
              href={athlete.mmaSocialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-dark-700 flex items-center justify-center text-[10px] font-bold text-brand-gold hover:bg-dark-600 transition-colors border border-dark-500 gap-1"
            >
              MMA.social
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {athlete.ufcStatsUrl && (
            <a
              href={athlete.ufcStatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-dark-700 flex items-center justify-center text-[10px] font-bold text-dark-200 hover:bg-dark-600 hover:text-white transition-colors border border-dark-500 gap-1"
            >
              UFC Stats
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all',
              isFollowing
                ? 'bg-dark-600 text-dark-100 border border-dark-400'
                : 'bg-brand-red text-white'
            )}
          >
            <UserPlus className="h-4 w-4" />
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="btn-secondary px-4 py-2.5">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button className="btn-secondary px-4 py-2.5">
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 border-b border-dark-600 -mx-4 px-4">
          {profileTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-all relative',
                activeTab === tab
                  ? 'text-brand-red'
                  : 'text-dark-200 hover:text-white'
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'Videos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockVideos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group"
              >
                <div className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${video.ytId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900/30">
                    <div className="h-10 w-10 rounded-full bg-dark-900/60 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 bg-dark-900/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <h3 className="text-xs font-medium text-white mt-1.5 line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-dark-300 mt-0.5">
                  <Eye className="h-3 w-3" />
                  {formatCount(video.views)} views
                  <span>-</span>
                  <span>{timeAgo(video.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'Highlights' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockVideos.slice(0, 4).map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group"
              >
                <div className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${video.ytId}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900/30">
                    <div className="h-10 w-10 rounded-full bg-dark-900/60 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                  <span className="absolute top-1.5 left-1.5 badge-gold text-[8px]">
                    HIGHLIGHT
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 bg-dark-900/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <h3 className="text-xs font-medium text-white mt-1.5 line-clamp-2">
                  {video.title}
                </h3>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">About</h3>
              <p className="text-sm text-dark-100 leading-relaxed">{athlete.bio}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Details</h3>
              <div className="space-y-2 text-sm text-dark-200">
                <p><span className="text-dark-300">Weight Class:</span> {athlete.weightClass}</p>
                <p><span className="text-dark-300">Height:</span> {athlete.height}</p>
                <p><span className="text-dark-300">Reach:</span> {athlete.reach}</p>
                <p><span className="text-dark-300">Stance:</span> {athlete.stance}</p>
                <p><span className="text-dark-300">Date of Birth:</span> {athlete.dateOfBirth}</p>
                <p><span className="text-dark-300">Gym:</span> {athlete.gym}</p>
                <p><span className="text-dark-300">Location:</span> {athlete.location}</p>
                <p><span className="text-dark-300">Disciplines:</span> {athlete.discipline?.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Events' && (
          <div className="space-y-3">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-gold text-[10px]">UPCOMING</span>
                <span className="text-xs text-dark-300">April 26, 2026</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Combat Girls FC 12: Championship Night
              </h3>
              <p className="text-xs text-dark-200 mt-0.5">
                vs Kayla Harrison - Bantamweight Co-Main Event
              </p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-dark-300 bg-dark-600 px-2 py-0.5 rounded-full">PAST</span>
                <span className="text-xs text-dark-300">March 15, 2026</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Combat Girls FC 11: Unfinished Business
              </h3>
              <p className="text-xs text-dark-200 mt-0.5">
                vs Cris Cyborg - TKO Round 1 (W)
              </p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-dark-300 bg-dark-600 px-2 py-0.5 rounded-full">PAST</span>
                <span className="text-xs text-dark-300">January 20, 2026</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Combat Girls FC 10: New Era
              </h3>
              <p className="text-xs text-dark-200 mt-0.5">
                vs Holly Holm - Decision Round 5 (W)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Claim Profile Modal */}
      <Modal
        open={claimOpen}
        onClose={() => {
          setClaimOpen(false);
          setClaimSubmitted(false);
        }}
        title={claimSubmitted ? 'Claim Submitted' : `Prove you are ${athlete.name}`}
        size="sm"
      >
        {claimSubmitted ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-500/10 mb-4">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <p className="text-sm text-dark-100 mb-1">
              Your claim request has been submitted.
            </p>
            <p className="text-xs text-dark-300">
              Our team will review your request and get back to you shortly.
            </p>
            <button
              onClick={() => {
                setClaimOpen(false);
                setClaimSubmitted(false);
              }}
              className="btn-primary mt-6 w-full"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">
                Tell us how we can verify your identity
              </label>
              <textarea
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                placeholder="I can verify my identity by..."
                rows={3}
                required
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">
                Link to your official social media
              </label>
              <input
                type="url"
                value={claimProofUrl}
                onChange={(e) => setClaimProofUrl(e.target.value)}
                placeholder="https://instagram.com/yourusername"
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Submit Claim Request
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
