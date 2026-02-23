import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MessageSquare, Plus, ArrowLeft, Users, Lock, Unlock, Hash,
    Clock, Eye, Heart, MoreHorizontal, Pin, PinOff, Lock as LockIcon,
    Trash2, User
} from 'lucide-react';
import { apiClient, type DiscussionGroup, type DiscussionTopic } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useAuth } from '@/contexts/AuthContext';

const ForumDetail = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [group, setGroup] = useState<DiscussionGroup | null>(null);
    const [topics, setTopics] = useState<DiscussionTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'activity' | 'newest'>('activity');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [newTopic, setNewTopic] = useState({
        title: '',
        content: '',
        tags: [] as string[]
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (groupId) {
            fetchGroupAndTopics();
        }
    }, [groupId, sortBy]);

    const fetchGroupAndTopics = async () => {
        try {
            setLoading(true);
            const [groupData, topicsData] = await Promise.all([
                apiClient.getDiscussionGroupById(groupId!),
                apiClient.getTopicsByGroup(groupId!, sortBy)
            ]);
            setGroup(groupData);
            setTopics(topicsData);
            
            // Check if current user is a member
            if (user && groupData.members) {
                setIsMember(groupData.members.includes(user.id));
            }
        } catch (error) {
            console.error('Failed to fetch forum data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load forum data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        try {
            await apiClient.joinDiscussionGroup(groupId!);
            toast({
                title: 'Success',
                description: 'You have joined the forum'
            });
            fetchGroupAndTopics();
        } catch (error) {
            console.error('Failed to join group:', error);
            toast({
                title: 'Error',
                description: 'Failed to join forum',
                variant: 'destructive'
            });
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await apiClient.leaveDiscussionGroup(groupId!);
            toast({
                title: 'Success',
                description: 'You have left the forum'
            });
            fetchGroupAndTopics();
        } catch (error) {
            console.error('Failed to leave group:', error);
            toast({
                title: 'Error',
                description: 'Failed to leave forum',
                variant: 'destructive'
            });
        }
    };

    const handleCreateTopic = async () => {
        try {
            await apiClient.createDiscussionTopic({
                groupId: groupId!,
                title: newTopic.title,
                content: newTopic.content,
                tags: newTopic.tags
            });
            toast({
                title: 'Success',
                description: 'Topic created successfully'
            });
            setIsCreateModalOpen(false);
            setNewTopic({ title: '', content: '', tags: [] });
            fetchGroupAndTopics();
        } catch (error) {
            console.error('Failed to create topic:', error);
            toast({
                title: 'Error',
                description: 'Failed to create topic',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteTopic = async (topicId: string) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;
        
        try {
            await apiClient.deleteDiscussionTopic(topicId);
            toast({
                title: 'Success',
                description: 'Topic deleted successfully'
            });
            fetchGroupAndTopics();
        } catch (error) {
            console.error('Failed to delete topic:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete topic',
                variant: 'destructive'
            });
        }
    };

    const handlePinTopic = async (topicId: string) => {
        try {
            const result = await apiClient.pinDiscussionTopic(topicId);
            toast({
                title: 'Success',
                description: result.message
            });
            fetchGroupAndTopics();
        } catch (error) {
            console.error('Failed to pin topic:', error);
            toast({
                title: 'Error',
                description: 'Failed to pin topic',
                variant: 'destructive'
            });
        }
    };

    const handleLikeTopic = async (e: React.MouseEvent, topicId: string) => {
        e.stopPropagation();
        try {
            await apiClient.likeDiscussionTopic(topicId);
            fetchGroupAndTopics();
        } catch (error) {
            console.error('Failed to like topic:', error);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !newTopic.tags.includes(tagInput.trim())) {
            setNewTopic({ ...newTopic, tags: [...newTopic.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNewTopic({ ...newTopic, tags: newTopic.tags.filter(tag => tag !== tagToRemove) });
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">Forum not found</h3>
                    <Button onClick={() => navigate('/dashboard/forums')} className="mt-4">
                        Back to Forums
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-50">
            <Helmet>
                <title>{group.name} - Discussion Forum</title>
            </Helmet>

            <MotionWrapper className="p-6 pt-24 max-w-5xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/dashboard/forums')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forums
                </button>

                {/* Forum Header */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex gap-4">
                            <div 
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                                style={{ backgroundColor: group.color || '#E0E7FF' }}
                            >
                                {group.icon || '💬'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                                    {group.isPrivate ? (
                                        <Lock className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <Unlock className="w-4 h-4 text-gray-500" />
                                    )}
                                </div>
                                <p className="text-gray-600 mt-1">{group.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {group.memberCount} members
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="w-4 h-4" />
                                        {group.topicCount} topics
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Hash className="w-4 h-4" />
                                        {group.category || 'General'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {isMember ? (
                                <Button
                                    variant="outline"
                                    onClick={handleLeaveGroup}
                                    disabled={isGroupCreator}
                                >
                                    Leave Forum
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleJoinGroup}
                                    className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold"
                                >
                                    Join Forum
                                </Button>
                            )}
                            {isMember && (
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-blue-900 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Topic
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sort and Filter */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Topics</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('activity')}
                            className={`px-3 py-1 rounded-full text-sm ${
                                sortBy === 'activity'
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            Latest Activity
                        </button>
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`px-3 py-1 rounded-full text-sm ${
                                sortBy === 'newest'
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            Newest
                        </button>
                    </div>
                </div>

                {/* Topics List */}
                {topics.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">No topics yet</h3>
                        <p className="text-gray-500 mt-2">Be the first to start a discussion!</p>
                        {isMember && (
                            <Button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4 bg-blue-900 text-white"
                            >
                                Start a Topic
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topics.map((topic) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-xl border ${
                                    topic.isPinned ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-200'
                                } p-5 cursor-pointer hover:shadow-md transition-all`}
                                onClick={() => navigate(`/dashboard/forums/${groupId}/topics/${topic.id}`)}
                            >
                                <div className="flex items-start gap-4">
                                    {topic.isPinned && (
                                        <div className="text-yellow-500">
                                            <Pin className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600">
                                                    {topic.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{topic.authorName}</span>
                                                    <span>•</span>
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDate(topic.createdAt)}</span>
                                                    {topic.isLocked && (
                                                        <>
                                                            <span>•</span>
                                                            <LockIcon className="w-3 h-3" />
                                                            <span>Locked</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {canModerate && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePinTopic(topic.id);
                                                        }}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                        title={topic.isPinned ? 'Unpin' : 'Pin'}
                                                    >
                                                        {topic.isPinned ? (
                                                            <PinOff className="w-4 h-4 text-gray-500" />
                                                        ) : (
                                                            <Pin className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTopic(topic.id);
                                                        }}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            <button
                                                onClick={(e) => handleLikeTopic(e, topic.id)}
                                                className={`flex items-center gap-1 hover:text-red-500 ${
                                                    topic.likedBy?.includes(user?.id || '') ? 'text-red-500' : ''
                                                }`}
                                            >
                                                <Heart className={`w-4 h-4 ${topic.likedBy?.includes(user?.id || '') ? 'fill-current' : ''}`} />
                                                <span>{topic.likeCount}</span>
                                            </button>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                {topic.replyCount} replies
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {topic.viewCount} views
                                            </span>
                                        </div>

                                        {topic.tags && topic.tags.length > 0 && (
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                {topic.tags.map((tag, idx) => (
                                                    <span 
                                                        key={idx}
                                                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </MotionWrapper>

            {/* Create Topic Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Start New Topic</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}>
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newTopic.title}
                                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                    placeholder="What's on your mind?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content
                                </label>
                                <textarea
                                    value={newTopic.content}
                                    onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                                    placeholder="Provide more details..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={5}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Add a tag and press Enter"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button type="button" onClick={addTag} variant="outline">
                                        Add
                                    </Button>
                                </div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {newTopic.tags.map((tag, idx) => (
                                        <span 
                                            key={idx}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                                        >
                                            #{tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="flex-1 bg-blue-900 text-white"
                                    onClick={handleCreateTopic}
                                    disabled={!newTopic.title.trim()}
                                >
                                    Create Topic
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ForumDetail;
