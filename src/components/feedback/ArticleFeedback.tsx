import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ThumbDownOutlined from '@mui/icons-material/ThumbDownOutlined';
import ThumbUpOutlined from '@mui/icons-material/ThumbUpOutlined';
import { siteConfig } from '../../lib/content';
import { cssVar } from '../../theme/tokens';
import type { Faq } from '../../types/faq';

type Vote = 'yes' | 'no';

/** Pressed state for the vote buttons: inverted, so it does not rely on colour hue alone. */
const selectedSx = {
  bgcolor: cssVar.surfaceInverse,
  color: cssVar.textInverse,
  borderColor: cssVar.surfaceInverse,
  '&:hover': { bgcolor: cssVar.surfaceInverse, borderColor: cssVar.surfaceInverse },
} as const;
const storageKey = (id: string) => `mo-faq-feedback:${id}`;

function readVote(id: string): Vote | null {
  try {
    const v = window.localStorage.getItem(storageKey(id));
    return v === 'yes' || v === 'no' ? v : null;
  } catch {
    return null;
  }
}

/**
 * "Was this helpful?" control.
 * With `siteConfig.feedback.endpoint` set, votes are POSTed there. Without it (the default),
 * the vote is remembered in this browser only — the UI says so explicitly.
 */
export function ArticleFeedback({ faq }: { faq: Faq }) {
  // Rendered with key={faq.id}, so state initialises per article.
  const [vote, setVote] = useState<Vote | null>(() => readVote(faq.id));
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'local' | 'error'>(() => (readVote(faq.id) ? 'local' : 'idle'));
  const endpoint = siteConfig.feedback.endpoint;

  const submit = async (v: Vote) => {
    setVote(v);
    try {
      window.localStorage.setItem(storageKey(faq.id), v);
    } catch {
      /* storage unavailable: the vote still shows for this page view */
    }
    if (!endpoint) {
      setStatus('local');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ faqId: faq.id, helpful: v === 'yes' }) });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const message =
    status === 'error'
      ? 'Your feedback could not be sent. Please try again later.'
      : status === 'sent'
        ? 'Thanks for your feedback.'
        : status === 'local'
          ? 'Thanks — saved in this browser only; feedback is not yet sent to miniOrange.'
          : null;

  return (
    <Box
      component="section"
      aria-labelledby="feedback-heading"
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: cssVar.surfaceSubtle,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography id="feedback-heading" variant="h4" component="h2">
          Was this helpful?
        </Typography>
        <Stack direction="row" spacing={1} role="group" aria-label="Rate this answer" sx={{ flexShrink: 0 }}>
          {(['yes', 'no'] as const).map((v) => (
            <Button
              key={v}
              variant="outlined"
              startIcon={v === 'yes' ? <ThumbUpOutlined /> : <ThumbDownOutlined />}
              aria-pressed={vote === v}
              disabled={status === 'sending'}
              onClick={() => submit(v)}
              sx={{ flex: { xs: 1, sm: 'none' }, bgcolor: cssVar.surface, ...(vote === v ? selectedSx : {}) }}
            >
              {v === 'yes' ? 'Yes' : 'No'}
            </Button>
          ))}
        </Stack>
      </Box>
      <Box aria-live="polite">
        {vote && message && (
          <Typography variant="body2" color={status === 'error' ? 'error' : 'text.secondary'} sx={{ mt: 1.25 }}>
            {message}
            {vote === 'no' && status !== 'error' && (
              <>
                {' '}
                <Link component={RouterLink} to={`/support?article=${encodeURIComponent(faq.slug)}`} underline="always">
                  Contact support
                </Link>{' '}
                if you’re still stuck.
              </>
            )}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
