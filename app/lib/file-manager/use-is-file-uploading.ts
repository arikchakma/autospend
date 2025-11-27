import { useCallback, useSyncExternalStore } from 'react';
import { FileUploaderClient } from './file-uploader-client';
import { useFileUploaderClient } from './file-upload-provider';

export type UseIsFileUploading = (fileClient?: FileUploaderClient) => boolean;
export const useIsFileUploading: UseIsFileUploading = (fileClient) => {
  const client = useFileUploaderClient(fileClient);

  return useSyncExternalStore(
    useCallback((onStoreChange) => client.subscribe(onStoreChange), [client]),
    () => client.isUploading(),
    () => client.isUploading()
  );
};
