import { memo } from 'react';
import { LoadingImage } from './loading-image';
import { useFileState } from '~/lib/file-manager/use-file-state';
import { toast } from 'sonner';
import type { FetchCallbacks } from '~/lib/file-manager/file-upload-observer';
import { TrashIcon } from 'lucide-react';

type UploadImageProps = {
  id: string;
  file: File;
  preview: string;
  enabled?: boolean;

  onDelete?: () => void;
} & FetchCallbacks;

function _UploadImage(props: UploadImageProps) {
  const {
    file,
    preview,
    id,
    onUploadComplete,
    onUploadSettled,
    enabled = true,
    onDelete,
  } = props;

  const { progress, status, retry, remove } = useFileState(
    {
      file,
      uploaderId: id,
      enabled,
    },
    {
      onUploadComplete,
      onUploadSettled,
      onUploadError(error) {
        toast.error(error.message || 'An error occurred');
      },
    }
  );

  return (
    <div key={id} className="rounded-xl bg-zinc-100 p-1">
      <div className="flex items-center justify-between gap-1 p-1">
        <span className="truncate text-xs text-zinc-500">{file.name}</span>
        <button
          className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-300 hover:bg-red-100 hover:text-red-700"
          onClick={() => {
            remove();
            onDelete?.();
          }}
        >
          <TrashIcon className="size-3 stroke-[2.5]" />
        </button>
      </div>

      <LoadingImage
        src={preview}
        progress={progress}
        status={status}
        onRetryClick={retry}
      />
    </div>
  );
}

export const UploadImage = memo(_UploadImage);
