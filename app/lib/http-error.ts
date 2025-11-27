export type HttpErrorItem = {
  message: string;
  location: string;
};

export class HttpError<ErrorType = HttpErrorItem> extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors: ErrorType[] = [],
    public type: string | undefined = undefined
  ) {
    super(message);
  }

  static isHttpError(error: any): error is HttpError {
    return error instanceof HttpError;
  }
}
