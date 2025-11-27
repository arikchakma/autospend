import { useAtom } from 'jotai';
import {
  getNextFile,
  uploadFilesAtom,
  uploadingFilesAtom,
} from '~/atoms/upload-files';
import { useFileUploaderClient } from '~/lib/file-manager/file-upload-provider';
import { UploadImage } from './upload-image';

export function FileUploadQueue() {
  const client = useFileUploaderClient();
  const [files, setFiles] = useAtom(uploadFilesAtom);
  const [uploadingFiles, setUploadingFiles] = useAtom(uploadingFilesAtom);

  if (!files.length) {
    return null;
  }

  return (
    <div className="my-4 grid grid-cols-2 gap-2">
      {files.map((uploadFile) => {
        const { file, id, preview } = uploadFile;
        return (
          <UploadImage
            key={id}
            id={id}
            file={file}
            preview={preview}
            enabled={uploadingFiles.includes(id)}
            onUploadSettled={() => {
              const nextFile = getNextFile(
                client,
                files,
                uploadingFiles,
                uploadFile
              );

              if (!nextFile) {
                return;
              }

              setUploadingFiles((prev) => [...prev, nextFile.id]);
            }}
            onUploadComplete={(_, state) => {
              const isSuccessful = state.status === 'uploaded' && state.data;
              if (!isSuccessful) {
                return;
              }

              const newPreviewUrl = `${import.meta.env.VITE_FILE_CDN_URL}/${state?.data?.key}`;
              setFiles((prev) => {
                return prev.map((f) =>
                  f.id === id
                    ? {
                        ...f,
                        preview: newPreviewUrl,
                      }
                    : f
                );
              });
              URL.revokeObjectURL(preview);
            }}
            onDelete={() => {
              setFiles((prev) => prev.filter((f) => f.id !== id));
              setUploadingFiles((prev) => prev.filter((f) => f !== id));
              URL.revokeObjectURL(preview);
            }}
          />
        );
      })}
    </div>
  );
}
