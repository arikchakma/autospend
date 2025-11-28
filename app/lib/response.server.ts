/**
 * Render a response with a JSON body
 *
 * @param response Object to be stringified
 * @param options Response options
 *
 * @returns Response
 */
export function json<T>(data: T, options: ResponseInit = {}): T {
  return new Response(JSON.stringify(data), {
    status: options.status || 200,
    headers: { 'content-type': 'application/json', ...options.headers },
  }) as unknown as T;
}
