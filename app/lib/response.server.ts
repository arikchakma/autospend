/**
 * Render a response with a JSON body
 *
 * @param response Object to be stringified
 * @param options Response options
 *
 * @returns Response
 */
export function json<T>(data: T, options: ResponseInit = {}): T {
  const headers = new Headers(options.headers);
  headers.set('content-type', 'application/json');

  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers,
  }) as unknown as T;
}
