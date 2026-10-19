import { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { getFaqBySlug, siteConfig } from '../../lib/content';
import { cssVar, fontSize, font, iconSize, letterSpacing, lineHeight } from '../../theme/tokens';
import type { Block, Inline } from '../../types/faq';

/**
 * Resolves article links. Imported articles route in-app; articles that are not part of the
 * imported sample fall back to the source site so links never dead-end.
 */
function resolveHref(href: string) {
  const m = href.match(/^\/knowledgebase\/([^/?#]+)/);
  if (m && !getFaqBySlug(m[1])) return `${siteConfig.sourceOrigin}/knowledgebase/${m[1]}/`;
  return href;
}

const inlineCodeSx = {
  fontFamily: 'var(--font-family-mono)',
  fontSize: '0.88em',
  bgcolor: cssVar.surfaceSubtle,
  border: 1,
  borderColor: 'divider',
  borderRadius: 0.5,
  px: 0.5,
  py: '1px',
  overflowWrap: 'anywhere',
} as const;

function Inlines({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.t === 'br') return <br key={i} />;
        if (n.t === 'link') {
          return (
            <Link key={i} href={resolveHref(n.href)} underline="always" sx={{ textDecorationColor: cssVar.textMuted, '&:hover': { textDecorationColor: cssVar.text } }}>
              <Inlines nodes={n.children} />
            </Link>
          );
        }
        let el: React.ReactNode = n.v;
        const marks = n.marks ?? [];
        if (marks.includes('code')) el = <Box component="code" sx={inlineCodeSx}>{el}</Box>;
        if (marks.includes('bold')) el = <Box component="strong" sx={{ fontWeight: font.weightSemibold }}>{el}</Box>;
        if (marks.includes('italic')) el = <em>{el}</em>;
        if (marks.includes('underline')) el = <u>{el}</u>;
        return <Fragment key={i}>{el}</Fragment>;
      })}
    </>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Box sx={{ position: 'relative', my: 2.5 }}>
      <Box
        component="pre"
        tabIndex={0}
        aria-label="Code sample"
        sx={{
          m: 0,
          p: 2,
          pr: 6,
          overflowX: 'auto',
          bgcolor: cssVar.surfaceSubtle,
          color: cssVar.text,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          fontFamily: 'var(--font-family-mono)',
          fontSize: fontSize.sm,
          lineHeight: lineHeight.body,
        }}
      >
        <code>{code}</code>
      </Box>
      <Tooltip title={copied ? 'Copied' : 'Copy code'}>
        <IconButton onClick={copy} aria-label={copied ? 'Code copied' : 'Copy code'} size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
          {copied ? <CheckRounded /> : <ContentCopyRounded />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

const headingSx = {
  2: { fontSize: { xs: fontSize.xl, md: fontSize['2xl'] }, mt: 5, mb: 1.5 },
  3: { fontSize: fontSize.xl, mt: 4, mb: 1 },
  4: { fontSize: fontSize.lg, mt: 3, mb: 1 },
} as const;

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return (
        <Typography
          component={`h${block.level}` as 'h2'}
          sx={{ ...headingSx[block.level], fontWeight: font.weightSemibold, lineHeight: lineHeight.tight, letterSpacing: letterSpacing.snug }}
        >
          <Inlines nodes={block.content} />
        </Typography>
      );
    case 'paragraph':
      return (
        <Typography component="p" sx={{ my: 1.5 }}>
          <Inlines nodes={block.content} />
        </Typography>
      );
    case 'list':
      return (
        <Box
          component={block.ordered ? 'ol' : 'ul'}
          start={block.start}
          sx={{
            my: 1.5,
            pl: 3,
            '& > li': { pl: 0.5, my: 0.75 },
            '& > li::marker': { color: cssVar.textMuted, fontVariantNumeric: 'tabular-nums' },
            '& > li > p:first-of-type': { mt: 0 },
            '& > li > p:last-of-type': { mb: 0 },
          }}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <Blocks blocks={item} />
            </li>
          ))}
        </Box>
      );
    case 'image':
      return (
        <Box component="figure" sx={{ my: 3, mx: 0 }}>
          <Link
            href={block.src}
            aria-label={`Open image${block.alt ? `: ${block.alt}` : ''} in full size`}
            sx={{ display: 'block', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', lineHeight: 0 }}
          >
            <Box
              component="img"
              src={block.src}
              alt={block.alt}
              width={block.width}
              height={block.height}
              loading="lazy"
              decoding="async"
              sx={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Link>
          {block.caption && (
            <Typography component="figcaption" variant="meta" sx={{ display: 'block', mt: 1 }}>
              {block.caption}
            </Typography>
          )}
        </Box>
      );
    case 'table':
      return (
        <TableContainer tabIndex={0} role="region" aria-label="Table" sx={{ my: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableBody>
              {block.rows.map((row, r) => (
                <TableRow key={r} sx={{ '&:last-child td, &:last-child th': { borderBottom: 0 } }}>
                  {row.map((cell, c) => (
                    <TableCell
                      key={c}
                      component={cell.header ? 'th' : 'td'}
                      scope={cell.header ? 'col' : undefined}
                      sx={{
                        verticalAlign: 'top',
                        color: cssVar.text,
                        fontWeight: cell.header ? font.weightSemibold : font.weightRegular,
                        bgcolor: cell.header ? cssVar.surfaceSubtle : undefined,
                        minWidth: 120,
                      }}
                    >
                      <Inlines nodes={cell.content} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    case 'code':
      return <CodeBlock code={block.code} />;
    case 'video': {
      if (block.provider === 'file') {
        return <Box component="video" controls preload="metadata" src={block.src} title={block.title} sx={{ my: 3, width: '100%', borderRadius: 2 }} />;
      }
      const src = block.provider === 'youtube' ? `https://www.youtube-nocookie.com/embed/${block.videoId}` : `https://player.vimeo.com/video/${block.videoId}`;
      return (
        <Box sx={{ my: 3, position: 'relative', aspectRatio: '16 / 9', borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
          <Box
            component="iframe"
            src={src}
            title={block.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </Box>
      );
    }
    case 'note':
      return (
        <Box sx={{ my: 3, px: 2, py: 1.5, display: 'flex', gap: 1.5, bgcolor: cssVar.surfaceSubtle, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <InfoOutlined sx={{ color: cssVar.icon, fontSize: iconSize.md, mt: '3px' }} aria-hidden />
          <Box sx={{ minWidth: 0, '& > :first-of-type': { mt: 0 }, '& > :last-child': { mb: 0 } }}>
            <Blocks blocks={block.blocks} />
          </Box>
        </Box>
      );
    case 'divider':
      return <Box component="hr" sx={{ my: 4, border: 0, borderTop: 1, borderColor: 'divider' }} />;
    default:
      return null;
  }
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

/**
 * Renders structured article content (see types/faq.ts › Block). No raw HTML is ever injected,
 * so imported content cannot execute scripts. Body text is 15px with relaxed leading.
 */
export function ArticleContent({ blocks }: { blocks: Block[] }) {
  return (
    <Box
      sx={{
        fontSize: fontSize.lg,
        lineHeight: lineHeight.article,
        color: cssVar.text,
        '& p, & li': { fontSize: 'inherit', lineHeight: 'inherit' },
        '& > :first-of-type': { mt: 0 },
        overflowWrap: 'break-word',
      }}
    >
      <Blocks blocks={blocks} />
    </Box>
  );
}
