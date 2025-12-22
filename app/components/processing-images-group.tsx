import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  ReceiptIcon,
  RefreshCwIcon,
  Trash2Icon,
} from 'lucide-react';
import { DateTime } from 'luxon';
import type { Image } from '~/db/types';
import { Button } from './ui/button';
import { cn } from '~/lib/classname';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteImageMutationOptions,
  IMAGES_QUERY_KEY,
  listImagesOptions,
  retryImageMutationOptions,
} from '~/queries/image';
import { Skeleton } from '~/components/ui/skeleton';
import { toast } from 'sonner';

export function ProcessingImagesGroup() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    listImagesOptions({ status: ['pending', 'processing', 'failed'] })
  );
  const images = data?.images ?? [];

  const deleteImage = useMutation({
    ...deleteImageMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [IMAGES_QUERY_KEY] });
    },
  });

  const retryImage = useMutation({
    ...retryImageMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [IMAGES_QUERY_KEY] });
    },
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="mb-4 rounded-xl border border-zinc-200/50 bg-zinc-100 p-1.5">
        <div className="flex h-[28px] items-center justify-between gap-2 pr-0.5 pl-2.5">
          <Skeleton className="h-4 w-32 bg-zinc-200" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-24 bg-zinc-200" />
            <Skeleton className="size-5 rounded-md bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

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
            <ProcessingImageRow
              key={image.id}
              image={image}
              onDelete={() => {
                deleteImage.mutate(image.id, {
                  onSuccess: () => toast.success('Image deleted'),
                  onError: () => toast.error('Failed to delete image'),
                });
              }}
              onRetry={() => {
                retryImage.mutate(image.id, {
                  onSuccess: () => toast.success('Retrying image processing'),
                  onError: () => toast.error('Failed to retry'),
                });
              }}
              isDeleting={deleteImage.isPending}
              isRetrying={retryImage.isPending}
            />
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

type ProcessingImageRowProps = {
  image: Image;
  onDelete: () => void;
  onRetry: () => void;
  isDeleting: boolean;
  isRetrying: boolean;
};

function ProcessingImageRow(props: ProcessingImageRowProps) {
  const { image, onDelete, onRetry, isDeleting, isRetrying } = props;
  const isFailed = image.status === 'failed';
  const isProcessing = image.status === 'processing';

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
          {isFailed && image.error ? (
            <span className="text-red-500">{image.error}</span>
          ) : (
            <>Uploaded {DateTime.fromJSDate(image.createdAt).toRelative()}</>
          )}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        {isFailed && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex size-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 disabled:opacity-50"
            title="Retry"
          >
            <RefreshCwIcon className={cn('size-4', isRetrying && 'animate-spin')} />
          </button>
        )}
        {!isProcessing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex size-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-red-600 disabled:opacity-50"
            title="Delete"
          >
            <Trash2Icon className="size-4" />
          </button>
        )}
        {isProcessing && (
          <Loader2 className="size-4 animate-spin text-indigo-500" />
        )}
      </div>
    </div>
  );
}

type StatusBadgeProps = {
  status: Image['status'];
};

function StatusBadge(props: StatusBadgeProps) {
  const { status } = props;

  if (!status) return null;

  const statusStyles = {
    processing: 'bg-indigo-50 text-indigo-700',
    pending: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
    completed: 'bg-green-50 text-green-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
