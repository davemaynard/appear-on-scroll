import {DEFAULT_STYLES_BEFORE_SHOW, DEFAULT_STYLES_AFTER_SHOW, DEFAULT_CONFIG} from './constants';
import {Config} from './types';

export class AppearOnScroll {
  prevPageY = window.pageYOffset;
  stylesBeforeShow = DEFAULT_STYLES_BEFORE_SHOW;
  stylesAfterShow = DEFAULT_STYLES_AFTER_SHOW;
  config = DEFAULT_CONFIG;
  elements: NodeListOf<HTMLElement>;

  showElement = (element: HTMLElement) => {
    Object.keys(this.stylesAfterShow).forEach((key) => {
      element.style[key] = this.stylesAfterShow[key];
    });
    element.classList.add('appear-on-scroll--visible');
  };

  hideElement = (element: HTMLElement) => {
    Object.keys(this.stylesBeforeShow).forEach((key) => {
      element.style[key] = this.stylesBeforeShow[key];
    });
    element.classList.remove('appear-on-scroll--visible');
  };

  hideAllElements = () => {
    this.elements.forEach((element) => {
      this.hideElement(element);
    });
  };

  isElementVisible = (element: HTMLElement) => {
    const windowBounds = {
      top: window.pageYOffset,
      bottom: window.pageYOffset + window.innerHeight,
    };
    const elementRect = element.getBoundingClientRect();
    const elementBounds = {
      top: elementRect.top + windowBounds.top,
      bottom: elementRect.top + windowBounds.top + elementRect.height,
    };

    return (
      (elementBounds.top < windowBounds.bottom && elementBounds.bottom > windowBounds.top) ||
      element.style.position === 'fixed'
    );
  };

  handleScroll = () => {
    const isScrollingDown = this.prevPageY < window.pageYOffset;
    const pageYDiff = Math.abs(this.prevPageY - window.pageYOffset);

    if (this.config.slide === true) {
      if (pageYDiff > 0) {
        this.stylesBeforeShow.transform = isScrollingDown
          ? `translate(0px, ${this.config.slideDistance})`
          : `translate(0px, -${this.config.slideDistance})`;
      } else {
        this.stylesBeforeShow.transform = DEFAULT_STYLES_BEFORE_SHOW.transform;
      }
    }

    this.elements.forEach((element) => {
      if (this.isElementVisible(element)) {
        this.showElement(element);
      } else if (this.config.once === false || !element.classList.contains('appear-on-scroll--visible')) {
        this.hideElement(element);
      }
    });

    // Store previous scroll position
    this.prevPageY = window.pageYOffset;
  };

  constructor(selector: string, options?: Partial<Config>) {
    // Immediately override any of the default config with options
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
    };

    // Set transition parameters based on options
    this.stylesBeforeShow.transitionTimingFunction = this.config.easing;
    this.stylesAfterShow.transitionDuration = `${this.config.duration}ms`;
    this.stylesAfterShow.transitionDelay = `${this.config.delay}ms`;
    this.stylesAfterShow.transitionDuration = `${this.config.duration}ms`;
    this.stylesAfterShow.transitionTimingFunction = this.config.easing;

    if (this.config.slide === false) {
      delete this.stylesBeforeShow.transform;
      delete this.stylesAfterShow.transform;
    }

    this.elements = document.querySelectorAll(selector);
    if (this.elements.length) {
      // Hide all elements on init
      this.hideAllElements();

      // Attach scroll event listener
      window.addEventListener('scroll', this.handleScroll);
      this.handleScroll();
    }
  }
}
