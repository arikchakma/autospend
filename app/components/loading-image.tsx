import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatedPie } from './animated-pie';
import { cn } from '~/lib/classname';
import type { FileUploaderStatus } from '~/lib/file-manager/file-uploader';
import { Loader2, RotateCcwIcon } from 'lucide-react';

type LoadingImageProps = {
  src: string;
  status: FileUploaderStatus;
  progress: number;

  onRetryClick?: () => void;
};

export function LoadingImage(props: LoadingImageProps) {
  const { src, progress, status, onRetryClick } = props;

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (progress === 1) {
      let id = setTimeout(() => {
        setShow(false);
      }, 250);
      return () => clearTimeout(id);
    }
    setShow(status === 'uploading');
  }, [status, progress]);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl">
      <img
        src={src}
        className="h-full w-full object-cover transition-transform"
      />

      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          status === 'uploaded' ? 'bg-black/0' : 'bg-black/40'
        )}
      >
        <div className="h-16 w-16">
          <AnimatedPie progress={progress} show={show} />
        </div>

        <div
          className="absolute top-2 right-2"
          aria-label="Uploading"
          role="status"
          hidden={status !== 'uploading'}
        >
          <Loader2 className="relative z-10 size-3 animate-spin stroke-3 text-violet-100" />
        </div>
      </div>

      {status === 'error' && onRetryClick && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-full bg-white p-2 px-3 text-sm leading-none text-black"
            onClick={onRetryClick}
          >
            <RotateCcwIcon className="size-3 stroke-[2.5]" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
