import { useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SendOutlined from '@mui/icons-material/SendOutlined';
import { siteConfig } from '../../lib/content';
import { visuallyHidden } from '../../theme/a11y';
import { validateSupport, type SupportErrors, type SupportValues } from '../../lib/supportValidation';

type Values = SupportValues;
type Errors = SupportErrors;
const validate = validateSupport;

interface SupportFormProps {
  /** Pre-filled context, e.g. the article the user came from. */
  context?: { title: string; url: string };
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'drafted' } | { kind: 'error'; message: string };

/**
 * Support request form.
 * - With `siteConfig.support.endpoint`: POSTs JSON and shows real success/error states.
 * - Without it (the default — no public API is available): validates, then opens a
 *   pre-filled email to the support address. The UI states this before submission.
 */
export function SupportForm({ context }: SupportFormProps) {
  const endpoint = siteConfig.support.endpoint;
  const [values, setValues] = useState<Values>({
    email: '',
    number: '',
    requestType: context ? 'Product Questions' : '',
    query: context ? `Regarding “${context.title}” (${context.url}):\n\n` : '',
    website: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [k]: e.target.value };
    setValues(next);
    if (touched[k]) setErrors(validate(next));
  };
  const blur = (k: keyof Values) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    setTouched({ email: true, number: true, requestType: true, query: true });
    if (Object.keys(errs).length) {
      const first = (['email', 'number', 'requestType', 'query'] as const).find((k) => errs[k]);
      document.getElementById(`support-${first}`)?.focus();
      return;
    }
    if (values.website) {
      setStatus({ kind: 'sent' }); // silently drop bot submissions
      return;
    }
    const typeLabel = siteConfig.support.requestTypes.find((t) => t.value === values.requestType)?.label ?? values.requestType;
    if (!endpoint) {
      const body = [`Request type: ${typeLabel}`, `Contact email: ${values.email}`, values.number && `Contact number: ${values.number}`, '', values.query.trim()]
        .filter((l): l is string => typeof l === 'string')
        .join('\n');
      window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(`[Knowledge Base] ${typeLabel}`)}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: 'drafted' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, number: values.number, requestType: values.requestType, query: values.query, website: values.website }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus({ kind: 'sent' });
    } catch {
      setStatus({ kind: 'error', message: `Your request could not be sent. Please try again, or email ${siteConfig.contact.email}.` });
    }
  };

  if (status.kind === 'sent') {
    return (
      <Alert severity="success" role="status">
        <AlertTitle>Request sent</AlertTitle>
        Thanks — our team will reply to {values.email}.
      </Alert>
    );
  }

  const fieldError = (k: keyof Values) => (touched[k] ? errors[k] : undefined);

  return (
    <Box component="form" noValidate onSubmit={onSubmit} aria-labelledby="support-form-title">
      <Typography id="support-form-title" variant="h2" sx={{ mb: 2.5 }}>
        Send a request
      </Typography>

      {/* Honeypot: hidden from sighted and assistive-technology users */}
      <Box aria-hidden sx={visuallyHidden}>
        <label htmlFor="support-website">Company</label>
        <input id="support-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </Box>

      <Stack spacing={2}>
        <TextField
          id="support-email"
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={Boolean(fieldError('email'))}
          helperText={fieldError('email')}
        />
        <TextField
          id="support-number"
          name="number"
          type="tel"
          label="Phone (optional)"
          autoComplete="tel"
          value={values.number}
          onChange={set('number')}
          onBlur={blur('number')}
          error={Boolean(fieldError('number'))}
          helperText={fieldError('number')}
          slotProps={{ htmlInput: { inputMode: 'numeric' } }}
        />
        <TextField
          id="support-requestType"
          name="requestType"
          select
          label="Topic"
          required
          value={values.requestType}
          onChange={set('requestType')}
          onBlur={blur('requestType')}
          error={Boolean(fieldError('requestType'))}
          helperText={fieldError('requestType')}
        >
          {siteConfig.support.requestTypes.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="support-query"
          name="query"
          label="Message"
          required
          multiline
          minRows={5}
          placeholder="Product, version and any error message"
          value={values.query}
          onChange={set('query')}
          onBlur={blur('query')}
          error={Boolean(fieldError('query'))}
          helperText={fieldError('query')}
        />
      </Stack>

      <Box aria-live="polite" sx={{ mt: 2 }}>
        {status.kind === 'error' && <Alert severity="error">{status.message}</Alert>}
        {status.kind === 'drafted' && (
          <Alert severity="success">
            <AlertTitle>Email draft opened</AlertTitle>
            Send it from your email app to reach our team. If nothing opened, email {siteConfig.contact.email}.
          </Alert>
        )}
      </Box>

      {!endpoint && status.kind === 'idle' && (
        <Typography variant="meta" component="p" sx={{ mt: 2 }}>
          Opens a pre-filled email to {siteConfig.contact.email} — online submission isn’t connected yet.
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={status.kind === 'sending'}
        startIcon={status.kind === 'sending' ? <CircularProgress size={14} color="inherit" /> : <SendOutlined />}
        sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
      >
        {status.kind === 'sending' ? 'Sending…' : endpoint ? 'Submit request' : 'Continue in email'}
      </Button>
    </Box>
  );
}
