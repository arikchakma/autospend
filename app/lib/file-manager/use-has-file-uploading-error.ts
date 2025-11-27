import { useCallback, useSyncExternalStore } from 'react';
import { FileUploaderClient } from './file-uploader-client';
import { useFileUploaderClient } from './file-upload-provider';

export type UseHasFileUploadingError = (
  fileClient?: FileUploaderClient
) => boolean;
export const useHasFileUploadingError: UseHasFileUploadingError = (
  fileClient
) => {
  const client = useFileUploaderClient(fileClient);

  return useSyncExternalStore(
    useCallback((onStoreChange) => client.subscribe(onStoreChange), [client]),
    () => client.hasError(),
    () => client.hasError()
  );
};
