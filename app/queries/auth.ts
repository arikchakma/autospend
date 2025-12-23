import { mutationOptions } from '@tanstack/react-query';
import { httpPost } from '~/lib/http';

type GoogleLoginResponse = {
  authorizationUrl: string;
};

type GoogleLoginParams = {
  platform?: 'ios' | 'web';
};

export function googleLoginMutation() {
  return mutationOptions({
    mutationFn: async (params?: GoogleLoginParams) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return httpPost<GoogleLoginResponse>('/api/v1/auth/google', {
        timezone,
        platform: params?.platform,
      });
    },
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
  });
}
