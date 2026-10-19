import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { cssVar } from '../../theme/tokens';

export interface Crumb {
  label: string;
  /** Omit for the current page. */
  to?: string;
}

/** Breadcrumb trail. "Home" is always first. A crumb without `to` is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Home', to: '/' }, ...items];
  return (
    <MuiBreadcrumbs aria-label="Breadcrumb" separator="/" maxItems={5} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
      {all.map((c, i) =>
        c.to ? (
          <Link key={`${c.to}-${i}`} href={c.to} sx={{ color: cssVar.textMuted, fontWeight: 400, py: 0.5, '&:hover': { color: cssVar.text } }}>
            {c.label}
          </Link>
        ) : (
          <Typography
            key={`current-${i}`}
            aria-current="page"
            variant="body2"
            sx={{ color: cssVar.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: 180, sm: 360, md: 480 } }}
          >
            {c.label}
          </Typography>
        ),
      )}
    </MuiBreadcrumbs>
  );
}
