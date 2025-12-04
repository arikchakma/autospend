import type { Route } from './+types/transactions_.new';
import { useCallback } from 'react';
import {
  useDropzone,
  type DropEvent,
  type FileRejection,
} from 'react-dropzone';
import { ArrowLeftIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { cn } from '~/lib/classname';
import { FileUploadQueue } from '~/components/file-upload-queue';
import { useAtom, useSetAtom } from 'jotai';
import { uploadFilesAtom, uploadingFilesAtom } from '~/atoms/upload-files';
import { useIsFileUploading } from '~/lib/file-manager/use-is-file-uploading';
import { href, Link, redirect } from 'react-router';
import { useHasFileUploadingError } from '~/lib/file-manager/use-has-file-uploading-error';
import { useFileUploaderClient } from '~/lib/file-manager/file-upload-provider';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpPost } from '~/lib/http';
import { getUser } from '~/lib/jwt';
import { IMAGES_QUERY_KEY, listImagesOptions } from '~/queries/image';
import { TRANSACTIONS_QUERY_KEY } from '~/queries/transaction';

type OnDrop<T extends File = File> = (
  acceptedFiles: T[],
  fileRejections: FileRejection[],
  event: DropEvent
) => void;

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'AutoSpend - Simplify Your Personal Finances' },
    {
      name: 'description',
      content: 'AutoSpend helps you manage your personal finances',
    },
  ];
};

export async function clientLoader(args: Route.ClientLoaderArgs) {
  const user = getUser();
  if (!user) {
    return redirect(href('/login'));
  }

  return { user };
}

export default function Home() {
  const setFiles = useSetAtom(uploadFilesAtom);
  const setUploadingFiles = useSetAtom(uploadingFilesAtom);

  const onDrop: OnDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      file,
    }));

    setFiles((prev) => [...newFiles, ...prev]);
    setUploadingFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => f.id).slice(0, 3),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.heif'],
    },
  });

  return (
    <section className="mx-auto max-w-lg px-5 py-10">
      <div className="flex items-center gap-2 pb-12">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-xl text-sm leading-none text-zinc-500 transition-colors hover:text-black"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
      </div>

      <h2 className="text-center text-3xl">Import your transactions</h2>
      <p className="mt-2 text-center text-sm text-balance text-zinc-500">
        Export your transactions from your spreadsheet and upload them here or
        upload pictures of your transactions.
      </p>

      <div className="mx-auto max-w-sm">
        <div
          {...getRootProps({
            className: cn(
              'border-[1.5px] border-dashed cursor-default border-zinc-200 min-h-60 flex items-center justify-center rounded-xl p-4 mt-8 bg-zinc-50',
              isDragActive && 'border-zinc-400'
            ),
          })}
        >
          <input {...getInputProps()} />
          <div className="mx-auto flex max-w-2xs flex-col items-center text-center text-balance">
            <PlusIcon className="size-5 text-zinc-400" />
            <p className="mt-3 cursor-default text-zinc-500">
              Drag and drop your files here or{' '}
              <span className="text-black">click to browse</span>
            </p>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-zinc-400">
          Only image files are supported at the moment
        </p>

        <FileUploadQueue />

        <NextButton className="mt-4" />
      </div>
    </section>
  );
}

type Image = {
  name: string;
  size: number;
  type: string;
  path: string;
};

type NextButtonProps = {
  className?: string;
};

function NextButton(props: NextButtonProps) {
  const { className } = props;

  const queryClient = useQueryClient();
  const fileUploaderClient = useFileUploaderClient();
  const isUploading = useIsFileUploading();
  const hasError = useHasFileUploadingError();

  const [files, setFiles] = useAtom(uploadFilesAtom);

  const { mutate, isPending } = useMutation({
    mutationFn: async (images: Image[]) => {
      return httpPost('/api/v1/images', { images });
    },
    onSuccess: () => {
      setFiles([]);
      toast.success('Transactions are being processed...');
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey?.[0] === IMAGES_QUERY_KEY ||
            query.queryKey?.[0] === TRANSACTIONS_QUERY_KEY
          );
        },
      });
    },
    onError: () => {
      toast.error('Failed to queue images for processing');
    },
  });

  const isLoading = isPending || isUploading;

  return (
    <button
      className={cn(
        'flex w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-100 p-1 py-2.5 leading-none tracking-wide text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-400 data-[loading=true]:cursor-wait',
        className
      )}
      disabled={isLoading || files.length === 0 || hasError}
      data-loading={isLoading}
      type="submit"
      onClick={() => {
        const uploaders = fileUploaderClient.getAll();
        const images: Image[] = [];

        for (const f of files) {
          const uploader = uploaders.find((u) => u.uploaderId === f.id);
          if (!uploader) {
            toast.error(`File ${f.file.name} is not uploaded`);
            return;
          }

          images.push({
            name: f.file.name,
            size: f.file.size,
            type: f.file.type,
            // it's safe to assume that the file has been uploaded
            // since we're submitting the form
            path: uploader.state.data?.key!,
          });
        }

        mutate(images);
      }}
    >
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin stroke-[2.5]" />
      ) : (
        'Next'
      )}
    </button>
  );
}

export function headers() {
  return {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  };
}
