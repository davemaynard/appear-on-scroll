import {AppearOnScrollOptions, ResolvedOptions} from './types';

export const BASE_CLASS = 'appear-on-scroll';
export const VISIBLE_CLASS = 'appear-on-scroll--visible';
/** Marker for elements that animate even under prefers-reduced-motion (respectReducedMotion: false). */
export const MOTION_CLASS = 'appear-on-scroll--motion';

/** Identifies the injected stylesheet, shared by every instance. */
export const STYLE_ATTRIBUTE = 'data-appear-on-scroll';

/** Starting filter for the blur animation. */
export const BLUR_FROM = 'blur(12px)';

/** Every inline custom property this library may set on an element. */
export const INLINE_PROPERTIES = [
  '--aos-duration',
  '--aos-delay',
  '--aos-easing',
  '--aos-transform-from',
  '--aos-filter-from',
] as const;

export const DEFAULTS = {
  delay: 0,
  duration: 600,
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  once: false,
  animation: 'slide',
  direction: 'auto',
  distance: '25px',
  scale: 0.95,
  stagger: 0,
  threshold: 0,
  rootMargin: '0px',
  respectReducedMotion: true,
} as const satisfies ResolvedOptions;

/**
 * Callers forward props they may not have — `{once: props.once}` passes an explicit
 * `undefined`, and a plain spread would overwrite the default with it. Dropping
 * undefined-valued keys first means an absent option and an unset one agree.
 */
const defined = <T extends object>(options: T): Partial<T> => {
  const out: Partial<T> = {};
  for (const key of Object.keys(options) as (keyof T)[]) {
    if (options[key] !== undefined) out[key] = options[key];
  }
  return out;
};

export const resolveOptions = (options: AppearOnScrollOptions = {}): ResolvedOptions => ({
  ...DEFAULTS,
  ...defined(options),
  // v1 compatibility: slide: false meant a pure fade, and slideDistance is now distance.
  animation: options.animation ?? (options.slide === false ? 'fade' : DEFAULTS.animation),
  distance: options.distance ?? options.slideDistance ?? DEFAULTS.distance,
});
