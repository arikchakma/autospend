import type { Route } from './+types/new';
import { useCallback, useEffect } from 'react';
import {
  useDropzone,
  type DropEvent,
  type FileRejection,
} from 'react-dropzone';
import { ArrowLeftIcon, Loader2Icon, PlusIcon } from 'lucide-react';
import { cn } from '~/lib/classname';
import { FileUploadQueue } from '~/components/file-upload-queue';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { uploadFilesAtom, uploadingFilesAtom } from '~/atoms/upload-files';
import { useIsFileUploading } from '~/lib/file-manager/use-is-file-uploading';
import { Link, NavLink, useFetcher } from 'react-router';
import { useHasFileUploadingError } from '~/lib/file-manager/use-has-file-uploading-error';
import { useFileUploaderClient } from '~/lib/file-manager/file-upload-provider';
import { toast } from 'sonner';
import { z } from 'zod';
import { db } from '~/db';
import { imagesTable } from '~/db/schema';
import { processImages } from '~/lib/openai.server';
import { noop } from '~/lib/promise';

type OnDrop<T extends File = File> = (
  acceptedFiles: T[],
  fileRejections: FileRejection[],
  event: DropEvent
) => void;

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Poisha - Simplify Your Personal Finances' },
    {
      name: 'description',
      content: 'Poisha helps you manage your personal finances',
    },
  ];
};

export const links: Route.LinksFunction = () => {
  return [];
};

export async function action({ request }: Route.ActionArgs) {
  const bodySchema = z.object({
    images: z.array(
      z.object({
        name: z.string(),
        size: z.number().min(0),
        type: z.string(),
        path: z.string(),
      })
    ),
  });

  const jsonBody = await request.json();
  const { data: body, error } = bodySchema.safeParse(jsonBody);
  if (error) {
    const errors = error.issues;
    const message = errors.map((e) => e.message).join(', ');

    return { errors, message };
  }

  const images = await db
    .insert(imagesTable)
    .values(
      body.images.map((image) => ({
        name: image.name,
        size: image.size,
        type: image.type,
        path: image.path,
      }))
    )
    .returning();

  await processImages(images);

  return { status: 'ok' };
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
    <section className="mx-auto max-w-sm py-10">
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
      <div
        {...getRootProps({
          className: cn(
            'border-[1.5px] border-dashed border-zinc-200 min-h-60 flex items-center justify-center rounded-xl p-4 mt-8 bg-zinc-50',
            isDragActive && 'border-zinc-400'
          ),
        })}
      >
        <input {...getInputProps()} />
        <div className="mx-auto flex max-w-2xs flex-col items-center text-center text-balance">
          <PlusIcon className="size-5 text-zinc-400" />
          <p className="mt-3 text-zinc-500">
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
    </section>
  );
}

type NextButtonProps = {
  className?: string;
};

function NextButton(props: NextButtonProps) {
  const { className } = props;

  const fileUploaderClient = useFileUploaderClient();
  const isUploading = useIsFileUploading();
  const hasError = useHasFileUploadingError();

  const [files, setFiles] = useAtom(uploadFilesAtom);

  // useEffect(() => {
  //   if (fetcher.data?.status !== 'ok') {
  //     return;
  //   }

  //   setFiles([]);
  // }, [fetcher.data]);

  return (
    <button
      className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-100 p-1 py-2.5 leading-none tracking-wide text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-400 data-[loading=true]:cursor-wait"
      disabled={isUploading || files.length === 0 || hasError}
      data-loading={isUploading}
      type="submit"
    >
      {isUploading ? (
        <Loader2Icon className="size-4 animate-spin stroke-[2.5]" />
      ) : (
        'Next'
      )}
    </button>
  );
}
