import { useMutation } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleIcon } from './google-icon';
import { Button } from './ui/button';
import { googleLoginMutation } from '~/queries/auth';

export function GoogleLoginButton() {
  const { mutateAsync: googleLogin, isPending } = useMutation(
    googleLoginMutation()
  );

  return (
    <Button
      className="relative gap-2"
      type="submit"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        toast.promise(googleLogin({ platform: 'web' }), {
          loading: 'Logging in with Google...',
          success: 'Redirecting to Google...',
          error: (err) => err?.message ?? 'Failed to log in with Google',
        });
      }}
    >
      {isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
      {!isPending && <GoogleIcon className="h-4 w-4" />}
      Continue with Google
    </Button>
  );
}
