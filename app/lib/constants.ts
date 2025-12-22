const baseUrl = import.meta.env.DEV
  ? 'https://app.daroyan.com'
  : import.meta.env.VITE_APP_BASE_URL;
export const IMAGE_PROCESS_QUEUE_URL = `${baseUrl}/api/v1/images/process`;
