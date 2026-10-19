/**
 * Hides content visually while keeping it available to screen readers.
 * Note: values are strings on purpose — in MUI `sx`, `width: 1` means 100%.
 */
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;
