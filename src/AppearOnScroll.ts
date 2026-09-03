import {
  BASE_CLASS,
  DEFAULTS,
  BLUR_FROM,
  INLINE_PROPERTIES,
  MOTION_CLASS,
  VISIBLE_CLASS,
  resolveOptions,
} from './constants';
import {acquireStylesheet, releaseStylesheet} from './styles';
import {AppearOnScrollOptions, ResolvedOptions} from './types';

/** Which side of the viewport an element is (or was last) beyond. */
type Side = 'above' | 'below';

/** Arrivals further apart than this belong to separate stagger waves. */
const WAVE_IDLE_MS = 50;

/** performance.now where available; Date.now is close enough and always is. */
const now_ = (): number => (typeof performance === 'undefined' ? Date.now() : performance.now());

export class AppearOnScroll {
  readonly options: ResolvedOptions;
  readonly elements: HTMLElement[] = [];

  private observer?: IntersectionObserver;
  private hasStylesheet = false;
  private destroyed = false;

  /**
   * Where each hidden element last sat relative to the viewport. Recorded from
   * observer entries only — this is what makes direction-aware slides work
   * without a scroll listener.
   */
  private lastSide = new WeakMap<Element, Side>();

  /**
   * Stagger position within the current arrival wave. The observer batches its
   * callbacks by scroll speed, not by what the eye sees as one group, so counting
   * within a callback made the cascade depend on how fast the user scrolled.
   * A wave instead ends after WAVE_IDLE_MS of no arrivals: elements that land
   * together cascade, and one arriving alone later starts again at zero delay.
   */
  private waveIndex = 0;
  private lastArrivalAt = -Infinity;

  constructor(selector: string, options?: AppearOnScrollOptions) {
    this.options = resolveOptions(options);

    // SSR-safe: only construction touches the DOM, and only when it exists.
    if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    this.elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!this.elements.length) return;

    acquireStylesheet();
    this.hasStylesheet = true;

    this.observer = new IntersectionObserver(this.onIntersect, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin,
    });

    for (const element of this.elements) {
      this.prepare(element);
      this.observer.observe(element);
    }
  }

  /** Disconnect the observer, restore every element, and drop the injected styles. */
  destroy = (): void => {
    if (this.destroyed) return;
    this.destroyed = true;

    this.observer?.disconnect();
    this.observer = undefined;

    for (const element of this.elements) {
      element.classList.remove(BASE_CLASS, VISIBLE_CLASS, MOTION_CLASS);
      for (const property of INLINE_PROPERTIES) {
        element.style.removeProperty(property);
      }
    }

    if (this.hasStylesheet) {
      this.hasStylesheet = false;
      releaseStylesheet();
    }
  };

  /** Hide the element and write its animation settings as inline custom properties. */
  private prepare(element: HTMLElement): void {
    const {delay, duration, easing, animation, scale, respectReducedMotion} = this.options;

    element.classList.add(BASE_CLASS);
    if (!respectReducedMotion) element.classList.add(MOTION_CLASS);

    // The stylesheet carries the defaults; only differences go inline.
    if (duration !== DEFAULTS.duration) element.style.setProperty('--aos-duration', `${duration}ms`);
    if (delay !== DEFAULTS.delay) element.style.setProperty('--aos-delay', `${delay}ms`);
    if (easing !== DEFAULTS.easing) element.style.setProperty('--aos-easing', easing);

    if (animation === 'zoom') element.style.setProperty('--aos-transform-from', `scale(${scale})`);
    if (animation === 'blur') element.style.setProperty('--aos-filter-from', BLUR_FROM);
    if (animation === 'slide') this.setTransformFrom(element, this.slideFrom('below'));
  }

  private onIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;

      if (entry.isIntersecting) {
        this.reveal(element, entry, this.nextWavePosition());
        if (this.options.once) this.observer?.unobserve(element);
      } else {
        this.lastSide.set(element, this.offscreenSide(entry));
        if (!this.options.once) element.classList.remove(VISIBLE_CLASS);
      }
    }
  };

  /** Position in the current wave, restarting once arrivals have gone quiet. */
  private nextWavePosition(): number {
    const now = now_();
    if (now - this.lastArrivalAt > WAVE_IDLE_MS) this.waveIndex = 0;
    this.lastArrivalAt = now;
    return this.waveIndex++;
  }

  private reveal(element: HTMLElement, entry: IntersectionObserverEntry, wavePosition: number): void {
    const {animation, direction, delay, stagger} = this.options;

    if (animation === 'slide' && direction === 'auto') {
      this.setTransformFrom(element, this.slideFrom(this.entrySide(entry)));
    }

    if (stagger > 0) {
      element.style.setProperty('--aos-delay', `${delay + wavePosition * stagger}ms`);
    }

    element.classList.add(VISIBLE_CLASS);
  }

  /**
   * Which edge the element is entering through, straight from the observer
   * entry: an element straddling the viewport's top edge is arriving from
   * above (the user is scrolling up), one straddling the bottom edge is
   * arriving from below. An element already fully inside the viewport (a
   * jump scroll, or the initial load) falls back to the side it was last
   * seen beyond.
   */
  private entrySide(entry: IntersectionObserverEntry): Side {
    const rect = entry.boundingClientRect;
    if (rect.top < this.rootTop(entry)) return 'above';
    if (rect.bottom > this.rootBottom(entry)) return 'below';
    return this.lastSide.get(entry.target) ?? 'below';
  }

  /** Which side a non-intersecting element sits on. */
  private offscreenSide(entry: IntersectionObserverEntry): Side {
    return entry.boundingClientRect.bottom <= this.rootTop(entry) ? 'above' : 'below';
  }

  private rootTop(entry: IntersectionObserverEntry): number {
    return entry.rootBounds?.top ?? 0;
  }

  private rootBottom(entry: IntersectionObserverEntry): number {
    return entry.rootBounds?.bottom ?? window.innerHeight;
  }

  /** The hidden-state transform for a slide arriving from the given side. */
  private slideFrom(side: Side): string {
    const {direction, distance} = this.options;
    const away = `calc(${distance} * -1)`;

    if (direction === 'left') return `translate3d(${distance}, 0, 0)`;
    if (direction === 'right') return `translate3d(${away}, 0, 0)`;
    if (direction === 'up' || (direction === 'auto' && side === 'below')) return `translate3d(0, ${distance}, 0)`;
    return `translate3d(0, ${away}, 0)`;
  }

  /**
   * Update the hidden-state transform, forcing a style flush so the browser
   * commits the new starting point before the visible class lands — otherwise
   * the transition would begin from the previous edge.
   */
  private setTransformFrom(element: HTMLElement, value: string): void {
    if (element.style.getPropertyValue('--aos-transform-from') === value) return;
    element.style.setProperty('--aos-transform-from', value);
    void element.offsetWidth;
  }
}
