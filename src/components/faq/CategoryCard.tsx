import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import { categoryPath, getShortName } from '../../lib/content';
import { cssVar, iconSize } from '../../theme/tokens';
import type { Category } from '../../types/faq';

/**
 * Compact, centred tile for a featured product. The mark leads; the semibold
 * short name sits tight underneath it.
 * The whole tile is one link; the full category name is its accessible name.
 */
export function CategoryCard({ category }: { category: Category }) {
  const shortName = getShortName(category);
  return (
    <Box
      component={RouterLink}
      to={categoryPath(category)}
      aria-label={category.name}
      title={shortName !== category.name ? category.name : undefined}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
        gap: 1,
        height: '100%',
        px: 1.5,
        py: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: cssVar.surface,
        color: cssVar.text,
        textDecoration: 'none',
        transition: 'transform var(--motion-duration) var(--motion-easing), box-shadow var(--motion-duration) var(--motion-easing)',
        // Hover: lift with a soft shadow; colours stay the same
        '&:hover': { transform: 'translateY(-2px)', boxShadow: cssVar.shadowLift },
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 52,
          height: 52,
          flexShrink: 0,
          borderRadius: 2,
          // Logos are designed for light backgrounds; keep their plate white in both themes.
          bgcolor: 'var(--color-background-primary)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {category.logo ? (
          <Box
            component="img"
            src={category.logo}
            alt=""
            width={iconSize.product}
            height={iconSize.product}
            loading="lazy"
            sx={{ objectFit: 'contain', width: iconSize.product, height: iconSize.product }}
          />
        ) : (
          <FolderOutlined sx={{ fontSize: iconSize.product, color: 'var(--color-icon-secondary)' }} />
        )}
      </Box>
      <Box sx={{ minWidth: 0, width: '100%' }}>
        <Typography variant="h4" component="h3" sx={{ overflowWrap: 'anywhere' }}>
          {shortName}
        </Typography>
      </Box>
    </Box>
  );
}
