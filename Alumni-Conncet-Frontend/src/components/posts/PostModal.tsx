import { useState, useRef, useEffect } from 'react';
import { X, Image, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, media: string[], hashtags: string[]) => void;
  initialPost?: {
    id: string;
    content: string;
    media?: string[];
    hashtags?: string[];
  };
}

export default function PostModal({ isOpen, onClose, onSubmit, initialPost }: PostModalProps) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ content?: string }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with initialPost data when editing
  useEffect(() => {
    if (initialPost) {
      setContent(initialPost.content);
      setSelectedImages(initialPost.media || []);
      setHashtags(initialPost.hashtags || []);
    } else {
      // Reset form when not editing
      setContent('');
      setSelectedImages([]);
      setHashtags([]);
      setHashtagInput('');
    }
  }, [initialPost]);

  const validateForm = () => {
    const newErrors: { content?: string } = {};
    
    if (!content.trim() && selectedImages.length === 0) {
      newErrors.content = 'Please write something or add an image to post';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(content, selectedImages, hashtags);
    setContent('');
    setSelectedImages([]);
    setHashtags([]);
    setHashtagInput('');
    setErrors({});
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 4 images
    const remainingSlots = 4 - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (files.length > remainingSlots) {
      alert(`You can only upload up to 4 images. ${files.length - remainingSlots} images were skipped.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Hashtag handling functions
  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const trimmed = hashtagInput.trim();
      if (trimmed && !hashtags.includes(trimmed)) {
        setHashtags([...hashtags, trimmed]);
        setHashtagInput('');
      }
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleHashtagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, numbers, and underscores
    if (value.match(/^[a-zA-Z0-9_]*$/)) {
      setHashtagInput(value);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">
                {initialPost ? 'Edit Post' : 'Create New Post'}
              </h3>
              <button 
                type="button"
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto">
              {/* Content Area */}
              <div className="px-6 pt-6">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: undefined }));
                      }
                    }}
                    placeholder="Share your thoughts, achievements, or updates with fellow alumni..."
                    className={`w-full min-h-[120px] p-4 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl outline-none resize-none text-lg focus:border-dsce-blue focus:ring-2 focus:ring-dsce-blue/20 transition-all ${
                      errors.content ? 'border-red-500 ring-2 ring-red-500/20' : ''
                    }`}
                  />
                  {errors.content && (
                    <div className="absolute -bottom-6 left-4 flex items-center text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.content}
                    </div>
                  )}
                </div>
              </div>

              {/* Hashtags Section */}
              <div className="px-6">
                <div className="mb-3">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="bg-dsce-blue/10 text-dsce-blue p-1.5 rounded-lg mr-2">
                      <span className="text-xs font-bold">#</span>
                    </span>
                    Add Hashtags
                    <span className="text-gray-400 font-normal ml-2">(Optional)</span>
                  </label>
                </div>
                
                {/* Hashtag Input */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-dsce-blue focus-within:ring-2 focus-within:ring-dsce-blue/20 transition-all">
                    <span className="text-dsce-blue font-bold text-lg">#</span>
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={handleHashtagInputChange}
                      onKeyDown={handleAddHashtag}
                      placeholder="Type hashtag and press Enter"
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-1">
                    Press Enter or Space to add. Use letters, numbers, and underscores only.
                  </p>
                </div>

                {/* Hashtags Display */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-dsce-blue/10 to-indigo-10 text-dsce-blue border border-dsce-blue/20 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHashtag(tag)}
                          className="text-dsce-blue/70 hover:text-dsce-blue transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload Area */}
              <div className="px-6">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Image className="w-4 h-4 mr-2 text-gray-600" />
                    Add Images
                    <span className="text-gray-400 font-normal ml-2">(Optional)</span>
                  </label>
                </div>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragging ? 'border-dsce-blue bg-dsce-blue/5' : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-dsce-blue/10 rounded-full flex items-center justify-center mb-3">
                      <Image className="w-6 h-6 text-dsce-blue" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      PNG, JPG, GIF up to 10MB each (max 4 images)
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {selectedImages.length > 0 && (
                  <div className="mt-4 pb-6">
                    <div className="grid grid-cols-2 gap-3 max-w-full">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group flex-shrink-0">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-white bg-dsce-blue hover:bg-dsce-blue/90 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  {initialPost ? 'Update Post' : 'Share Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
