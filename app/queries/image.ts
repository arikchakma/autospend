import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type { Image } from '~/db/types';
import { httpDelete, httpGet, httpPost } from '~/lib/http';

type ListImagesOptions = {
  status?: Image['status'][];
};

type ListImagesResponse = {
  images: Image[];
};

export const IMAGES_QUERY_KEY = 'images';

export function listImagesOptions(options: ListImagesOptions) {
  const { status = ['pending', 'processing'] } = options;

  return queryOptions({
    queryKey: [IMAGES_QUERY_KEY, { status }],
    queryFn: () => {
      return httpGet<ListImagesResponse>('/api/v1/images', {
        status: status.join(','),
      });
    },
  });
}

export function deleteImageMutationOptions() {
  return mutationOptions({
    mutationFn: (imageId: number) => {
      return httpDelete(`/api/v1/images/${imageId}`);
    },
  });
}

export function retryImageMutationOptions() {
  return mutationOptions({
    mutationFn: (imageId: number) => {
      return httpPost(`/api/v1/images/${imageId}/retry`, {});
    },
  });
}
