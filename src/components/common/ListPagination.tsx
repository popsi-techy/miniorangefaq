import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface ListPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Next page index (always current + 1). */
  onChange: (page: number) => void;
}

/** Appends the next page of a list. Renders nothing when everything is already shown. */
export function ListPagination({ page, pageSize, total, onChange }: ListPaginationProps) {
  const pages = Math.ceil(total / pageSize);
  if (page >= pages) return null;
  return (
    <Box component="nav" aria-label="Load more" sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
      <Button variant="outlined" onClick={() => onChange(page + 1)}>
        Load more
      </Button>
    </Box>
  );
}
