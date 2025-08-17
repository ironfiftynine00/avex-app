import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface QuestionImageProps {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}

export function QuestionImage({ imageUrl, alt = "Question image", className = "" }: QuestionImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!imageUrl) {
    return null;
  }

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className={`bg-muted border border-border rounded-lg p-4 flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Image failed to load</p>
          <p className="text-xs text-muted-foreground mt-1">{imageUrl}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted border border-border rounded-lg flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-auto rounded-lg border border-border ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ maxHeight: '400px', objectFit: 'contain' }}
      />
    </div>
  );
}