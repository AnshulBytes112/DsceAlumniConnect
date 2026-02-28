import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MessageSquare, Plus, Search, Users, Hash, Lock, Unlock, 
    TrendingUp, Clock, Folder, MoreHorizontal
} from 'lucide-react';
import { apiClient, type DiscussionGroup } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/use-toast';
import MotionWrapper from '@/components/ui/MotionWrapper';

const categories = [
    { id: 'all', name: 'All Forums', icon: Folder },
    { id: 'Career', name: 'Career', icon: TrendingUp },
    { id: 'Technology', name: 'Technology', icon: Hash },
    { id: 'General', name: 'General', icon: MessageSquare },
    { id: 'Department', name: 'Department', icon: Users },
];

const ForumList = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [groups, setGroups] = useState<DiscussionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        category: 'General',
        isPrivate: false
    });

    useEffect(() => {
        fetchGroups();
    }, [selectedCategory, searchQuery]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const category = selectedCategory === 'all' ? undefined : selectedCategory;
            const search = searchQuery || undefined;
            const data = await apiClient.getAllDiscussionGroups(category, search);
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch discussion groups:', error);
            toast({
                title: 'Error',
                description: 'Failed to load discussion forums',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async () => {
        try {
            await apiClient.createDiscussionGroup(newGroup);
            toast({
                title: 'Success',
                description: 'Discussion forum created successfully'
            });
            setIsCreateModalOpen(false);
            setNewGroup({ name: '', description: '', category: 'General', isPrivate: false });
            fetchGroups();
        } catch (error) {
            console.error('Failed to create group:', error);
            toast({
                title: 'Error',
                description: 'Failed to create forum',
                variant: 'destructive'
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-gray-50">
            <Helmet>
                <title>Discussion Forums - DSCE Alumni Connect</title>
            </Helmet>

            <MotionWrapper className="p-6 pt-24 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900">Discussion Forums</h1>
                            <p className="text-gray-600 mt-1">Join conversations with fellow alumni</p>
                        </div>
                        <Button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Forum
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search forums..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-blue-900 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Forums Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">No forums found</h3>
                        <p className="text-gray-500 mt-2">Be the first to create a discussion forum!</p>
                        <Button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 bg-blue-900 text-white"
                        >
                            Create Forum
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <motion.div
                                key={group.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => navigate(`/dashboard/forums/${group.id}`)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: group.color || '#E0E7FF' }}
                                            >
                                                {group.icon || '💬'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{group.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    {group.isPrivate ? (
                                                        <Lock className="w-3 h-3" />
                                                    ) : (
                                                        <Unlock className="w-3 h-3" />
                                                    )}
                                                    <span>{group.isPrivate ? 'Private' : 'Public'}</span>
                                                    {group.category && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{group.category}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                        {group.description || 'No description provided'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{group.memberCount} members</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="w-4 h-4" />
                                            <span>{group.topicCount} topics</span>
                                        </div>
                                    </div>

                                    {group.lastTopicTitle && (
                                        <div className="border-t pt-3">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Last active {formatDate(group.lastPostAt || '')}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 truncate">
                                                {group.lastTopicTitle}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </MotionWrapper>

            {/* Create Forum Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Create New Forum</h2>
                            <button onClick={() => setIsCreateModalOpen(false)}>
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Forum Name *
                                </label>
                                <Input
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    placeholder="e.g., Computer Science Alumni"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    placeholder="What is this forum about?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={newGroup.category}
                                    onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="General">General</option>
                                    <option value="Career">Career</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Department">Department</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={newGroup.isPrivate}
                                    onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isPrivate" className="text-sm text-gray-700">
                                    Make this a private forum (members only)
                                </label>
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
                                    onClick={handleCreateGroup}
                                    disabled={!newGroup.name.trim()}
                                >
                                    Create Forum
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ForumList;
