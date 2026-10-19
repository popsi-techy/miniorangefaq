import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/** Recoverable error with an optional retry action. */
export function ErrorState({ title = 'Something went wrong', message = 'This content could not be loaded.', onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        onRetry && (
          <Button size="small" variant="outlined" startIcon={<RefreshOutlined />} onClick={onRetry}>
            Try again
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}
