/** How the element animates in. Every animation composes with a fade. */
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'blur';

/**
 * The direction the element travels as it appears (slide animation only).
 * 'auto' follows the scroll: elements slide up when you scroll down to them,
 * and slide down when you scroll back up to them.
 */
export type Direction = 'auto' | 'up' | 'down' | 'left' | 'right';

export interface AppearOnScrollOptions {
  /** Milliseconds to wait before the animation starts. Default: 0. */
  delay?: number;
  /** Milliseconds the animation runs. Default: 600. */
  duration?: number;
  /** CSS easing for the animation. Default: 'cubic-bezier(0.5, 0, 0, 1)'. */
  easing?: string;
  /** When true, elements stay visible after their first appearance. Default: false. */
  once?: boolean;
  /** Animation style. Default: 'slide' (or 'fade' when the v1 option slide: false is passed). */
  animation?: AnimationType;
  /** Travel direction for the slide animation. Default: 'auto' (scroll-direction-aware). */
  direction?: Direction;
  /** Any CSS length the slide travels, e.g. '25px' or '2rem'. Default: '25px'. */
  distance?: string;
  /** Starting scale for the zoom animation. Default: 0.95. */
  scale?: number;
  /** Milliseconds added per element when several appear in the same observer batch. Default: 0. */
  stagger?: number;
  /** Passed through to IntersectionObserver. Default: 0. */
  threshold?: number | number[];
  /** Passed through to IntersectionObserver. Default: '0px'. */
  rootMargin?: string;
  /**
   * When true and the user prefers reduced motion, elements are simply visible:
   * no hiding, no transition. Default: true.
   */
  respectReducedMotion?: boolean;

  // --- v1 compatibility ---
  /** v1 option: slide: false means a pure fade. Superseded by animation. */
  slide?: boolean;
  /** v1 alias of distance. */
  slideDistance?: string;
}

export type ResolvedOptions = Required<Omit<AppearOnScrollOptions, 'slide' | 'slideDistance'>>;
