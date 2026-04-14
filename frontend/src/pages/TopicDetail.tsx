import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, ArrowLeft, Lock, Heart, 
    Trash2, Edit, Send, User
} from 'lucide-react';
import { apiClient, type DiscussionTopic, type DiscussionPost, type DiscussionGroup } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';

const TopicDetail = () => {
    const { groupId, topicId } = useParams<{ groupId: string; topicId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const postsEndRef = useRef<HTMLDivElement>(null);
    
    const [topic, setTopic] = useState<DiscussionTopic | null>(null);
    const [group, setGroup] = useState<DiscussionGroup | null>(null);
    const [posts, setPosts] = useState<DiscussionPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isMember, setIsMember] = useState(false);

    const { isConnected: isWebSocketConnected } = useWebSocket({
        topicId: topicId,
        groupId: groupId,
        onMessage: (message) => {
            console.log('WebSocket message received:', message);
            
            switch (message.type) {
                case 'NEW_POST':
                    const newPost = message.payload as DiscussionPost;
                    setPosts(prev => {
                        if (prev.find(p => p.id === newPost.id)) return prev;
                        return [...prev, newPost];
                    });
                    setTopic(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
                    setTimeout(() => postsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    break;
                    
                case 'EDIT_POST':
                    const editedPost = message.payload as DiscussionPost;
                    setPosts(prev => prev.map(p => p.id === editedPost.id ? editedPost : p));
                    break;
                    
                case 'DELETE_POST':
                    const deletedId = message.payload.id;
                    setPosts(prev => prev.filter(p => p.id !== deletedId));
                    setTopic(prev => prev ? { ...prev, replyCount: Math.max(0, prev.replyCount - 1) } : null);
                    break;
                    
                case 'LIKE_POST':
                    const { id: postId, likeCount } = message.payload;
                    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount } : p));
                    break;
                    
                case 'LIKE_TOPIC':
                    setTopic(prev => prev ? { ...prev, likeCount: message.payload.likeCount } : null);
                    break;
            }
        },
    });

    useEffect(() => {
        if (topicId && groupId) {
            fetchData();
        }
    }, [topicId, groupId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [topicData, postsData, groupData] = await Promise.all([
                apiClient.getDiscussionTopicById(topicId!),
                apiClient.getPostsByTopic(topicId!),
                apiClient.getDiscussionGroupById(groupId!)
            ]);
            setTopic(topicData);
            setPosts(postsData);
            setGroup(groupData);
            
            if (user && groupData.members) {
                setIsMember(groupData.members.includes(user.id));
            }
        } catch (error) {
            console.error('Failed to fetch topic data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load topic data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        
        try {
            const savedPost = await apiClient.createDiscussionPost({
                topicId: topicId!,
                content: newPostContent.trim()
            });
            setNewPostContent('');
            setPosts(prev => {
                if (prev.find(p => p.id === savedPost.id)) return prev;
                return [...prev, savedPost];
            });
            setTopic(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
            setTimeout(() => postsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (error) {
            console.error('Failed to create post:', error);
            toast({
                title: 'Error',
                description: 'Failed to create post',
                variant: 'destructive'
            });
        }
    };

    const handleEditPost = (post: DiscussionPost) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const handleUpdatePost = async () => {
        if (!editContent.trim() || !editingPostId) return;
        
        try {
            const updatedPost = await apiClient.updateDiscussionPost(editingPostId, {
                content: editContent.trim()
            });
            setEditingPostId(null);
            setEditContent('');
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
            toast({
                title: 'Success',
                description: 'Post updated successfully'
            });
        } catch (error) {
            console.error('Failed to update post:', error);
            toast({
                title: 'Error',
                description: 'Failed to update post',
                variant: 'destructive'
            });
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await apiClient.deleteDiscussionPost(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
            setTopic(prev => prev ? { ...prev, replyCount: Math.max(0, prev.replyCount - 1) } : null);
            toast({
                title: 'Success',
                description: 'Post deleted successfully'
            });
        } catch (error) {
            console.error('Failed to delete post:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete post',
                variant: 'destructive'
            });
        }
    };

    const handleLikePost = async (postId: string) => {
        try {
            const result = await apiClient.likeDiscussionPost(postId);
            const isLiked = result.isLiked;
            const likeCount = result.likeCount;
            const userId = user?.id;
            setPosts(prev => prev.map(p => {
                if (p.id !== postId) return p;
                const likedBy = userId
                    ? isLiked 
                        ? [...(p.likedBy || []), userId]
                        : (p.likedBy || []).filter(id => id !== userId)
                    : p.likedBy;
                return { ...p, likeCount, likedBy };
            }));
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    const handleLockTopic = async () => {
        try {
            const result = await apiClient.lockDiscussionTopic(topicId!);
            setTopic(prev => prev ? { ...prev, isLocked: !prev.isLocked } : null);
            toast({
                title: 'Success',
                description: result.message
            });
        } catch (error) {
            console.error('Failed to lock topic:', error);
            toast({
                title: 'Error',
                description: 'Failed to lock topic',
                variant: 'destructive'
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const isGroupCreator = group?.createdBy === user?.id;
    const isModerator = group?.moderators?.includes(user?.id || '');
    const canModerate = isGroupCreator || isModerator;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dsce-blue"></div>
            </div>
        );
    }

    if (!topic || !group) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Topic not found</h3>
                    <Button onClick={() => navigate(-1)} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light">
            <Helmet>
                <title>{topic.title} - Discussion</title>
            </Helmet>

            <MotionWrapper className="p-6 pt-24 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <button 
                        onClick={() => navigate('/dashboard/forums')}
                        className="flex items-center gap-1 hover:text-dsce-blue"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Forums
                    </button>
                    <span>/</span>
                    <button 
                        onClick={() => navigate(`/dashboard/forums/${groupId}`)}
                        className="hover:text-dsce-blue"
                    >
                        {group.name}
                    </button>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-xs">{topic.title}</span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900">{topic.title}</h1>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                                <span>{topic.authorName}</span>
                                <span>•</span>
                                <span>{formatDate(topic.createdAt)}</span>
                                {topic.isLocked && (
                                    <>
                                        <span>•</span>
                                        <Lock className="w-3 h-3" />
                                        <span>Locked</span>
                                    </>
                                )}
                                <span>•</span>
                                <span>{topic.viewCount} views</span>
                            </div>
                            
                            {topic.content && (
                                <p className="mt-4 text-gray-700 whitespace-pre-wrap">{topic.content}</p>
                            )}

                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={() => handleLikePost(topicId!)}
                                    className={`flex items-center gap-1 text-sm ${
                                        topic.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                    }`}
                                >
                                    <Heart className={`w-4 h-4 ${topic.likedBy?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                    <span>{topic.likeCount}</span>
                                </button>
                                
                                {canModerate && (
                                    <button
                                        onClick={handleLockTopic}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-dsce-blue"
                                    >
                                        <Lock className="w-4 h-4" />
                                        {topic.isLocked ? 'Unlock' : 'Lock'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isWebSocketConnected && (
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Real-time updates active</span>
                    </div>
                )}

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
                    </h2>

                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-white rounded-xl border border-gray-200 p-5"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        {post.authorAvatar ? (
                                            <img 
                                                src={post.authorAvatar} 
                                                alt={post.authorName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{post.authorName}</span>
                                                {post.authorRole && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                        {post.authorRole}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(post.createdAt)}
                                                </span>
                                                {post.updatedAt !== post.createdAt && (
                                                    <span className="text-xs text-gray-400">(edited)</span>
                                                )}
                                            </div>
                                            
                                            {(post.authorId === user?.id || canModerate) && (
                                                <div className="flex gap-1">
                                                    {post.authorId === user?.id && (
                                                        <button
                                                            onClick={() => handleEditPost(post)}
                                                            className="p-1 hover:bg-gray-100 rounded"
                                                        >
                                                            <Edit className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {editingPostId === post.id ? (
                                            <div className="mt-3">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-dsce-blue placeholder-gray-500"
                                                    rows={3}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleUpdatePost}
                                                        disabled={!editContent.trim()}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingPostId(null);
                                                            setEditContent('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{post.content}</p>
                                                
                                                <div className="flex items-center gap-4 mt-3">
                                                    <button
                                                        onClick={() => handleLikePost(post.id)}
                                                        className={`flex items-center gap-1 text-sm ${
                                                            post.likedBy?.includes(user?.id || '') ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                                        }`}
                                                    >
                                                        <Heart className={`w-4 h-4 ${post.likedBy?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                                        <span>{post.likeCount}</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={postsEndRef} />
                </div>

                {isMember && !topic.isLocked && (
                    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">Post a Reply</h3>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <textarea
                                                    value={newPostContent}
                                                    onChange={(e) => setNewPostContent(e.target.value)}
                                                    placeholder="Share your thoughts..."
                                                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-dsce-blue placeholder-gray-500"
                                                    rows={4}
                                                />
                                <div className="flex justify-end mt-3">
                                    <Button
                                        type="button"
                                        onClick={handleCreatePost}
                                        disabled={!newPostContent.trim()}
                                        className="bg-dsce-blue text-white hover:bg-dsce-blue/90"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Post Reply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {topic.isLocked && (
                    <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
                        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">This topic is locked. No new replies can be added.</p>
                    </div>
                )}

                {!isMember && !topic.isLocked && (
                    <div className="mt-6 bg-yellow-50 rounded-xl border border-yellow-200 p-5 text-center">
                        <p className="text-gray-700 mb-3">Join this forum to participate in the discussion</p>
                        <Button onClick={async () => {
                            await apiClient.joinDiscussionGroup(groupId!);
                            fetchData();
                            toast({ title: 'Success', description: 'You have joined the forum' });
                        }}>
                            Join Forum
                        </Button>
                    </div>
                )}
            </MotionWrapper>
        </div>
    );
};

export default TopicDetail;
