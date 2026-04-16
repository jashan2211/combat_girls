'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  Send,
  AlertTriangle,
} from 'lucide-react';
import { cn, formatCount, formatDuration, timeAgo } from '@/lib/utils';
import { FEATURED_ATHLETES, VIDEOS, SHORTS, COMBAT_GIRLS_CHANNEL } from '@/lib/data';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';

type ProfileStatus = 'unclaimed' | 'pending' | 'verified';

const profileTabs = ['Videos', 'Highlights', 'About', 'Events'];

const socialIcons: Record<string, string> = {
  instagram: 'IG',
  twitter: 'X',
  youtube: 'YT',
  tiktok: 'TT',
  website: 'WEB',
};

export default function ProfilePage() {
  const params = useParams();
  const slug = params.id as string;

  const athleteData = FEATURED_ATHLETES.find((a) => a.slug === slug);

  const [activeTab, setActiveTab] = useState('Videos');
  const [isFollowing, setIsFollowing] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimProofUrl, setClaimProofUrl] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  useEffect(() => {
    if (athleteData) {
      document.title = `${athleteData.name} | COMBAT GIRLS`;
    } else {
      document.title = 'Fighter Not Found | COMBAT GIRLS';
    }
  }, [athleteData]);

  if (!athleteData) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-brand-gold mb-4" />
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Fighter not found
        </h1>
        <p className="text-sm text-dark-200 mb-6">
          We couldn&apos;t find a fighter with the slug &quot;{slug}&quot;.
        </p>
        <Link
          href="/"
          className="btn-primary px-6 py-2.5 text-sm font-semibold"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  // Special case: Combat Girls channel owns ALL videos
  const isChannelOwner = slug === 'combat-girls';

  // Build athlete display object from the central data
  const athlete = {
    name: athleteData.name,
    nickname: athleteData.nickname ?? null,
    image: athleteData.image,
    verified: athleteData.verified || isChannelOwner,
    profileStatus: (isChannelOwner ? 'verified' : 'unclaimed') as ProfileStatus,
    bio: isChannelOwner
      ? "Welcome to COMBAT GIRLS — the official home of women's combat sports. Watch the best MMA, BJJ, Boxing, Muay Thai, and Wrestling content from female athletes around the world."
      : `${athleteData.name}${athleteData.nickname ? ` "${athleteData.nickname}"` : ''} — professional ${athleteData.discipline} fighter.`,
    fightRecord: athleteData.record
      ? {
          wins: athleteData.record.wins,
          losses: athleteData.record.losses,
          draws: athleteData.record.draws,
          knockouts: athleteData.record.ko,
          submissions: athleteData.record.sub,
        }
      : null,
    weightClass: athleteData.weightClass ?? null,
    gym: athleteData.gym ?? null,
    location: athleteData.location ?? null,
    discipline: [athleteData.discipline],
    socialLinks: isChannelOwner
      ? {
          youtube: 'https://www.youtube.com/@combat_girls',
          instagram: 'https://instagram.com/combat_girls',
        }
      : ({} as Record<string, string>),
    stats: {
      followers: athleteData.followers,
      following: 0,
      totalViews: 0,
      totalVideos: 0,
    },
    athleteSubscription: { active: isChannelOwner, tier: isChannelOwner ? 'premium' : 'free' },
  };

  // Combat Girls channel shows ALL videos (long-form + shorts)
  // Other athletes: only videos where they're tagged as a fighter
  const athleteVideos = isChannelOwner
    ? [...VIDEOS, ...SHORTS]
    : VIDEOS.filter((v) => v.fighters?.some((f) => f.slug === slug));

  athlete.stats.totalVideos = athleteVideos.length;
  athlete.stats.totalViews = athleteVideos.reduce((sum, v) => sum + v.views, 0);

  const isPro =
    athlete.athleteSubscription.active &&
    athlete.athleteSubscription.tier !== 'free';

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
              <p className="text-sm text-dark-300 font-medium">
                &quot;{athlete.nickname}&quot;
              </p>
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
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">
              Followers
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {formatCount(athlete.stats.following)}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">
              Following
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {athlete.stats.totalVideos}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">
              Videos
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {formatCount(athlete.stats.totalViews)}
            </p>
            <p className="text-[10px] text-dark-300 uppercase tracking-wider">
              Views
            </p>
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
                {athlete.fightRecord.wins -
                  athlete.fightRecord.knockouts -
                  athlete.fightRecord.submissions}{' '}
                DEC
              </span>
            </div>
          </div>
        )}

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
                  {socialIcons[platform] || (
                    <ExternalLink className="h-3 w-3" />
                  )}
                  <span className="text-dark-300 font-normal">{handle}</span>
                </a>
              )
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
          <div>
            {athleteVideos.length === 0 ? (
              <p className="text-sm text-dark-300 text-center py-8">
                No videos found for this fighter yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {athleteVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="group"
                  >
                    <div className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900/30">
                        <div className="h-10 w-10 rounded-full bg-dark-900/60 flex items-center justify-center">
                          <Play
                            className="h-5 w-5 text-white ml-0.5"
                            fill="white"
                          />
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
          </div>
        )}

        {activeTab === 'Highlights' && (
          <div>
            {athleteVideos.length === 0 ? (
              <p className="text-sm text-dark-300 text-center py-8">
                No highlights available yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {athleteVideos.slice(0, 4).map((video) => (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="group"
                  >
                    <div className="relative aspect-video bg-dark-700 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark-900/30">
                        <div className="h-10 w-10 rounded-full bg-dark-900/60 flex items-center justify-center">
                          <Play
                            className="h-5 w-5 text-white ml-0.5"
                            fill="white"
                          />
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
          </div>
        )}

        {activeTab === 'About' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">About</h3>
              <p className="text-sm text-dark-100 leading-relaxed">
                {athlete.bio}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">
                Details
              </h3>
              <div className="space-y-2 text-sm text-dark-200">
                {athlete.weightClass && (
                  <p>
                    <span className="text-dark-300">Weight Class:</span>{' '}
                    {athlete.weightClass}
                  </p>
                )}
                {athlete.gym && (
                  <p>
                    <span className="text-dark-300">Gym:</span> {athlete.gym}
                  </p>
                )}
                {athlete.location && (
                  <p>
                    <span className="text-dark-300">Location:</span>{' '}
                    {athlete.location}
                  </p>
                )}
                <p>
                  <span className="text-dark-300">Disciplines:</span>{' '}
                  {athlete.discipline?.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Events' && (
          <div className="space-y-3">
            <p className="text-sm text-dark-300 text-center py-8">
              No upcoming events for {athlete.name}.
            </p>
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
        title={
          claimSubmitted ? 'Claim Submitted' : `Prove you are ${athlete.name}`
        }
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
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Claim Request
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
