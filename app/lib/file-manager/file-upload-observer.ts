import type { FileUploaderClient } from './file-uploader-client';
import type {
  FileUploader,
  FileUploaderError,
  FileUploaderEventNotify,
  FileUploaderOptions,
  FileUploaderState,
} from './file-uploader';
import { Subscribable } from './subscribable';
import { notifyManager } from './notify-manager';

export type FileObserverResult = FileUploaderState & {
  retry: () => void;
  abort: () => void;
  remove: () => void;
};
type FileObserverListener = (state: FileObserverResult) => void;

export type OnUploadComplete = (state: FileUploaderState) => void;
export type OnUploadProgress = (options: {
  loaded: number;
  total: number;
}) => void;
export type FetchCallbacks = {
  onUploadComplete?: (
    data: FileUploaderState['data'],
    state: FileUploaderState
  ) => void;
  onUploadProgress?: OnUploadProgress;
  onUploadError?: (error: FileUploaderError, state: FileUploaderState) => void;
  onUploadSettled?: (state: FileUploaderState) => void;
};

export class FileUploadObserver extends Subscribable<FileObserverListener> {
  #client: FileUploaderClient;
  #currentUploader: FileUploader = undefined!;
  #options: FileUploaderOptions;
  #currentResult: FileObserverResult = undefined!;
  #callbacks: FetchCallbacks = {};

  constructor(
    client: FileUploaderClient,
    options: FileUploaderOptions,
    callbacks: FetchCallbacks
  ) {
    super();
    this.#client = client;
    this.#options = getDefaultOptions(options);
    this.#callbacks = callbacks;
  }

  getOptimisticState() {
    const uploader = this.#client.build(this.#options);

    const result = this.#createResult(uploader.state);
    if (this.#currentUploader !== uploader) {
      this.#currentResult = result;
      this.#currentUploader = uploader;
    }

    return result;
  }

  #createResult(state: FileUploaderState): FileObserverResult {
    return {
      ...state,
      retry: this.retry.bind(this),
      abort: this.abort.bind(this),
      remove: this.remove.bind(this),
    };
  }

  notify(event: FileUploaderEventNotify) {
    this.#currentResult = this.#createResult(this.#currentUploader.state);

    notifyManager.batch(() => {
      if (event.action === 'uploaded') {
        this.#callbacks.onUploadComplete?.(
          this.#currentResult.data,
          this.#currentResult
        );
        this.#callbacks.onUploadSettled?.(this.#currentResult);
      } else if (event.action === 'uploading') {
        this.#callbacks.onUploadProgress?.({
          loaded: this.#currentResult.loaded,
          total: this.#currentResult.total,
        });
      } else if (event.action === 'error') {
        this.#callbacks.onUploadError?.(
          this.#currentResult.error!,
          this.#currentResult
        );
        this.#callbacks.onUploadSettled?.(this.#currentResult);
      }

      for (const listener of this.listeners) {
        listener(this.#currentResult);
      }

      this.#client.notify();
    });
  }

  protected onSubscribe(): void {
    if (this.listeners.size === 1) {
      this.#currentUploader.addObserver(this);
      this.fetch();
    }
  }

  protected onUnsubscribe(): void {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }

  destroy() {
    this.listeners = new Set();
    this.#currentUploader.removeObserver(this);
  }

  fetch(retry = false) {
    // we will use this fetch so that,
    // we can check other states like uploading, uploaded, error
    const status = this.#currentUploader.state.status;

    if (!this.#options.enabled) {
      // it means we don't wanna upload the file
      // at this moment, so we don't need to fetch
      return;
    }

    if (status === 'uploading' || status === 'uploaded') {
      // if the file is already uploading or uploaded
      // we don't need to fetch
      return;
    }

    if (status === 'error' && !retry) {
      // if the file is in error state and we don't wanna retry
      // we don't need to fetch
      return;
    }

    this.#updateUploader();
    this.#currentUploader.fetch();
  }

  retry() {
    this.fetch(true);
  }

  abort() {
    if (this.#currentUploader.state.status !== 'uploading') {
      return;
    }

    this.#currentUploader.abort();
  }

  remove() {
    if (this.#currentUploader.observers.length !== 1) {
      return;
    }

    // if this is the only observer,
    // we can remove the uploader from the client
    // so that it can be garbage collected
    this.#currentUploader.abort();
    this.#client.remove(this.#currentUploader);
    this.#client.notify();
  }

  setOptions(options: FileUploaderOptions) {
    this.#options = options;
    this.#updateUploader();

    if (this.hasListeners()) {
      this.fetch();
    }
  }

  #updateUploader() {
    const uploader = this.#client.build(this.#options);
    if (this.#currentUploader === uploader) {
      return;
    }

    const prevUploader = this.#currentUploader;
    this.#currentUploader = uploader;

    if (this.hasListeners()) {
      prevUploader.removeObserver(this);
      this.#currentUploader.addObserver(this);
    }
  }

  getCurrentResult() {
    return this.#currentResult;
  }

  trackState(state: FileObserverResult) {
    let trackedState = {} as FileObserverResult;

    Object.keys(state).forEach((key) => {
      Object.defineProperty(trackedState, key, {
        get: () => state[key as keyof FileObserverResult],
      });
    });

    return trackedState;
  }
}

function getDefaultOptions(options: FileUploaderOptions) {
  return {
    enabled: true,
    ...options,
  };
}
