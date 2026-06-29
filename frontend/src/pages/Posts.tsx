import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import PostModal from '@/components/posts/PostModal';

interface Post {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  department?: string;
  graduationYear?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares?: number;
  media?: string[];
  hashtags?: string[];
  isAuthor?: boolean;
  isLiked?: boolean;
}

export default function Posts() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<Post | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsData = await apiClient.getAllPosts();
      // Transform PostResponse to Post interface
      const transformedPosts = postsData.map(post => ({
        ...post,
        graduationYear: post.graduationYear?.toString()
      }));
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (content: string, media: string[], hashtags: string[]) => {
    try {
      const newPost = await apiClient.createPost({
        content,
        media,
        hashtags
      });
      // Transform PostResponse to Post interface
      const transformedPost = {
        ...newPost,
        graduationYear: newPost.graduationYear?.toString()
      };
      setPosts(prev => [{ ...transformedPost } as Post, ...prev]);
      toast({
        title: "Success",
        description: "Your post has been published!"
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePost = async (content: string, media: string[], hashtags: string[]) => {
    if (!editingPost) return;

    try {
      const updatedPost = await apiClient.updatePost(editingPost.id, {
        content,
        media,
        hashtags
      });
      // Transform PostResponse to Post interface
      const transformedPost = {
        ...updatedPost,
        graduationYear: updatedPost.graduationYear?.toString()
      };
      setPosts(prev => prev.map(post =>
        post.id === editingPost.id ? { ...transformedPost } as Post : post
      ));
      toast({
        title: "Success",
        description: "Your post has been updated!"
      });
    } catch (error) {
      console.error('Failed to update post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (post: Post) => {
    try {
      await apiClient.deletePost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toast({
        title: "Success",
        description: "Your post has been deleted."
      });
      setDeleteConfirmPost(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
          : post
      ));

      await apiClient.toggleLikePost(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
      // Revert optimistic update on error
      fetchPosts();
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCommentClick = async (postId: string) => {
    setCommentingPostId(commentingPostId === postId ? null : postId);
    setCommentText('');

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
      const newComment = await apiClient.createComment({
        postId: postId,
        content: commentText.trim()
      });

      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

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

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsNewPostModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
        <div className="text-xl text-dsce-text-dark">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light">
      <Helmet>
        <title>Posts - DSCE Alumni Connect</title>
      </Helmet>

      <MotionWrapper className="p-6 pt-24 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-dsce-blue">Alumni Posts</h1>
              <p className="text-dsce-text-dark mt-1">Share updates, achievements, and connect with fellow alumni</p>
            </div>
            <Button
              onClick={() => setIsNewPostModalOpen(true)}
              className="bg-dsce-gold hover:bg-dsce-gold-hover text-dsce-blue px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-dsce-text-dark">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dsce-blue rounded-full"></div>
              {posts.length} Posts
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dsce-gold rounded-full"></div>
              Active Community
            </span>
          </div>
        </header>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-dsce-blue/10 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="h-10 w-10 rounded-full object-cover border border-dsce-blue/20" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center border border-dsce-blue/20">
                          <span className="text-white text-sm font-bold">
                            {post.authorName ? post.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
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
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmPost(post)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                title="Delete post"
                              >
                                <Trash2 className="h-4 w-4" />
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
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-dsce-text-dark mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Post Media/Images */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        {post.media.map((mediaUrl: string, index: number) => (
                          <div key={`${post.id}-media-${index}`} className="relative group">
                            <div className="relative overflow-hidden rounded-xl border-2 border-dsce-blue/10 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
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
                            className="inline-block bg-dsce-blue/10 text-dsce-blue text-sm px-3 py-1.5 rounded-full hover:bg-dsce-blue/20 transition-all duration-200 cursor-pointer border border-dsce-blue/20"
                            onClick={() => console.log('Hashtag clicked:', tag)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center space-x-4 pt-4 border-t border-dsce-blue/10">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${post.isLiked
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                        }`}
                    >
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => handleCommentClick(post.id)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${commentingPostId === post.id
                        ? 'text-dsce-blue'
                        : 'text-gray-500 hover:text-dsce-blue'
                        }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-dsce-blue transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">{post.shares || 0}</span>
                    </button>
                  </div>

                  {/* Comment Section */}
                  {commentingPostId === post.id && (
                    <div className="border-t border-dsce-blue/10 pt-4 mt-4">
                      <div className="space-y-3">
                        {/* Comment Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-dsce-blue/20 rounded-lg text-sm focus:outline-none focus:border-dsce-blue"
                            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                          />
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!commentText.trim()}
                            className="px-4 py-2 bg-dsce-gold text-dsce-blue rounded-lg text-sm font-semibold hover:bg-dsce-gold-hover disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Post
                          </button>
                        </div>

                        {/* Comments List */}
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3 p-3 bg-dsce-bg-cream rounded-lg border border-dsce-blue/10">
                            <div className="flex-shrink-0">
                              {comment.authorAvatar ? (
                                <img
                                  src={comment.authorAvatar}
                                  alt={comment.authorName}
                                  className="h-8 w-8 rounded-full object-cover border border-dsce-blue/20"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center border border-dsce-blue/20">
                                  <span className="text-white text-xs font-bold">
                                    {comment.authorName ? comment.authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AL'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-dsce-text-dark">{comment.authorName}</span>
                                  {comment.authorRole && (
                                    <span className="text-xs text-gray-500">• {comment.authorRole}</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Just now'}
                                </span>
                              </div>
                              <p className="text-sm text-dsce-text-dark break-words">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-dsce-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-dsce-blue" />
              </div>
              <h3 className="text-lg font-medium text-dsce-text-dark mb-2">No posts yet</h3>
              <p className="text-dsce-text-dark mb-6">Be the first to share something with the alumni community!</p>
              <Button
                onClick={() => setIsNewPostModalOpen(true)}
                className="bg-dsce-gold hover:bg-dsce-gold-hover text-dsce-blue font-semibold"
              >
                Create First Post
              </Button>
            </div>
          )}
        </div>

        {/* Post Modal */}
        <PostModal
          isOpen={isNewPostModalOpen}
          onClose={() => {
            setIsNewPostModalOpen(false);
            setEditingPost(null);
          }}
          onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Post</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmPost(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeletePost(deleteConfirmPost)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </MotionWrapper>
    </div>
  );
}
