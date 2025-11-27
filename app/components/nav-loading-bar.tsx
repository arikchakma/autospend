import { useEffect } from 'react';
import { useNavigation } from 'react-router';
import NProgress from 'nprogress';

NProgress.configure({
  minimum: 0.1,
  showSpinner: false,
  trickleSpeed: 200,
  easing: 'ease',
  speed: 400,
});

export function NavLoadingBar() {
  const navigation = useNavigation();
  const state = navigation.state;

  useEffect(() => {
    if (state === 'idle') {
      NProgress.done();
      return;
    }

    NProgress.start();
  }, [state]);

  return null;
}
