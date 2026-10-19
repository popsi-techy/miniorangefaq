import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import { categoryPath, faqPath, getCategoryById, getCategoryTrail, getMostViewed } from '../../lib/content';
import { searchCategories, searchFaqs, tokenize } from '../../lib/search';
import { cssVar, fontSize, iconSize, layout, spacingUnit } from '../../theme/tokens';
import type { Category, Faq } from '../../types/faq';
import { HighlightedText } from './HighlightedText';

type Option =
  | { kind: 'faq'; faq: Faq; group: string }
  | { kind: 'category'; category: Category; group: string }
  | { kind: 'all'; query: string; group: string };

interface SearchInputProps {
  /** "hero" = large homepage field with a submit button; "compact" = header/page field. */
  size?: 'hero' | 'compact';
  placeholder?: string;
  autoFocus?: boolean;
  /** Accessible label; visually hidden. */
  label?: string;
  /** Hero field shortened once it has pinned under the global header. */
  pinned?: boolean;
}

const SUGGESTION_LIMIT = 6;

/**
 * Site search with as-you-type suggestions (questions and categories).
 * Enter submits to /search?q=…; choosing a suggestion opens it directly.
 * On /search the field mirrors the current query.
 */
export function SearchInput({ size = 'compact', placeholder = 'Search FAQs, Setup helps or fixes', autoFocus, label = 'Search the knowledge base', pinned = false }: SearchInputProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const urlQuery = location.pathname === '/search' ? params.get('q') ?? '' : '';
  const [input, setInput] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);

  // Mirror the URL query when it changes (e.g. Back/Forward on /search)
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setInput(urlQuery);
  }

  const options = useMemo<Option[]>(() => {
    const q = input.trim();
    if (!q) {
      return getMostViewed(5).map((faq) => ({ kind: 'faq', faq, group: 'Popular questions' }));
    }
    const { results } = searchFaqs(q, SUGGESTION_LIMIT);
    const cats = searchCategories(q, 3);
    return [
      ...cats.map((category): Option => ({ kind: 'category', category, group: 'Categories' })),
      ...results.map(({ faq }): Option => ({ kind: 'faq', faq, group: 'Questions' })),
      { kind: 'all', query: q, group: 'Questions' },
    ];
  }, [input]);

  const terms = useMemo(() => tokenize(input).terms, [input]);

  const submit = (q: string) => {
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const choose = (opt: Option | string | null) => {
    if (!opt) return;
    if (typeof opt === 'string') return submit(opt);
    setOpen(false);
    if (opt.kind === 'all') return submit(opt.query);
    if (opt.kind === 'category') return navigate(categoryPath(opt.category));
    navigate(faqPath(opt.faq), { state: input.trim() ? { from: 'search', query: input.trim() } : undefined });
    if (location.pathname !== '/search') setInput('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const hero = size === 'hero';
  const heroPinned = hero && pinned;
  const heroFieldHeight = heroPinned ? layout.touchTarget : layout.controlHeightLarge;
  const heroPadY = heroPinned ? spacingUnit * 0.5 : spacingUnit;
  const heroPadEnd = heroPinned ? spacingUnit * 0.5 : spacingUnit * 0.75;
  const optionIconSx = { fontSize: iconSize.sm, color: cssVar.icon, mt: '3px', flexShrink: 0 } as const;

  return (
    <Box component="form" role="search" onSubmit={onSubmit} sx={{ width: '100%' }}>
      <Autocomplete<Option, false, false, true>
        freeSolo
        fullWidth
        sx={
          hero
            ? {
                '& .MuiOutlinedInput-root': {
                  alignItems: 'center',
                  minHeight: heroFieldHeight,
                  paddingTop: `${heroPadY}px !important`,
                  paddingBottom: `${heroPadY}px !important`,
                  paddingRight: `${heroPadEnd}px !important`,
                },
                '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                  minHeight: heroPinned ? 28 : layout.controlHeightLarge - heroPadY * 2,
                  padding: '0 !important',
                },
              }
            : undefined
        }
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        groupBy={(o) => o.group}
        filterOptions={(o) => o}
        inputValue={input}
        onInputChange={(_, v, reason) => {
          if (reason !== 'reset') setInput(v);
        }}
        value={null}
        onChange={(_, v) => choose(v)}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.kind === 'faq' ? o.faq.title : o.kind === 'category' ? o.category.name : o.query)}
        isOptionEqualToValue={() => false}
        clearOnBlur={false}
        handleHomeEndKeys={false}
        slotProps={{ listbox: { sx: { maxHeight: 400 } } }}
        renderOption={(props, o) => {
          const { key, ...rest } = props as typeof props & { key: string };
          if (o.kind === 'all') {
            return (
              <li key={key} {...rest} style={{ gap: 10 }}>
                <SearchRounded sx={optionIconSx} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  See all results for “{o.query}”
                </Typography>
              </li>
            );
          }
          if (o.kind === 'category') {
            const trail = getCategoryTrail(o.category.id);
            return (
              <li key={key} {...rest} style={{ gap: 10, alignItems: 'flex-start' }}>
                <FolderOutlined sx={optionIconSx} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    <HighlightedText text={o.category.name} terms={terms} />
                  </Typography>
                  {trail.length > 1 && <Typography variant="meta">{trail[0].name}</Typography>}
                </Box>
              </li>
            );
          }
          const cat = getCategoryById(o.faq.categoryId);
          const Icon = input.trim() ? ArticleOutlined : TrendingUpRounded;
          return (
            <li key={key} {...rest} style={{ gap: 10, alignItems: 'flex-start' }}>
              <Icon sx={optionIconSx} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  <HighlightedText text={o.faq.title} terms={terms} />
                </Typography>
                {cat && <Typography variant="meta">{getCategoryTrail(cat.id).map((c) => c.name).join(' / ')}</Typography>}
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus={autoFocus}
            placeholder={placeholder}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                type: 'search',
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ fontSize: hero ? `${iconSize.md}px !important` : undefined }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 0.5, mr: 0, height: 'auto', maxHeight: 'none', alignSelf: 'center' }}>
                    {input && (
                      <IconButton aria-label="Clear search" size="small" onClick={() => setInput('')}>
                        <CloseRounded />
                      </IconButton>
                    )}
                    {hero && (
                      <Button type="submit" variant="contained" size="small" sx={{ minHeight: pinned ? 28 : 34, px: 1.75 }}>
                        Search
                      </Button>
                    )}
                  </InputAdornment>
                ),
                sx: hero
                  ? {
                      pl: heroPinned ? 1.25 : 1.75,
                      fontSize: heroPinned ? fontSize.md : fontSize.lg,
                      bgcolor: cssVar.surface,
                      '@media (pointer: coarse)': { minHeight: layout.controlHeightLarge },
                    }
                  : {
                      pl: 1.25,
                      bgcolor: cssVar.surfaceSubtle,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: cssVar.border },
                      '&.Mui-focused': { bgcolor: cssVar.surface },
                    },
              },
              htmlInput: { ...params.slotProps.htmlInput, enterKeyHint: 'search', 'aria-label': label },
            }}
          />
        )}
      />
    </Box>
  );
}
