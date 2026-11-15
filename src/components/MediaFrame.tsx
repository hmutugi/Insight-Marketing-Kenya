import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface MediaFrameProps {
  src: string;
  alt: string;
  aspectClass?: string;
  className?: string;
  priority?: boolean;
}

export function MediaFrame({
  src,
  alt,
  aspectClass = 'aspect-[4/3]',
  className = '',
  priority = false,
}: MediaFrameProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#E2DFD7] bg-[#EFEDE7] ${aspectClass} ${className}`}
    >
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EFEDE7] to-[#E2DFD7] p-6 text-center text-[#4B515A]">
          <ImageIcon className="h-6 w-6 text-[#666D77]" aria-hidden="true" />
          <p className="max-w-xs text-xs font-medium text-[#4B515A]">{alt}</p>
        </div>
      )}
    </div>
  );
}
