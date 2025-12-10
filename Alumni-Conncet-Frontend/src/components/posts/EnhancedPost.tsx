import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Image, Smile, Hash, AtSign, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  role: string;
  content: string;
  time: string;
  likes: number;
  replies?: Comment[];
}

interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

interface EnhancedPostProps {
  author: string;
  avatar: string;
  role: string;
  content: string;
  time: string;
  likes: number;
  comments: number;
  shares?: number;
  media?: MediaAttachment[];
  hashtags?: string[];
  mentions?: string[];
  initialComments?: Comment[];
  onLike?: () => void;
  onComment?: (content: string) => void;
}

export default function EnhancedPost({
  author,
  avatar,
  role,
  content,
  time,
  likes,
  comments,
  shares = 0,
  media,
  hashtags = [],
  mentions = [],
  initialComments = [],
  onLike,
  onComment
}: EnhancedPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    
    onComment?.(newComment);
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'You',
      avatar: 'https://github.com/shadcn.png',
      role: 'Current User',
      content: newComment,
      time: 'Just now',
      likes: 0
    };
    
    setCommentsList(prev => [comment, ...prev]);
    setNewComment('');
  };

  const formatContent = (text: string) => {
    let formatted = text;
    
    // Highlight mentions
    mentions.forEach(mention => {
      formatted = formatted.replace(new RegExp(`@${mention}`, 'g'), 
        `<span class="text-dsce-blue hover:underline cursor-pointer">@${mention}</span>`);
    });
    
    // Highlight hashtags
    hashtags.forEach(hashtag => {
      formatted = formatted.replace(new RegExp(`#${hashtag}`, 'g'), 
        `<span class="text-dsce-blue hover:underline cursor-pointer">#${hashtag}</span>`);
    });
    
    return formatted;
  };

  const displayedComments = showAllComments ? commentsList : commentsList.slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img src={avatar} alt={author} className="h-12 w-12 rounded-full object-cover border border-gray-200" />
            <div>
              <h4 className="font-semibold text-gray-900 hover:text-dsce-blue cursor-pointer transition-colors">{author}</h4>
              <p className="text-sm text-gray-600">{role}</p>
              <p className="text-xs text-gray-500">{time}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        </div>

        {/* Media Attachments */}
        {media && media.length > 0 && (
          <div className="mb-4">
            {media.length === 1 ? (
              media[0].type === 'image' ? (
                <img 
                  src={media[0].url} 
                  alt={media[0].alt} 
                  className="w-full rounded-xl object-cover max-h-[400px]"
                />
              ) : (
                <video 
                  src={media[0].url} 
                  controls 
                  className="w-full rounded-xl max-h-[400px]"
                />
              )
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {media.map((item, index) => (
                  item.type === 'image' ? (
                    <img 
                      key={index}
                      src={item.url} 
                      alt={item.alt} 
                      className="w-full rounded-xl object-cover h-[200px]"
                    />
                  ) : (
                    <video 
                      key={index}
                      src={item.url} 
                      controls 
                      className="w-full rounded-xl h-[200px]"
                    />
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hashtags.map(tag => (
              <span key={tag} className="text-dsce-blue hover:bg-dsce-blue/10 px-2 py-1 rounded-full text-sm cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {likeCount > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                <span>{likeCount}</span>
              </div>
            )}
            {comments > 0 && (
              <span className="text-sm text-gray-600 ml-2">{comments} comments</span>
            )}
            {shares > 0 && (
              <span className="text-sm text-gray-600 ml-2">{shares} shares</span>
            )}
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-dsce-blue text-dsce-blue' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-around">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              isLiked 
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-all">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-6">
              {/* Add Comment */}
              <div className="flex items-start space-x-3 mb-6">
                <img src="https://github.com/shadcn.png" alt="You" className="h-8 w-8 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 pr-12 rounded-xl border border-gray-200 focus:border-dsce-blue focus:ring-2 focus:ring-dsce-blue/20 resize-none outline-none transition-all"
                      rows={2}
                    />
                    <button
                      onClick={handleComment}
                      className="absolute bottom-3 right-3 text-dsce-blue hover:text-dsce-blue/80 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                      <Smile className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                      <Image className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                      <AtSign className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                      <Hash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {displayedComments.length > 0 && (
                <div className="space-y-4">
                  {displayedComments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <img src={comment.avatar} alt={comment.author} className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-semibold text-sm text-gray-900">{comment.author}</h5>
                            <span className="text-xs text-gray-500">{comment.time}</span>
                          </div>
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 ml-3">
                          <button className="text-xs text-gray-500 hover:text-dsce-blue transition-colors">Like</button>
                          <button className="text-xs text-gray-500 hover:text-dsce-blue transition-colors">Reply</button>
                          {comment.likes > 0 && (
                            <span className="text-xs text-gray-500">{comment.likes} likes</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {commentsList.length > 2 && (
                    <button 
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="text-dsce-blue hover:text-dsce-blue/80 text-sm font-medium transition-colors"
                    >
                      {showAllComments ? (
                        <span className="flex items-center">
                          <ChevronUp className="h-4 w-4 mr-1" /> Show less
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <ChevronDown className="h-4 w-4 mr-1" /> View {commentsList.length - 2} more comments
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
