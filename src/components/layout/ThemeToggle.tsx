import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useColorScheme } from '@mui/material/styles';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { cssVar, iconSize, layout, radius } from '../../theme/tokens';

/**
 * Segmented light/dark switch. Defaults to light until the user picks one;
 * the choice is remembered in this browser (MUI stores it under "mui-mode").
 */
export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const resolved = mode === 'system' ? systemMode : mode;
  if (!resolved) return <Box sx={{ width: 64, height: 32 }} />; // reserve space until known

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={resolved}
      onChange={(_, v: 'light' | 'dark' | null) => v && setMode(v)}
      aria-label="Colour theme"
      sx={{
        p: '2px',
        gap: '2px',
        border: 1,
        borderColor: 'divider',
        borderRadius: `${radius.md + 2}px`,
        bgcolor: cssVar.surfaceSubtle,
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          borderRadius: `${radius.md}px !important`,
          m: 0,
        },
      }}
    >
      {(
        [
          ['light', 'Light theme', <LightModeOutlined key="l" />],
          ['dark', 'Dark theme', <DarkModeOutlined key="d" />],
        ] as const
      ).map(([value, label, icon]) => (
        <ToggleButton
          key={value}
          value={value}
          aria-label={label}
          title={label}
          sx={{
            width: 30,
            height: 26,
            p: 0,
            color: cssVar.icon,
            '& svg': { fontSize: iconSize.sm },
            '&:hover': { bgcolor: 'transparent', color: cssVar.text },
            '&.Mui-selected, &.Mui-selected:hover': { bgcolor: cssVar.surface, color: cssVar.text, boxShadow: `0 0 0 1px ${cssVar.border}` },
            '@media (pointer: coarse)': { width: layout.touchTarget - 4, height: layout.touchTarget - 4 },
          }}
        >
          {icon}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
