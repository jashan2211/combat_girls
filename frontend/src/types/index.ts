export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  banner?: string;
  role: 'fan' | 'athlete' | 'admin';
  bio?: string;
  verified: boolean;
  slug?: string;
  // Athlete-specific
  fightRecord?: {
    wins: number;
    losses: number;
    draws: number;
    knockouts: number;
    submissions: number;
  };
  weightClass?: string;
  gym?: string;
  location?: string;
  discipline?: string[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
  stats?: {
    followers: number;
    following: number;
    totalViews: number;
    totalVideos: number;
  };
  subscription?: {
    tier: 'free' | 'bronze' | 'silver' | 'gold';
    expiresAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  athlete: User;
  videoUrl: string;
  thumbnailUrl: string;
  hlsUrl?: string;
  duration: number;
  format: 'horizontal' | 'vertical' | 'shorts';
  category: 'fight' | 'highlight' | 'training' | 'behind-scenes' | 'interview' | 'shorts';
  tags: string[];
  sport: string;
  visibility: 'public' | 'premium' | 'ppv';
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  isLive: boolean;
  event?: string;
  approved: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  video: string;
  text: string;
  likes: number;
  replies?: Comment[];
  parentComment?: string;
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  date: string;
  venue: string;
  location: string;
  status: 'upcoming' | 'live' | 'completed';
  isPPV: boolean;
  price?: number;
  fightCard: FightCard[];
  streamUrl?: string;
  stats: {
    interested: number;
    watching: number;
  };
  createdAt: string;
}

export interface FightCard {
  _id: string;
  fighter1: User;
  fighter2: User;
  weightClass: string;
  rounds: number;
  isMainEvent: boolean;
  result?: {
    winner?: string;
    method: string;
    round: number;
    time: string;
  };
  order: number;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'follow' | 'like' | 'comment' | 'reply' | 'live' | 'event' | 'upload' | 'subscription';
  message: string;
  from?: User;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Story {
  _id: string;
  athlete: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  views: number;
  expiresAt: string;
  createdAt: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}
