/** Reveals an item's <HoverArrow /> on hover and keyboard focus. Spread into the item's `sx`. */
export const hoverArrowRevealSx = {
  '&:hover .hover-arrow, &:focus-visible .hover-arrow': { opacity: 1, transform: 'none' },
} as const;
