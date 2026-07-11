// Single source of truth for animation durations, easings, and variants.
// Import these instead of writing inline transition/variant objects.

export const duration = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
} as const;

export const ease = {
  standard: [0.22, 1, 0.36, 1],
  entrance: [0.16, 1, 0.3, 1],
} as const;

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.base, ease: ease.standard },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: duration.base, ease: ease.standard },
    },
  },
  card: {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.8 },
    },
  },
  staggerContainer: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  staggerItem: {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: duration.fast } },
  },
} as const;

export const hover = {
  lift: { y: -4 },
  cardLift: { y: -3, boxShadow: "0 12px 32px -12px rgba(0,0,0,0.18)" },
} as const;
