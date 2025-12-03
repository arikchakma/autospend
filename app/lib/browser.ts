export function setUrlParams(params: Record<string, string>) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  let hasUpdatedUrl = false;

  for (const [key, value] of Object.entries(params)) {
    if (url.searchParams.get(key) === String(value)) {
      continue;
    }

    url.searchParams.delete(key);
    url.searchParams.set(key, value);

    hasUpdatedUrl = true;
  }

  if (!hasUpdatedUrl) {
    return;
  }

  window.history.replaceState(null, '', url.toString());
}

export function deleteUrlParam(key: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has(key)) {
    return;
  }

  url.searchParams.delete(key);
  window.history.replaceState(null, '', url.toString());
}
