import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import SwapVertRounded from '@mui/icons-material/SwapVertRounded';
import { cssVar, iconSize } from '../../theme/tokens';

interface SortSelectProps<K extends string> {
  value: K;
  options: Record<K, string>;
  onChange: (value: K) => void;
  disabled?: boolean;
  /** Shown instead of the options' label while disabled (e.g. "Relevance" while filtering). */
  disabledLabel?: string;
}

/** Compact sort dropdown for list toolbars; aligns with FilterField. */
export function SortSelect<K extends string>({ value, options, onChange, disabled, disabledLabel }: SortSelectProps<K>) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as K)}
      disabled={disabled}
      size="small"
      SelectDisplayProps={{ 'aria-label': 'Sort questions' }}
      renderValue={(v) => (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <SwapVertRounded sx={{ fontSize: iconSize.sm, color: cssVar.icon }} aria-hidden />
          {disabled && disabledLabel ? disabledLabel : options[v as K]}
        </Box>
      )}
      sx={{ minWidth: 176 }}
    >
      {(Object.keys(options) as K[]).map((k) => (
        <MenuItem key={k} value={k}>
          {options[k]}
        </MenuItem>
      ))}
    </Select>
  );
}
