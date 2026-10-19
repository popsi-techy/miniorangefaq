import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CloseRounded from '@mui/icons-material/CloseRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import type { SxProps, Theme } from '@mui/material/styles';

interface FilterFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Used as placeholder and accessible label. */
  label: string;
  sx?: SxProps<Theme>;
}

/** Search field for narrowing the list on screen. Includes a clear button. */
export function FilterField({ value, onChange, label, sx }: FilterFieldProps) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      type="search"
      sx={sx}
      slotProps={{
        htmlInput: { 'aria-label': label },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton aria-label="Clear search" onClick={() => onChange('')} size="small" sx={{ mr: 0.5 }}>
                <CloseRounded />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
}
