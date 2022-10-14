import {createTransitionShorthand} from './utils';
import {Config, Styles} from './types';

export const BASE_CLASS_NAME = 'appear-on-scroll';
export const MODIFIER_CLASS_NAME = 'appear-on-scroll--visible';

export const DEFAULT_CONFIG: Config = {
  delay: 0,
  duration: 600,
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  once: false,
  slide: true,
  slideDistance: '25px',
};

export const DEFAULT_STYLES_BEFORE_SHOW: Styles = {
  transition: 'none',
  opacity: '0',
  transform: 'translate(0px, 0px)',
};

export const DEFAULT_STYLES_AFTER_SHOW: Styles = {
  transition: createTransitionShorthand(
    ['opacity', 'transform'],
    DEFAULT_CONFIG.duration,
    DEFAULT_CONFIG.delay,
    DEFAULT_CONFIG.easing,
  ),
  opacity: '1',
  transform: 'translate(0px, 0px)',
};
