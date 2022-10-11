import {Config, Styles} from './types';

export const DEFAULT_CONFIG: Config = {
  delay: 0,
  duration: 600,
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  once: false,
  slide: true,
  slideDistance: '25px',
};

export const DEFAULT_STYLES_BEFORE_SHOW: Styles = {
  transitionProperty: 'none',
  transitionDuration: '0ms',
  transitionDelay: '0ms',
  transitionTimingFunction: DEFAULT_CONFIG.easing,
  opacity: '0',
  transform: 'translate(0px, 0px)',
};

export const DEFAULT_STYLES_AFTER_SHOW: Styles = {
  transitionProperty: 'opacity, transform',
  transitionDuration: `${DEFAULT_CONFIG.duration}ms`,
  transitionDelay: `${DEFAULT_CONFIG.delay}ms`,
  transitionTimingFunction: DEFAULT_CONFIG.easing,
  opacity: '1',
  transform: 'translate(0px, 0px)',
};
