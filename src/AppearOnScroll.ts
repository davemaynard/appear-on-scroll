import {DEFAULT_STYLES_BEFORE_SHOW, DEFAULT_STYLES_AFTER_SHOW, DEFAULT_CONFIG} from './constants';
import {Config} from './types';

export class AppearOnScroll {
  prevPageY = window.pageYOffset;
  stylesBeforeShow = DEFAULT_STYLES_BEFORE_SHOW;
  stylesAfterShow = DEFAULT_STYLES_AFTER_SHOW;
  config = DEFAULT_CONFIG;
  elements: NodeListOf<HTMLElement>;

  hideElements = () => {
    const {elements, stylesBeforeShow} = this;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      for (let j = 0; j < Object.keys(stylesBeforeShow).length; j++) {
        const key = Object.keys(stylesBeforeShow)[j];
        element.style[key] = stylesBeforeShow[key];
      }
      element.classList.remove('appear-on-scroll--visible');
    }
  };

  throttle = (callback: () => void, limit: number) => {
    let waiting = false;
    return () => {
      if (!waiting) {
        callback.apply(this);
        waiting = true;
        setTimeout(() => {
          waiting = false;
        }, limit);
      }
    };
  };

  isElementVisible = (element: HTMLElement) => {
    const windowBounds = {
      top: window.pageYOffset,
      right: window.pageXOffset + window.innerWidth,
      bottom: window.pageYOffset + window.innerHeight,
      left: window.pageXOffset,
    };
    const elementRect = element.getBoundingClientRect();
    const elementBounds = {
      top: elementRect.top + windowBounds.top,
      right: elementRect.left + elementRect.width,
      bottom: elementRect.top + windowBounds.top + elementRect.height,
      left: elementRect.left,
    };

    return (
      (elementBounds.top < windowBounds.bottom &&
        elementBounds.right > windowBounds.left &&
        elementBounds.bottom > windowBounds.top &&
        elementBounds.left < windowBounds.right) ||
      element.style.position === 'fixed'
    );
  };

  onScroll = () => {
    const {elements, prevPageY, config, isElementVisible, stylesAfterShow, stylesBeforeShow} = this;
    const direction = prevPageY > window.pageYOffset ? 'up' : 'down';
    const pageYDiff = Math.abs(prevPageY - window.pageYOffset);

    if (config.slide === true) {
      if (pageYDiff > 0) {
        stylesBeforeShow.transform =
          direction === 'down' ? `translate(0px, ${config.slideDistance})` : `translate(0px, -${config.slideDistance})`;
      }
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (isElementVisible(element)) {
        for (let k = 0; k < Object.keys(stylesAfterShow).length; k++) {
          const key = Object.keys(stylesAfterShow)[k];
          element.style[key] = stylesAfterShow[key];
        }
        element.classList.add('appear-on-scroll--visible');
      } else if (config.once === false || !element.classList.contains('appear-on-scroll--visible')) {
        for (let j = 0; j < Object.keys(stylesBeforeShow).length; j++) {
          const key = Object.keys(stylesBeforeShow)[j];
          element.style[key] = stylesBeforeShow[key];
        }
        element.classList.remove('appear-on-scroll--visible');
      }
    }

    // store previous scroll position
    this.prevPageY = window.pageYOffset;
  };

  constructor(selector: string, options: Partial<Config>) {
    // Immediately override any of the default config with options
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
    };

    // set transition parameters based on options
    const {stylesBeforeShow, config, stylesAfterShow, hideElements, onScroll, throttle} = this;
    stylesBeforeShow.transitionTimingFunction = config.easing;
    stylesAfterShow.transitionDuration = `${config.duration}ms`;
    stylesAfterShow.transitionDelay = `${config.delay}ms`;
    stylesAfterShow.transitionDuration = `${config.duration}ms`;
    stylesAfterShow.transitionTimingFunction = config.easing;

    if (config.slide === false) {
      delete stylesBeforeShow.transform;
      delete stylesAfterShow.transform;
    }

    this.elements = document.querySelectorAll(selector);
    const {elements} = this;
    if (elements.length) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('appear-on-scroll');
      }

      hideElements();

      onScroll();
      window.addEventListener('scroll', throttle(onScroll.bind(this), config.throttleDelay));
    }
  }
}
