import Box from '@mui/material/Box';
import { cssVar } from '../../theme/tokens';

const W = 720; // drawing width of one corner bundle
const H = 420; // drawing height
const LINES = 11;
const HALF = 120; // half a wavelength
const SLOPE = 0.32; // downward tilt per unit x, so the bundle runs diagonally

/**
 * A wavy line that drifts diagonally: one quadratic curve, then smooth reflections (T)
 * whose end points descend by SLOPE, producing an even wave along a tilted axis.
 */
function wave(i: number) {
  const y0 = -60 + i * 22;
  const amp = 18 + i * 1.5;
  const phase = i * 6; // slight offset per line so the bundle feels organic
  let d = `M${-phase} ${y0} Q ${HALF / 2 - phase} ${y0 - amp + (HALF / 2) * SLOPE} ${HALF - phase} ${y0 + HALF * SLOPE}`;
  for (let x = HALF * 2; x <= W + HALF; x += HALF) d += ` T ${x - phase} ${y0 + x * SLOPE}`;
  return d;
}

/** Bundle of wavy lines anchored in a corner and fading out toward the centre. */
function CornerWaves({ corner }: { corner: 'top-left' | 'bottom-right' }) {
  const topLeft = corner === 'top-left';
  const fade = `radial-gradient(farthest-side at ${topLeft ? '0% 0%' : '100% 100%'}, black 25%, transparent 100%)`;
  return (
    <Box
      sx={{
        position: 'absolute',
        width: { md: '46%', lg: '42%' },
        height: '100%',
        ...(topLeft ? { top: 0, left: 0 } : { bottom: 0, right: 0 }),
        maskImage: fade,
        WebkitMaskImage: fade,
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMinYMin slice"
        sx={{ width: '100%', height: '100%', display: 'block', transform: topLeft ? undefined : 'rotate(180deg)' }}
      >
        {Array.from({ length: LINES }, (_, i) => (
          <path key={i} d={wave(i)} fill="none" stroke={cssVar.heroLine} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.35 + (i / LINES) * 0.65} />
        ))}
      </Box>
    </Box>
  );
}

/**
 * Decorative, full-bleed background for the homepage hero:
 * a faint warm glow and wavy line bundles in two diagonally opposite corners. Static, aria-hidden.
 */
export function HeroBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: [
          `radial-gradient(45% 90% at 0% 0%, ${cssVar.heroGlow} 0%, transparent 100%)`,
          `radial-gradient(45% 90% at 100% 100%, ${cssVar.heroGlow} 0%, transparent 100%)`,
          `radial-gradient(50% 60% at 50% 0%, ${cssVar.heroGlowSoft} 0%, transparent 100%)`,
        ].join(', '),
      }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <CornerWaves corner="top-left" />
        <CornerWaves corner="bottom-right" />
      </Box>
    </Box>
  );
}
