import { FileUploader } from './file-uploader';
import type { FileUploaderOptions } from './file-uploader';
import { notifyManager } from './notify-manager';
import { Subscribable } from './subscribable';

type FileUploadClientListener = () => void;
export class FileUploaderClient extends Subscribable<FileUploadClientListener> {
  #uploaders: Map<string, FileUploader>;

  constructor() {
    super();

    this.#uploaders = new Map();
  }

  build(options: FileUploaderOptions) {
    let { uploaderId } = options;
    let uploader = this.#uploaders.get(uploaderId);
    if (!uploader) {
      uploader = new FileUploader(this, options);
      this.add(uploader);
    }

    return uploader;
  }

  add(uploader: FileUploader) {
    if (!this.#uploaders.has(uploader.uploaderId)) {
      this.#uploaders.set(uploader.uploaderId, uploader);
    }

    this.notify();
  }

  remove(uploader: FileUploader) {
    const uploaderInMap = this.#uploaders.get(uploader.uploaderId);
    if (!uploaderInMap) {
      return;
    }

    this.#uploaders.delete(uploader.uploaderId);
    this.notify();
  }

  get(uploaderId: string) {
    return this.#uploaders.get(uploaderId);
  }

  has(uploaderId: string) {
    return this.#uploaders.has(uploaderId);
  }

  getAll() {
    return [...this.#uploaders.values()];
  }

  notify() {
    notifyManager.batch(() => {
      for (let listener of this.listeners) {
        listener();
      }
    });
  }

  isUploading() {
    return this.getAll().some(
      (uploader) => uploader.state.status === 'uploading'
    );
  }

  hasError() {
    return this.getAll().some((uploader) => uploader.state.status === 'error');
  }
}

export const fileUploaderClient = new FileUploaderClient();
