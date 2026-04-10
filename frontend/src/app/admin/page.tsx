'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Users, Video, Calendar, Shield, BarChart3,
  CheckCircle, XCircle, Eye, Ban, Search, ChevronDown,
  TrendingUp, DollarSign, UserPlus, PlayCircle, UserCheck,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

// Mock dashboard data
const dashboardStats = {
  totalUsers: 12847,
  totalAthletes: 342,
  totalVideos: 1893,
  totalEvents: 28,
  monthlyRevenue: 45230,
  activeSubscribers: 3421,
  pendingApprovals: 15,
  pendingClaims: 3,
  liveNow: 2,
};

const pendingVideos = [
  { _id: '1', title: 'Championship Round 3 Knockout', athlete: 'Sarah "Thunder" Williams', thumbnail: '', duration: '4:32', uploadedAt: '2 hours ago', category: 'fight' },
  { _id: '2', title: 'Morning Training Routine', athlete: 'Maria Santos', thumbnail: '', duration: '12:45', uploadedAt: '5 hours ago', category: 'training' },
  { _id: '3', title: 'Post-Fight Interview', athlete: 'Kim "Dragon" Lee', thumbnail: '', duration: '8:20', uploadedAt: '1 day ago', category: 'interview' },
  { _id: '4', title: 'Sparring Session Highlights', athlete: 'Aisha Johnson', thumbnail: '', duration: '3:15', uploadedAt: '1 day ago', category: 'highlight' },
];

const recentUsers = [
  { _id: '1', name: 'Jessica Martinez', email: 'jessica@email.com', role: 'athlete', verified: true, joinedAt: '2 days ago' },
  { _id: '2', name: 'Emily Chen', email: 'emily@email.com', role: 'fan', verified: false, joinedAt: '3 days ago' },
  { _id: '3', name: 'Fatima Al-Hassan', email: 'fatima@email.com', role: 'athlete', verified: false, joinedAt: '4 days ago' },
  { _id: '4', name: 'Sofia Rodriguez', email: 'sofia@email.com', role: 'fan', verified: false, joinedAt: '5 days ago' },
  { _id: '5', name: 'Dana White Jr', email: 'dana@email.com', role: 'admin', verified: true, joinedAt: '1 week ago' },
];

const pendingClaims = [
  { _id: '1', profileName: 'Amanda Nunes', profileImage: '/fighters/amanda-nunes.png', claimer: { name: 'Amanda N.', email: 'amanda@email.com' }, message: 'I am Amanda Nunes. You can verify through my Instagram @amanda_leoa', proofUrl: 'https://instagram.com/amanda_leoa', requestedAt: '2 days ago' },
  { _id: '2', profileName: 'Alexa Grasso', profileImage: '/fighters/alexa-grasso.png', claimer: { name: 'Alexa G.', email: 'alexa@email.com' }, message: 'This is my profile. I can verify via my management team.', proofUrl: 'https://twitter.com/alexagrasso', requestedAt: '5 days ago' },
  { _id: '3', profileName: 'Mackenzie Dern', profileImage: '/fighters/mackenzie-dern.png', claimer: { name: 'Mackenzie D.', email: 'mackenzie@email.com' }, message: 'Hi, I\'d like to claim my athlete profile.', proofUrl: 'https://instagram.com/mackenziedern', requestedAt: '1 week ago' },
];

type Tab = 'overview' | 'users' | 'videos' | 'events' | 'moderation' | 'claims' | 'analytics';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'videos', label: 'Videos', icon: <Video size={18} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { id: 'moderation', label: 'Moderation', icon: <Shield size={18} /> },
    { id: 'claims', label: 'Claims', icon: <UserCheck size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Admin Header */}
      <header className="glass sticky top-0 z-50 border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-brand-red" size={24} />
            <h1 className="font-display text-xl font-bold">ADMIN PANEL</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-200" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm w-64"
              />
            </div>
            <Link href="/" className="text-sm text-dark-200 hover:text-white transition-colors">
              Back to Site
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar bg-dark-800 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-red text-white'
                  : 'text-dark-200 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'moderation' && dashboardStats.pendingApprovals > 0 && (
                <span className="bg-brand-gold text-dark-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {dashboardStats.pendingApprovals}
                </span>
              )}
              {tab.id === 'claims' && dashboardStats.pendingClaims > 0 && (
                <span className="bg-brand-gold text-dark-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {dashboardStats.pendingClaims}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: dashboardStats.totalUsers.toLocaleString(), icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Athletes', value: dashboardStats.totalAthletes.toLocaleString(), icon: <UserPlus size={20} />, color: 'text-brand-gold', bg: 'bg-brand-gold/10' },
                { label: 'Total Videos', value: dashboardStats.totalVideos.toLocaleString(), icon: <PlayCircle size={20} />, color: 'text-green-400', bg: 'bg-green-400/10' },
                { label: 'Monthly Revenue', value: `$${dashboardStats.monthlyRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'text-brand-red', bg: 'bg-brand-red/10' },
                { label: 'Active Subs', value: dashboardStats.activeSubscribers.toLocaleString(), icon: <TrendingUp size={20} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Events', value: dashboardStats.totalEvents.toString(), icon: <Calendar size={20} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                { label: 'Pending Approval', value: dashboardStats.pendingApprovals.toString(), icon: <Shield size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                { label: 'Pending Claims', value: dashboardStats.pendingClaims.toString(), icon: <UserCheck size={20} />, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                { label: 'Live Now', value: dashboardStats.liveNow.toString(), icon: <div className="w-2.5 h-2.5 bg-brand-red rounded-full animate-pulse" />, color: 'text-brand-red', bg: 'bg-brand-red/10' },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>{stat.icon}</div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-dark-200">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pending Videos */}
              <div className="card">
                <div className="p-4 border-b border-dark-600 flex items-center justify-between">
                  <h3 className="font-semibold">Pending Approvals</h3>
                  <span className="badge-gold">{pendingVideos.length} pending</span>
                </div>
                <div className="divide-y divide-dark-700">
                  {pendingVideos.map((video) => (
                    <div key={video._id} className="p-4 flex items-center gap-3">
                      <div className="w-20 h-12 bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Video size={16} className="text-dark-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        <p className="text-xs text-dark-200">{video.athlete} &middot; {video.uploadedAt}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                          <CheckCircle size={16} />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="card">
                <div className="p-4 border-b border-dark-600 flex items-center justify-between">
                  <h3 className="font-semibold">Recent Users</h3>
                  <button className="text-sm text-brand-red hover:text-brand-red-light">View All</button>
                </div>
                <div className="divide-y divide-dark-700">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{user.name}</p>
                          {user.verified && <CheckCircle size={14} className="text-brand-gold" />}
                        </div>
                        <p className="text-xs text-dark-200">{user.email} &middot; {user.joinedAt}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-brand-red/20 text-brand-red-light' :
                        user.role === 'athlete' ? 'bg-brand-gold/20 text-brand-gold-light' :
                        'bg-dark-600 text-dark-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="p-4 border-b border-dark-600 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h3 className="font-semibold">All Users ({dashboardStats.totalUsers.toLocaleString()})</h3>
              <div className="flex gap-2">
                <select className="input-field py-2 text-sm w-32">
                  <option>All Roles</option>
                  <option>Athletes</option>
                  <option>Fans</option>
                  <option>Admins</option>
                </select>
                <select className="input-field py-2 text-sm w-32">
                  <option>All Status</option>
                  <option>Verified</option>
                  <option>Unverified</option>
                  <option>Banned</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-700 text-dark-200">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-dark-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-dark-200">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.role === 'admin' ? 'bg-brand-red/20 text-brand-red-light' :
                          user.role === 'athlete' ? 'bg-brand-gold/20 text-brand-gold-light' :
                          'bg-dark-600 text-dark-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.verified ? (
                          <span className="text-green-400 flex items-center gap-1"><CheckCircle size={14} /> Verified</span>
                        ) : (
                          <span className="text-dark-200">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-dark-200">{user.joinedAt}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 hover:text-white transition-colors" title="View">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 hover:text-brand-gold transition-colors" title="Verify">
                            <CheckCircle size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 hover:text-brand-red transition-colors" title="Ban">
                            <Ban size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Content Moderation Queue</h3>
            {pendingVideos.map((video) => (
              <div key={video._id} className="card p-4 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48 h-28 bg-dark-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PlayCircle size={32} className="text-dark-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{video.title}</h4>
                  <p className="text-sm text-dark-200 mb-2">by {video.athlete}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-dark-600 text-dark-100">{video.category}</span>
                    <span className="badge bg-dark-600 text-dark-100">{video.duration}</span>
                    <span className="text-xs text-dark-300">{video.uploadedAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <XCircle size={14} /> Reject
                    </button>
                    <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5">
                      <Eye size={14} /> Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Profile Claim Requests</h3>
              <span className="badge-gold">{pendingClaims.length} pending</span>
            </div>
            {pendingClaims.map((claim) => (
              <div key={claim._id} className="card p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4 sm:w-56 flex-shrink-0">
                  <img
                    src={claim.profileImage}
                    alt={claim.profileName}
                    className="w-14 h-14 rounded-full object-cover bg-dark-700"
                  />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{claim.profileName}</h4>
                    <p className="text-xs text-dark-300">Profile being claimed</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <p className="text-sm text-dark-100">
                      <span className="font-medium text-white">{claim.claimer.name}</span>
                      <span className="text-dark-300 ml-2">{claim.claimer.email}</span>
                    </p>
                  </div>
                  <p className="text-sm text-dark-200 mb-2 leading-relaxed">{claim.message}</p>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <a
                      href={claim.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-brand-gold hover:text-brand-gold-light transition-colors"
                    >
                      <ExternalLink size={14} />
                      {claim.proofUrl}
                    </a>
                    <span className="text-xs text-dark-300">{claim.requestedAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 bg-green-600 hover:bg-green-500">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Views This Month', value: '847.2K', change: '+12.5%', positive: true },
                { label: 'New Subscribers', value: '1,234', change: '+8.3%', positive: true },
                { label: 'Revenue', value: '$45,230', change: '+15.7%', positive: true },
              ].map((stat) => (
                <div key={stat.label} className="card p-5">
                  <p className="text-sm text-dark-200 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  <p className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} from last month
                  </p>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Views Over Time</h3>
              <div className="h-64 bg-dark-700 rounded-xl flex items-center justify-center">
                <div className="text-center text-dark-300">
                  <BarChart3 size={48} className="mx-auto mb-2" />
                  <p>Chart will render here</p>
                  <p className="text-xs">Integrate with Recharts or Chart.js</p>
                </div>
              </div>
            </div>

            {/* Top content */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <div className="p-4 border-b border-dark-600">
                  <h3 className="font-semibold">Top Videos This Week</h3>
                </div>
                <div className="divide-y divide-dark-700">
                  {['Championship KO Round 3', 'Training Montage: Road to Title', 'Behind the Scenes: Fight Week', 'Sparring: Lee vs Santos', 'Post-Fight Celebration'].map((title, i) => (
                    <div key={i} className="p-3 flex items-center gap-3">
                      <span className="text-lg font-bold text-dark-300 w-6 text-center">{i + 1}</span>
                      <div className="w-16 h-10 bg-dark-700 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{title}</p>
                        <p className="text-xs text-dark-200">{(Math.random() * 100).toFixed(1)}K views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="p-4 border-b border-dark-600">
                  <h3 className="font-semibold">Top Athletes This Week</h3>
                </div>
                <div className="divide-y divide-dark-700">
                  {[
                    { name: 'Sarah "Thunder" Williams', followers: '45.2K' },
                    { name: 'Maria Santos', followers: '38.7K' },
                    { name: 'Kim "Dragon" Lee', followers: '32.1K' },
                    { name: 'Aisha Johnson', followers: '28.9K' },
                    { name: 'Elena Volkov', followers: '24.3K' },
                  ].map((athlete, i) => (
                    <div key={i} className="p-3 flex items-center gap-3">
                      <span className="text-lg font-bold text-dark-300 w-6 text-center">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-dark-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{athlete.name}</p>
                        <p className="text-xs text-dark-200">{athlete.followers} followers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="card">
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="font-semibold">All Videos ({dashboardStats.totalVideos.toLocaleString()})</h3>
              <div className="flex gap-2">
                <select className="input-field py-2 text-sm w-32">
                  <option>All Categories</option>
                  <option>Fights</option>
                  <option>Highlights</option>
                  <option>Training</option>
                  <option>Shorts</option>
                </select>
                <select className="input-field py-2 text-sm w-32">
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                </select>
              </div>
            </div>
            <div className="divide-y divide-dark-700">
              {pendingVideos.concat(pendingVideos).map((video, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <div className="w-24 h-14 bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <PlayCircle size={16} className="text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-dark-200">{video.athlete} &middot; {video.duration} &middot; {video.uploadedAt}</p>
                  </div>
                  <span className="badge bg-dark-600 text-dark-100 text-xs">{video.category}</span>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 hover:text-white"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-200 hover:text-red-400"><XCircle size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Events Management</h3>
              <button className="btn-primary text-sm py-2">+ Create Event</button>
            </div>
            {[
              { title: 'COMBAT GIRLS Championship Night', date: 'Apr 25, 2026', status: 'upcoming', fighters: 6 },
              { title: 'Friday Night Fights Vol. 12', date: 'Apr 18, 2026', status: 'upcoming', fighters: 5 },
              { title: 'Rising Stars Tournament', date: 'Apr 10, 2026', status: 'live', fighters: 8 },
              { title: 'Battle of Champions III', date: 'Mar 28, 2026', status: 'completed', fighters: 6 },
            ].map((event, i) => (
              <div key={i} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-40 h-24 bg-dark-700 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Calendar size={24} className="text-dark-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    {event.status === 'live' && <span className="badge-live text-xs">LIVE</span>}
                  </div>
                  <p className="text-sm text-dark-200">{event.date} &middot; {event.fighters} fights</p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    event.status === 'live' ? 'bg-brand-red/20 text-brand-red-light' :
                    event.status === 'upcoming' ? 'bg-blue-400/20 text-blue-400' :
                    'bg-dark-600 text-dark-200'
                  }`}>
                    {event.status}
                  </span>
                  <button className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
