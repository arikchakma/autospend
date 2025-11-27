import { atom } from 'jotai';
import type { FileUploaderClient } from '~/lib/file-manager/file-uploader-client';

export type UploadFile = {
  id: string;
  preview: string;
  file: File;
};

export const uploadFilesAtom = atom<UploadFile[]>([]);
export const uploadingFilesAtom = atom<string[]>([]);

export function getNextFile(
  client: FileUploaderClient,
  files: UploadFile[],
  uploadingFiles: string[],
  file: UploadFile
) {
  return files.find(
    (f, index) =>
      // index is greater than the current file index
      index > files.indexOf(file) &&
      // file is not already in the list
      !uploadingFiles.includes(f.id) &&
      // file is not already uploaded or is idle
      (!client.has(f.id) || client.get(f.id)?.state.status === 'idle')
  );
}
