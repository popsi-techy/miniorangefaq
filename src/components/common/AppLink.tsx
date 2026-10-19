import { forwardRef } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';
import { isExternal } from '../../lib/format';

/**
 * Link adapter used by MUI (`component={AppLink}` / theme LinkBehavior).
 * Internal paths use client-side routing; external URLs open as normal anchors in a new tab.
 */
export const AppLink = forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'> & { href?: string; to?: RouterLinkProps['to'] }>(
  function AppLink({ href, to, ...props }, ref) {
    const target = to ?? href ?? '/';
    if (typeof target === 'string' && isExternal(target)) {
      const isWeb = /^(https?:)?\/\//.test(target);
      return <a ref={ref} href={target} {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...props} />;
    }
    return <RouterLink ref={ref} to={target} {...props} />;
  },
);
