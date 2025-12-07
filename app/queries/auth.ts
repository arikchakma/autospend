import { mutationOptions } from '@tanstack/react-query';
import { httpPost } from '~/lib/http';

type GoogleLoginResponse = {
  authorizationUrl: string;
};

export function googleLoginMutation() {
  return mutationOptions({
    mutationFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return httpPost<GoogleLoginResponse>('/api/v1/auth/google', {
        timezone,
      });
    },
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
  });
}
