import { FetchError, httpPost } from '../http';
import type { FileUploaderClient } from './file-uploader-client';
import type { FileUploadObserver } from './file-upload-observer';
import { notifyManager } from './notify-manager';
import invariant from 'tiny-invariant';

export type FileUploaderStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

type FilePresignedResponse = {
  url: string;
  key: string;
};
export type FileUploaderError = Error | FetchError;
export type FileUploaderState = {
  file: File;

  data: FilePresignedResponse | null;
  error: Error | FetchError | null;
  status: FileUploaderStatus;

  progress: number;
  loaded: number;
  total: number;
};

export type FileUploaderOptions = {
  uploaderId: string;
  file: File;
  enabled?: boolean;
};

export type IdleEventNotify = {
  action: 'idle';
  state: FileUploaderState;
};

export type UploadingEventNotify = {
  action: 'uploading';
  state: FileUploaderState;
};

export type UploadedEventNotify = {
  action: 'uploaded';
  state: FileUploaderState;
};

export type ErrorEventNotify = {
  action: 'error';
  state: FileUploaderState;
};

export type FileUploaderEventNotify =
  | IdleEventNotify
  | UploadingEventNotify
  | UploadedEventNotify
  | ErrorEventNotify;

export class FileUploader {
  uploaderId: string;
  state: FileUploaderState;
  observers: FileUploadObserver[];

  #client: FileUploaderClient;
  #currentPromise: Promise<void> | null;
  #options: FileUploaderOptions;
  #abortController: AbortController | null;
  #currentXhr: XMLHttpRequest | null;

  constructor(client: FileUploaderClient, options: FileUploaderOptions) {
    this.observers = [];

    this.#client = client;
    this.#currentPromise = null;
    this.#currentXhr = null;
    this.#abortController = null;
    this.#options = options;

    this.uploaderId = options.uploaderId;
    this.state = {
      file: options.file,
      data: null,
      error: null,
      status: 'idle',
      progress: 0,

      loaded: 0,
      total: options.file.size,
    };
  }

  setState(state: FileUploaderState) {
    this.state = state;
  }

  fetch() {
    this.#currentPromise = (async () => {
      try {
        this.#abortController = new AbortController();
        this.setState({
          ...this.state,
          status: 'uploading',
          data: null,
          error: null,

          progress: 0,
          loaded: 0,
        });
        this.notify({
          action: 'uploading',
          state: this.state,
        });

        const file = this.state.file;
        const signedUrl = await this.#getPresignedUrl(
          file.name,
          file.type,
          file.size
        );

        this.#currentXhr = new XMLHttpRequest();
        this.#currentXhr.open('PUT', signedUrl, true);
        this.#currentXhr.responseType = 'json';

        this.#currentXhr.upload.onprogress = (e) => {
          const { loaded, total } = e;
          const progress = loaded / total;
          this.setState({
            ...this.state,
            progress,
            loaded,
            total,
          });
          this.notify({
            action: 'uploading',
            state: this.state,
          });
        };

        this.#currentXhr.onreadystatechange = () => {
          if (this.#currentXhr?.readyState === 4) {
            if (this.#currentXhr?.status === 200) {
              this.setState({
                ...this.state,
                status: 'uploaded',
              });
              this.notify({
                action: 'uploaded',
                state: this.state,
              });
            } else {
              if (this.#currentXhr?.status === 0) {
                // this is a case when the request is aborted
                // so we don't need to do anything here
                // because we have already handled this case
                return;
              }

              const error = new Error('Failed to upload file', {
                cause: this.#currentXhr?.response,
              });
              this.setState({
                ...this.state,
                error,
                status: 'error',
              });
              this.notify({
                action: 'error',
                state: this.state,
              });
            }
          }
        };

        this.#currentXhr.onabort = () => {
          const error = new Error('Upload Aborted');
          this.setState({
            ...this.state,
            error,
            status: 'error',
          });
          this.notify({
            action: 'error',
            state: this.state,
          });
        };

        this.#currentXhr.onerror = () => {
          const error = new Error('Failed to upload file', {
            cause: this.#currentXhr?.response,
          });
          this.setState({
            ...this.state,
            error,
            status: 'error',
          });
          this.notify({
            action: 'error',
            state: this.state,
          });
        };

        this.#currentXhr.setRequestHeader('Content-Type', file.type);
        this.#currentXhr.send(file);
      } catch (e) {
        let error: FileUploaderError = e as unknown as FileUploaderError;
        if (e instanceof DOMException && e.name === 'AbortError') {
          error = new Error(this.#abortController?.signal?.reason || 'Aborted');
        } else if (typeof e === 'string') {
          error = new Error(e);
        }

        this.setState({
          ...this.state,
          error,
          status: 'error',
        });
        this.notify({
          action: 'error',
          state: this.state,
        });
      } finally {
        this.#currentPromise = null;
        this.#abortController = null;
      }
    })();

    return this.#currentPromise;
  }

  async #getPresignedUrl(
    name: string,
    type: string,
    size: number
  ): Promise<string> {
    invariant(
      this.#abortController,
      "There might be a bug, abort controller doesn't exist"
    );

    const response = await httpPost<FilePresignedResponse>(
      '/api/v1/signed-url',
      {
        name,
        size,
        type,
      },
      {
        signal: this.#abortController.signal,
      }
    );

    this.setState({
      ...this.state,
      data: response,
    });
    return response.url;
  }

  notify(event: FileUploaderEventNotify) {
    notifyManager.batch(() => {
      for (const observer of this.observers) {
        observer.notify(event);
      }
    });
  }

  abort() {
    this.#abortController?.abort('Upload Aborted');
    this.#currentXhr?.abort();
  }

  removeObserver(observer: FileUploadObserver) {
    if (!this.observers.includes(observer)) {
      return;
    }

    this.observers = this.observers.filter((o) => o !== observer);
  }

  addObserver(observer: FileUploadObserver) {
    if (this.observers.includes(observer)) {
      return;
    }

    this.observers.push(observer);
  }

  setOptions(options: FileUploaderOptions) {
    this.#options = {
      ...this.#options,
      ...options,
    };
  }
}
