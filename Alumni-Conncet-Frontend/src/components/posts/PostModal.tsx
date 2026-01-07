import { useState, useRef } from 'react';
import { X, Image, Smile, MapPin, User, Send, Camera, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export default function PostModal({ isOpen, onClose, onSubmit }: PostModalProps) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || selectedImages.length > 0) {
      onSubmit(content);
      setContent('');
      setSelectedImages([]);
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Post</h3>
                  <p className="text-sm text-gray-500">Share with your alumni network</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Area */}
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, achievements, or updates with fellow alumni..."
                  className="w-full min-h-[100px] p-3 text-gray-900 placeholder-gray-400 border-0 outline-none resize-none text-lg"
                  required
                />
              </div>

              {/* Image Upload Area */}
              <div 
                className={`mx-4 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging ? 'border-dsce-blue bg-dsce-blue/10' : 'border-gray-300 hover:border-gray-400'
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
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">Drag photos here</p>
                <p className="text-sm text-gray-400">or click to browse</p>
              </div>

              {/* Selected Images */}
              {selectedImages.length > 0 && (
                <div className="px-4 pb-2">
                  <div className={`grid gap-2 ${
                    selectedImages.length === 1 ? 'grid-cols-1' : 
                    selectedImages.length === 2 ? 'grid-cols-2' : 
                    'grid-cols-3'
                  }`}>
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-48 object-cover rounded-xl" 
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                      title="Add photo"
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                      title="Add video"
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                      title="Add location"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
                      title="Add emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-dsce-blue hover:bg-dsce-blue/90 text-white rounded-full transition-all font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
