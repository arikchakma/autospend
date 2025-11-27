import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { FileUploaderOptions, FileUploaderState } from './file-uploader';
import { FileUploaderClient } from './file-uploader-client';
import {
  FileUploadObserver,
  type FetchCallbacks,
  type FileObserverResult,
} from './file-upload-observer';
import { useFileUploaderClient } from './file-upload-provider';

export type UseFileState = (
  options: FileUploaderOptions,
  callbacks: FetchCallbacks,
  fileClient?: FileUploaderClient
) => FileObserverResult;

export const useFileState: UseFileState = (options, callbacks, fileClient) => {
  const client = useFileUploaderClient(fileClient);
  const [observer] = useState(
    () => new FileUploadObserver(client, options, callbacks)
  );
  // we need to call getOptimisticState to ensure that the cache is populated
  // and we don't make a request on the first render
  const state = observer.getOptimisticState();
  useSyncExternalStore(
    useCallback(
      (onStoreChange) => observer.subscribe(onStoreChange),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );

  useEffect(() => {
    observer.setOptions(options);
  }, [options, observer]);

  return observer.trackState(state);
};
