import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Calendar, MoreHorizontal, Bell, Clock, MessageCircle, Heart, Check, HelpCircle, Plus, X, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient, type UserProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  dashboardUser,
  dashboardStats as mockStats,
  dashboardAnnouncements,
  dashboardJobApplications,
  upcomingEvents,
  dashboardProjectFundings,
  mockCredentials,
  dashboardPosts
} from '@/data/mockData';
import PostModal from '@/components/posts/PostModal';

// Define types for dashboard data
interface DashboardStats {
  jobsApplied: number;
  events: number;
  mentorships: number;
}

interface Announcement {
  id: number;
  title: string;
  description: string;
  time: string;
}

interface JobApplication {
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Rejected';
  date: string;
}

interface Event {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  userRsvpStatus?: string | null;
}

interface ProjectFunding {
  title: string;
  amount: string;
  status: 'Approved' | 'Pending' | 'In Review';
  date: string;
}

import MotionWrapper from '@/components/ui/MotionWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
  console.log('Dashboard component mounting...');
  const { user } = useAuth();
  console.log('User from auth:', user);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<any | null>(null);
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats | null;
    announcements: Announcement[];
    jobApplications: JobApplication[];
    events: Event[];
    fundings: ProjectFunding[];
  }>({
    stats: null,
    announcements: [],
    jobApplications: [],
    events: [],
    fundings: []
  });

  const [dataUpdateKey, setDataUpdateKey] = useState(0); // Force re-render

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data... Loading state:', loading);
    // Check if logged in as mock user
    if (user?.email === mockCredentials.email) {
      console.log('Mock user detected, using mock data');
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDashboardData({
        stats: {
          jobsApplied: parseInt(mockStats.find(s => s.label === 'Jobs Applied')?.value || '0'),
          events: parseInt(mockStats.find(s => s.label === 'Events')?.value || '0'),
          mentorships: parseInt(mockStats.find(s => s.label === 'Mentorships')?.value || '0')
        },
        announcements: dashboardAnnouncements,
        jobApplications: dashboardJobApplications as JobApplication[],
        events: upcomingEvents.map((e, i) => ({ ...e, id: `mock-${i}` })),
        fundings: dashboardProjectFundings as ProjectFunding[]
      });
      
      setUserProfile({
          ...user,
          firstName: 'Test',
          lastName: 'User',
          headline: 'Mock User Role',
          id: 'mock-id',
          email: mockCredentials.email,
          profileComplete: true,
          profilePicture: null,
          resumeUrl: null
      } as UserProfile);

      setLoading(false);
      return;
    }

    // Real user - fetch from API using simple approach like Events page
    try {
      console.log('Real user detected, fetching events and announcements...');
      
      // Force fresh API calls with cache-busting
      const timestamp = Date.now();
      console.log('=== FORCE FRESH API CALLS ===');
      
      // Fetch events and announcements (both working)
      const [events, announcements, postsData] = await Promise.all([
        apiClient.getAllEvents(),
        apiClient.getAnnouncements(),
        apiClient.getAllPosts().catch(() => []) // Fallback to empty array if posts fail
      ]);
      
      console.log('Events fetched successfully:', events);
      console.log('Announcements fetched successfully:', announcements);
      console.log('Posts fetched successfully:', postsData);
      
      // Set posts state
      setPosts(postsData);
      console.log('Posts fetched and set:', postsData);
      
      // Set events and announcements in dashboard data
      setDashboardData(prev => ({
        ...prev,
        events: events,
        announcements: announcements
      }));
      
      console.log('Dashboard events and announcements updated');
      
      // Force re-render
      setDataUpdateKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Monitor dashboardData changes
  useEffect(() => {
    console.log('dashboardData state changed:', dashboardData);
    console.log('dashboardData.events:', dashboardData.events);
  }, [dashboardData]);

  // Refresh data when page becomes visible (navigation back from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleCommentClick = async (postId: string) => {
    setCommentingPostId(commentingPostId === postId ? null : postId);
    setCommentText('');
    
    // Fetch comments when opening comment section
    if (commentingPostId !== postId) {
      try {
        const postComments = await apiClient.getCommentsByPostId(postId);
        setComments(prev => ({ ...prev, [postId]: postComments }));
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      // Create comment via API
      const newComment = await apiClient.createComment({
        postId: postId,
        content: commentText.trim()
      });
      
      // Update local comments state
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      // Update post comment count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 }
          : post
      ));
      
      toast({ title: "Comment added", description: "Your comment has been posted." });
      setCommentText('');
      setCommentingPostId(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({ title: "Error", description: "Failed to add comment. Please try again.", variant: "destructive" });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const updatedPost = await apiClient.toggleLikePost(postId);
      
      // Update posts state with new like status and count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: updatedPost.isLiked, 
              likes: updatedPost.likes 
            }
          : post
      ));
      
      toast({ 
        title: updatedPost.isLiked ? "Post liked" : "Post unliked", 
        description: updatedPost.isLiked ? "You liked this post" : "You unliked this post" 
      });
    } catch (error) {
      console.error('Failed to like post:', error);
      toast({ title: "Error", description: "Failed to like post. Please try again.", variant: "destructive" });
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setIsNewPostModalOpen(true);
  };

  const handleDeletePost = async (post: any) => {
    try {
      await apiClient.deletePost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toast({ title: "Post deleted", description: "Your post has been deleted successfully." });
      setDeleteConfirmPost(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({ title: "Error", description: "Failed to delete post. Please try again.", variant: "destructive" });
    }
  };

  // Also refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window gained focus, refreshing dashboard data...');
      fetchDashboardData();
      if (user) {
        fetchDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleRsvp = async (eventId: string, status: string) => {
    try {
      await apiClient.rsvpEvent(eventId, status);
      toast({ title: "RSVP Updated", description: `You are now ${status.toLowerCase().replace('_', ' ')}.` });
      setActiveEventId(null);
      
      setDashboardData(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId 
            ? { ...event, userRsvpStatus: status } 
            : event
        )
      }));
    } catch (error) {
      toast({ title: "Error", description: "Failed to update RSVP.", variant: "destructive" });
    }
  };

  // Use real user data or fallback to mock data
  const isMockUser = user?.email === mockCredentials.email;
  
  const currentUser = userProfile ? {
    name: `${userProfile.firstName} ${userProfile.lastName}`,
    role: userProfile.headline || 'Alumni',
    initials: `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase(),
    avatar: userProfile.profilePicture ? `http://localhost:8080/${userProfile.profilePicture}` : null
  } : isMockUser ? dashboardUser : {
    name: user ? `${user.firstName} ${user.lastName}` : 'User',
    role: user?.headline || 'Alumni Member',
    initials: user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U',
    avatar: user?.profilePicture ? `http://localhost:8080/${user.profilePicture}` : null
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-50 text-gray-800">
      <Helmet>
        <title>Dashboard - DSCE Alumni Connect</title>
      </Helmet>
      
      <MotionWrapper className="p-6 pt-24 max-w-[1600px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Welcome back, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-gray-700">Here's what's happening with your network today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                console.log('🔄 Manual refresh clicked - fetching fresh data');
                // Clear posts state to force fresh fetch
                setPosts([]);
                // Fetch fresh data
                fetchDashboardData();
                toast({ title: "Refreshing", description: "Updating dashboard data..." });
              }}
              className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10"
              title="Refresh Dashboard"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </Button>
            <div className="relative">
               <Bell className="h-6 w-6 text-gray-600 hover:text-dsce-blue cursor-pointer transition-colors" />
               <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-dsce-bg-light"></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Active Applications (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 text-center relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4 text-gray-600 hover:text-dsce-blue cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <div className="relative mx-auto mb-4 h-24 w-24">
                <div className="absolute inset-0 bg-dsce-blue/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full w-full rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue p-[2px]">
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {currentUser.initials}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center">
                   <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-dsce-text-dark">{currentUser.name}</h3>
              <p className="text-sm text-gray-600 mb-6">{currentUser.role}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-6 border-t border-dsce-blue/10 pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-dsce-blue">{dashboardData.stats?.jobsApplied ?? '-'}</div>
                  <div className="text-xs text-gray-600">Applied</div>
                </div>
                <div className="text-center border-l border-dsce-blue/10">
                  <div className="text-lg font-bold text-dsce-blue">-</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center border-l border-dsce-blue/10">
                  <div className="text-lg font-bold text-dsce-blue">{dashboardData.stats?.events ?? '-'}</div>
                  <div className="text-xs text-gray-600">Events</div>
                </div>
              </div>
              <Link to="/dashboard/profile">
              <Button className="w-full rounded-full bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover transition-all font-semibold">
                View Profile
              </Button>
              </Link>
            </div>

            {/* Active Applications */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
               <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Active Applications</h3>
                 <div className="flex -space-x-2">
                   {/* Dynamic avatars or nothing if empty */}
                 </div>
              </div>
              
              <div className="space-y-4">
                {dashboardData.jobApplications.length > 0 ? (
                  dashboardData.jobApplications.map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-dsce-blue/10 hover:border-dsce-light-blue/50 transition-colors group shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-dsce-blue/10 flex items-center justify-center text-lg font-bold text-dsce-blue">
                        {job.company[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dsce-text-dark">{job.role}</h4>
                        <p className="text-xs text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Interview' ? 'bg-dsce-gold/20 text-dsce-blue' :
                      job.status === 'Applied' ? 'bg-dsce-light-blue/20 text-dsce-blue' :
                      'bg-red-500/20 text-red-700'
                    }`}>
                      {job.status}
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No active applications.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Posts, Events & Fundings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Latest Posts Section */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Latest Posts</h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsNewPostModalOpen(true)}
                    className="flex items-center text-sm bg-dsce-blue/10 hover:bg-dsce-blue/20 text-dsce-blue px-3 py-1.5 rounded-full transition-colors font-medium"
                  >
                    <Plus className="w-3 h-3 mr-1.5" /> New Post
                  </button>
                  <Link to="/dashboard/posts" className="text-sm text-dsce-blue hover:text-dsce-light-blue transition-colors font-medium">
                    See all
                  </Link>
                </div>
              </div>
              
              <div className="space-y-6">
                
                {posts.length > 0 ? (
                  posts.slice(0, 2).map((post) => (
                  <div key={post.id} className="pb-6 border-b border-dsce-blue/10 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3 mb-3">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center border border-gray-200">
                          <span className="text-white text-sm font-bold">
                            {post.authorName ? post.authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-bold text-dsce-text-dark">{post.authorName}</h4>
                            {post.graduationYear && (
                              <span className="inline-flex items-center px-2 py-1 bg-dsce-blue/10 text-dsce-blue text-xs font-medium rounded-full">
                                Class of {post.graduationYear}
                              </span>
                            )}
                          </div>
                          {post.isAuthor && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="text-gray-500 hover:text-dsce-blue transition-colors"
                                title="Edit post"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmPost(post)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                title="Delete post"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {post.department && <span>{post.department}</span>}
                          {post.department && post.authorRole && <span>•</span>}
                          {post.authorRole && <span>{post.authorRole}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-auto">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Post Media/Images */}
                    {post.media && post.media.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-3">
                          {post.media.map((mediaUrl: string, index: number) => (
                            <div key={`${post.id}-media-${index}`} className="relative group">
                              <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                                <img 
                                  src={mediaUrl} 
                                  alt={`Post image ${index + 1}`} 
                                  className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                  onClick={() => window.open(mediaUrl, '_blank')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Post Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {post.hashtags.map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm px-3 py-1.5 rounded-full hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-pointer border border-blue-200"
                              onClick={() => console.log('Hashtag clicked:', tag)}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                                        
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          post.isLiked 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs">{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleCommentClick(post.id)}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          commentingPostId === post.id 
                            ? 'text-dsce-blue' 
                            : 'text-gray-500 hover:text-dsce-blue'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-xs">{post.comments}</span>
                      </button>
                    </div>

                    {/* Comment Section */}
                    {commentingPostId === post.id && (
                      <div className="border-t border-dsce-blue/10 pt-4 mt-4">
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">
                              {currentUser.initials}
                            </span>
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a comment..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-dsce-blue/50 text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={() => {
                                  setCommentingPostId(null);
                                  setCommentText('');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!commentText.trim()}
                                className="px-3 py-1 text-sm bg-dsce-blue hover:bg-dsce-blue/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Comment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Comments List */}
                    {comments[post.id] && comments[post.id].length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Comments ({comments[post.id].length})
                        </div>
                        {comments[post.id].map((comment) => (
                          <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              {comment.authorAvatar ? (
                                <img 
                                  src={comment.authorAvatar} 
                                  alt={comment.authorName} 
                                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center border border-gray-200">
                                  <span className="text-white text-xs font-bold">
                                    {comment.authorName ? comment.authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AL'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                                  {comment.authorRole && (
                                    <span className="text-xs text-gray-500">• {comment.authorRole}</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No posts to display.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Announcements, Events & Fundings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Announcements Section */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Announcements</h3>
                <Link to="/dashboard/announcements" className="text-sm text-dsce-blue hover:text-dsce-light-blue transition-colors font-medium">
                  See all
                </Link>
              </div>
              <div className="space-y-6">
                {dashboardData.announcements.length > 0 ? (
                  dashboardData.announcements.map((item) => (
                  <div key={item.id} className="relative pl-4 border-l-2 border-dsce-blue/10 hover:border-dsce-light-blue transition-colors">
                    <h4 className="text-sm font-semibold text-dsce-text-dark">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    <span className="text-[10px] text-dsce-blue mt-2 block">{item.time}</span>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No announcements.
                  </div>
                )}
              </div>
            </div>

            {/* Your RSVP'd Events */}
            {dashboardData.events.some(event => event.userRsvpStatus === 'GOING' || event.userRsvpStatus === 'MAYBE') && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-dsce-text-dark">Your Events</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {dashboardData.events.filter(event => event.userRsvpStatus === 'GOING' || event.userRsvpStatus === 'MAYBE').length}
                    </span>
                  </div>
                  <Link to="/dashboard/events">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-green-100">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {dashboardData.events
                    .filter(event => event.userRsvpStatus === 'GOING' || event.userRsvpStatus === 'MAYBE')
                    .slice(0, 2)
                    .map((event, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-green-100">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-dsce-text-dark truncate">{event.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-600">{event.day} {event.month}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              event.userRsvpStatus === 'GOING' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {event.userRsvpStatus?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">All Events</h3>
                <Link to="/dashboard/events">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10">
                    <Calendar className="h-4 w-4 text-gray-600" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-6" key={`events-${dataUpdateKey}`}>
                {dashboardData.events.length > 0 ? (
                  dashboardData.events.slice(0, 3).map((event) => (
                    <div key={`${event.id}-${dataUpdateKey}`} className="flex items-start group relative">
                    <div className="w-14 text-center mr-4 pt-1">
                      <div className="text-xs text-gray-600 uppercase">{event.month}</div>
                      <div className="text-lg font-bold text-dsce-blue">{event.day}</div>
                    </div>
                    <div className="flex-1 pb-6 border-b border-dsce-blue/10 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-dsce-text-dark group-hover:text-dsce-light-blue transition-colors">{event.title}</h4>
                      <div className="flex items-center mt-1 space-x-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.time?.split(' - ')[0] || event.time}
                        </div>
                        {event.userRsvpStatus && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            event.userRsvpStatus === 'GOING' ? 'bg-green-100 text-green-700' :
                            event.userRsvpStatus === 'MAYBE' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.userRsvpStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="self-center -ml-4 relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setActiveEventId(activeEventId === event.id ? null : event.id)}
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </Button>
                      
                      <AnimatePresence>
                        {activeEventId === event.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-8 z-50 w-40 bg-white rounded-xl shadow-xl border border-dsce-blue/10 p-2"
                          >
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Update RSVP</div>
                            <button 
                              onClick={() => handleRsvp(event.id, 'GOING')}
                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-lg flex items-center"
                            >
                              <Check className="w-3 h-3 mr-2" /> Going
                            </button>
                            <button 
                              onClick={() => handleRsvp(event.id, 'MAYBE')}
                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 rounded-lg flex items-center"
                            >
                              <HelpCircle className="w-3 h-3 mr-2" /> Maybe
                            </button>
                            <button 
                              onClick={() => handleRsvp(event.id, 'NOT_GOING')}
                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-lg flex items-center"
                            >
                              <X className="w-3 h-3 mr-2" /> Not Going
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No upcoming events.
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-dsce-blue/10 text-center">
                <Link to="/dashboard/events" className="text-sm text-dsce-blue hover:text-dsce-light-blue transition-colors flex items-center justify-center w-full">
                  See all events <MoreHorizontal className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Project Fundings */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Project Fundings</h3>
              </div>
              <div className="space-y-5">
                {dashboardData.fundings.length > 0 ? (
                  dashboardData.fundings.map((project, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-dsce-text-dark">{project.title}</span>
                      <span className="text-gray-600">{project.amount}</span>
                    </div>
                    <div className="h-2 w-full bg-dsce-blue/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          project.status === 'Approved' ? 'bg-green-500 w-full' :
                          project.status === 'Pending' ? 'bg-dsce-gold w-[60%]' :
                          'bg-dsce-light-blue w-[40%]'
                        }`}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                       <span className={`text-[10px] uppercase font-bold ${
                          project.status === 'Approved' ? 'text-green-600' :
                          project.status === 'Pending' ? 'text-dsce-blue' :
                          'text-dsce-blue'
                       }`}>{project.status}</span>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No project fundings.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </MotionWrapper>


      {/* New Post Modal */}
      <PostModal
        isOpen={isNewPostModalOpen}
        onClose={() => {
          setIsNewPostModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={async (content, media, hashtags) => {
          console.log('PostModal onSubmit called with:', { content, media, hashtags }); // Debug log
          try {
            if (editingPost) {
              // Update existing post
              await apiClient.updatePost(editingPost.id, { content, media, hashtags });
              toast({ title: "Post Updated", description: "Your post has been updated successfully!" });
            } else {
              // Create new post
              await apiClient.createPost({ content, media, hashtags });
              toast({ title: "Post Created", description: "Your post has been shared successfully!" });
            }
            setNewPostContent('');
            setIsNewPostModalOpen(false);
            // Refresh posts to show changes
            fetchDashboardData();
          } catch (error) {
            console.error('Failed to save post:', error);
            toast({ 
              title: "Error", 
              description: `Failed to ${editingPost ? 'update' : 'create'} post. Please try again.`, 
              variant: "destructive" 
            });
          }
        }}
        initialPost={editingPost ? {
          id: editingPost.id,
          content: editingPost.content,
          media: editingPost.media,
          hashtags: editingPost.hashtags
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmPost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirmPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Post</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteConfirmPost(null)}
                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePost(deleteConfirmPost)}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
