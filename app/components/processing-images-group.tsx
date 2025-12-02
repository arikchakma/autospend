import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  ReceiptIcon,
} from 'lucide-react';
import { DateTime } from 'luxon';
import type { Image } from '~/db/types';
import { Button } from './ui/button';
import { cn } from '~/lib/classname';

type ProcessingImagesGroupProps = {
  images: Image[];
};

export function ProcessingImagesGroup({ images }: ProcessingImagesGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!images.length) {
    return null;
  }

  const displayedImages = showAll ? images : images.slice(0, 3);
  const count = images.length;

  return (
    <div className="mb-4 rounded-xl border border-zinc-200/50 bg-zinc-100 p-1.5">
      <div className="flex items-center justify-between gap-2 pr-0.5 pl-2.5">
        <h3 className="text-sm font-medium text-zinc-900">
          Processing Receipts
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-xs text-zinc-500">
            {count} receipt{count === 1 ? '' : 's'} in queue
          </p>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex size-5 shrink-0 items-center justify-center rounded-md bg-zinc-50 shadow-xs hover:bg-zinc-100"
          >
            {isExpanded ? (
              <ChevronUpIcon className="size-4 text-zinc-500" />
            ) : (
              <ChevronDownIcon className="size-4 text-zinc-500" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-lg bg-white shadow-sm">
          {displayedImages.map((image) => (
            <ProcessingImageRow key={image.id} image={image} />
          ))}
        </div>
      )}

      {images.length > 3 && isExpanded && (
        <Button
          type="button"
          onClick={() => setShowAll(!showAll)}
          variant="outline"
          className="mt-2 w-full font-normal shadow-xs"
        >
          {showAll ? 'Show less' : 'Show all'}
        </Button>
      )}
    </div>
  );
}

function ProcessingImageRow({ image }: { image: Image }) {
  return (
    <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 p-2.5 text-left hover:bg-zinc-50">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h4
            className="truncate text-sm font-medium text-zinc-900"
            title={image.name}
          >
            {image.name}
          </h4>
          <StatusBadge status={image.status} />
        </div>
        <p className="truncate text-xs text-zinc-500">
          Uploaded {DateTime.fromJSDate(image.createdAt).toRelative()}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        {image.status === 'processing' ? (
          <Loader2 className="size-4 animate-spin text-indigo-500" />
        ) : (
          <ReceiptIcon className="size-4 text-zinc-400" />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;

  const isProcessing = status === 'processing';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
        isProcessing
          ? 'bg-indigo-50 text-indigo-700'
          : 'bg-amber-50 text-amber-700'
      )}
    >
      {status}
    </span>
  );
}
