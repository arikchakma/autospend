import { createContext, useContext, type PropsWithChildren } from 'react';
import type { FileUploaderClient } from './file-uploader-client';

export const FileUploaderClientContext =
  createContext<FileUploaderClient | null>(null);

type FileUploaderClientProviderProps = PropsWithChildren<{
  client: FileUploaderClient;
}>;

export function FileUploaderClientProvider(
  props: FileUploaderClientProviderProps
) {
  const { children, ...defaultValues } = props;

  return (
    <FileUploaderClientContext.Provider value={defaultValues.client}>
      {children}
    </FileUploaderClientContext.Provider>
  );
}

export function useFileUploaderClient(fileUploaderClient?: FileUploaderClient) {
  if (fileUploaderClient) {
    return fileUploaderClient;
  }

  const client = useContext(FileUploaderClientContext);
  if (!client) {
    throw new Error(
      'useFileUploaderClient must be used within a FileUploaderClientProvider'
    );
  }

  return client;
}
