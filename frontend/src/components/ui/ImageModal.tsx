import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export default function ImageModal({ image, isOpen, onClose, alt }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close image"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image */}
        <img
          src={image}
          alt={alt || 'Campus image'}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Image Info */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white/80 text-sm bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            DSCE Campus Memory
          </p>
        </div>
      </div>
    </div>
  );
}
