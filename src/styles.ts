import {BASE_CLASS, DEFAULTS, MOTION_CLASS, STYLE_ATTRIBUTE, VISIBLE_CLASS} from './constants';

const transition = ['opacity', 'transform', 'filter']
  .map((property) => `${property} var(--aos-duration, ${DEFAULTS.duration}ms) var(--aos-easing, ${DEFAULTS.easing}) var(--aos-delay, 0ms)`)
  .join(',\n    ');

/**
 * The one stylesheet, shared by every instance. Per-element variation
 * (duration, direction, stagger, …) happens through the --aos-* custom
 * properties, never by rebuilding style rules.
 *
 * The reduced-motion block comes last on purpose: it ties with the visible
 * rule on specificity, so source order lets it win and keep elements
 * plainly visible with no transition.
 */
const STYLESHEET = `
.${BASE_CLASS} {
  opacity: 0;
  transform: var(--aos-transform-from, none);
  filter: var(--aos-filter-from, none);
  transition: none;
}

.${BASE_CLASS}.${VISIBLE_CLASS} {
  opacity: 1;
  transform: none;
  filter: none;
  transition:
    ${transition};
}

@media (prefers-reduced-motion: reduce) {
  .${BASE_CLASS}:not(.${MOTION_CLASS}) {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
`;

let styleElement: HTMLStyleElement | null = null;
let instanceCount = 0;

/** Inject the shared stylesheet (once), counting the instances that use it. */
export const acquireStylesheet = (): void => {
  instanceCount += 1;
  if (styleElement) return;

  styleElement = document.createElement('style');
  styleElement.setAttribute(STYLE_ATTRIBUTE, '');
  styleElement.textContent = STYLESHEET;
  document.head.appendChild(styleElement);
};

/** Remove the shared stylesheet once the last instance is destroyed. */
export const releaseStylesheet = (): void => {
  instanceCount = Math.max(0, instanceCount - 1);
  if (instanceCount === 0 && styleElement) {
    styleElement.remove();
    styleElement = null;
  }
};
