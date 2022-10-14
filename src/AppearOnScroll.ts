import {addStylesheet, createTransitionShorthand, removeStylesheet} from './utils';
import {DEFAULT_CONFIG, DEFAULT_STYLES_AFTER_SHOW, DEFAULT_STYLES_BEFORE_SHOW} from './constants';
import {Config} from './types';

export class AppearOnScroll {
  prevScrollY = window.scrollY;
  isPreviouslyScrollingDown = false;
  stylesBeforeShow = DEFAULT_STYLES_BEFORE_SHOW;
  stylesAfterShow = DEFAULT_STYLES_AFTER_SHOW;
  config = DEFAULT_CONFIG;
  elements: NodeListOf<HTMLElement>;
  styleSheet = document.createElement('style');

  showElement = (element: HTMLElement) => {
    element.classList.add('appear-on-scroll--visible');
  };

  hideElement = (element: HTMLElement) => {
    element.classList.remove('appear-on-scroll--visible');
  };

  hideAllElements = () => {
    this.elements.forEach((element) => {
      // Upon hiding all elements the first time, apply the default class
      element.classList.add('appear-on-scroll');
      this.hideElement(element);
    });
  };

  isElementVisible = (element: HTMLElement) => {
    const windowBounds = {
      top: window.scrollY,
      bottom: window.scrollY + window.innerHeight,
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
    const isScrollingDown = this.prevScrollY < window.scrollY;
    const pageYDiff = Math.abs(this.prevScrollY - window.scrollY);

    if (this.config.slide === true && isScrollingDown !== this.isPreviouslyScrollingDown) {
      if (pageYDiff > 0) {
        this.stylesBeforeShow.transform = isScrollingDown
          ? `translate(0px, ${this.config.slideDistance})`
          : `translate(0px, -${this.config.slideDistance})`;
      } else {
        this.stylesBeforeShow.transform = DEFAULT_STYLES_BEFORE_SHOW.transform;
      }

      // Replace stylesheet
      removeStylesheet(this.styleSheet);
      addStylesheet(this.styleSheet, this.stylesBeforeShow, this.stylesAfterShow);
      this.isPreviouslyScrollingDown = isScrollingDown;
    }

    this.elements.forEach((element) => {
      if (this.isElementVisible(element)) {
        this.showElement(element);
      } else if (this.config.once === false || !element.classList.contains('appear-on-scroll--visible')) {
        this.hideElement(element);
      }
    });

    // Store previous scroll position
    this.prevScrollY = window.scrollY;
  };

  constructor(selector: string, options?: Partial<Config>) {
    // Immediately override any of the default config with options
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
    };

    // Set transition parameters based on options
    this.stylesAfterShow.transition = createTransitionShorthand(
      ['opacity', 'transform'],
      this.config.duration,
      this.config.delay,
      this.config.easing,
    );

    if (this.config.slide === false) {
      delete this.stylesBeforeShow.transform;
      delete this.stylesAfterShow.transform;
    }

    this.elements = document.querySelectorAll(selector);
    if (this.elements.length) {
      // Hide all elements on init
      this.hideAllElements();

      addStylesheet(this.styleSheet, this.stylesBeforeShow, this.stylesAfterShow);

      // Attach scroll event listener
      window.addEventListener('scroll', this.handleScroll);
      this.handleScroll();
    }
  }
}
