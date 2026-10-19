import { useId, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import { navigation } from '../../lib/content';
import { cssVar, fontSize, iconSize, layout } from '../../theme/tokens';
import type { NavGroup } from '../../types/faq';
import { AppLink } from '../common/AppLink';
import { PageContainer } from '../common/PageContainer';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const PLACEHOLDER = 'Links coming soon';

function NavMenu({ group }: { group: NavGroup }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = useId();
  const open = Boolean(anchor);
  return (
    <>
      <Button
        id={`${id}-button`}
        variant="text"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ExpandMoreRounded sx={{ transition: 'transform var(--motion-duration)', transform: open ? 'rotate(180deg)' : 'none' }} />}
        sx={{ px: 1.25, color: open ? cssVar.text : cssVar.textMuted, fontWeight: 500 }}
      >
        {group.label}
      </Button>
      <Menu id={`${id}-menu`} anchorEl={anchor} open={open} onClose={() => setAnchor(null)} slotProps={{ list: { 'aria-labelledby': `${id}-button` } }}>
        {group.links.length ? (
          group.links.map((link) => (
            <MenuItem key={link.href} component={AppLink} href={link.href} onClick={() => setAnchor(null)} sx={{ minWidth: 220 }}>
              {link.label}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled sx={{ minWidth: 220 }}>
            {PLACEHOLDER}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

function MobileGroup({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)} aria-expanded={open} sx={{ borderRadius: 1, minHeight: layout.touchTarget }}>
        <ListItemText primary={group.label} slotProps={{ primary: { sx: { fontSize: fontSize.md, fontWeight: 500 } } }} />
        <ExpandMoreRounded sx={{ fontSize: iconSize.md, color: cssVar.icon, transform: open ? 'rotate(180deg)' : 'none' }} />
      </ListItemButton>
      <Collapse in={open} unmountOnExit>
        <List disablePadding>
          {group.links.length ? (
            group.links.map((link) => (
              <ListItemButton key={link.href} component={AppLink} href={link.href} onClick={onNavigate} sx={{ pl: 3, borderRadius: 1, minHeight: layout.touchTarget }}>
                <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontSize: fontSize.md, color: cssVar.textMuted } } }} />
              </ListItemButton>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ pl: 3, py: 1.5 }}>
              {PLACEHOLDER}
            </Typography>
          )}
        </List>
      </Collapse>
    </>
  );
}

/**
 * Placeholder for the miniOrange global header (out of scope for this portal):
 * logo · Products ▾ · Resources ▾ · theme switch · Contact Support.
 * Sticky and identical on every page — no page-specific content or active states.
 */
export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const close = () => setDrawerOpen(false);

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: cssVar.surfaceHeader,
        backdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <PageContainer>
        <Box sx={{ height: layout.headerHeight, display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
          <Logo />
          <Box sx={{ flex: 1 }} />
          <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {navigation.header.map((group) => (
              <NavMenu key={group.label} group={group} />
            ))}
          </Box>
          <ThemeToggle />
          <Button component={RouterLink} to="/support" variant="contained" sx={{ display: { xs: 'none', md: 'inline-flex' }, whiteSpace: 'nowrap' }}>
            Contact Support
          </Button>
          <IconButton aria-label="Open menu" aria-controls="mobile-menu" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)} sx={{ display: { md: 'none' } }}>
            <MenuRounded />
          </IconButton>
        </Box>
      </PageContainer>

      <Drawer id="mobile-menu" anchor="right" open={drawerOpen} onClose={close} slotProps={{ paper: { sx: { width: 'min(320px, 100vw)', display: 'flex', flexDirection: 'column' } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, height: layout.headerHeight, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h3" component="p">
            Menu
          </Typography>
          <IconButton aria-label="Close menu" onClick={close}>
            <CloseRounded />
          </IconButton>
        </Box>
        <List component="nav" aria-label="Main" sx={{ p: 1 }}>
          {navigation.header.map((group) => (
            <MobileGroup key={group.label} group={group} onNavigate={close} />
          ))}
        </List>
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button component={RouterLink} to="/support" variant="contained" fullWidth onClick={close}>
            Contact Support
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
