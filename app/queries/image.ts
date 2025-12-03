import { queryOptions } from '@tanstack/react-query';
import type { Image } from '~/db/types';
import { httpGet } from '~/lib/http';

type ListImagesOptions = {
  status?: Image['status'][];
};

type ListImagesResponse = {
  images: Image[];
};

export function listImagesOptions(options: ListImagesOptions) {
  const { status = ['pending', 'processing'] } = options;

  return queryOptions({
    queryKey: ['images', { status }],
    queryFn: () => {
      return httpGet<ListImagesResponse>('/api/v1/images', {
        status: status.join(','),
      });
    },
  });
}
