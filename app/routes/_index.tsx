import { href, redirect } from 'react-router';
import type { Route } from './+types/_index';

export function loader(args: Route.LoaderArgs) {
  return redirect(href('/transactions'));
}
