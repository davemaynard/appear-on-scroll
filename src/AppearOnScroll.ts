export function AppearOnScroll(selector: string, options) {
  this.prevPageY = window.pageYOffset;
  this.stylesBeforeShow = {
    transitionProperty: `none`,
    transitionDuration: `0ms`,
    transitionDelay: `0ms`,
    transitionTimingFunction: `cubic-bezier(0.5, 0, 0, 1)`,
    opacity: `0`,
    transform: `translate(0px, 0px)`,
  };
  this.stylesAfterShow = {
    transitionProperty: `opacity, transform`,
    transitionDuration: `600ms`,
    transitionDelay: `0ms`,
    transitionTimingFunction: `cubic-bezier(0.5, 0, 0, 1)`,
    opacity: `1`,
    transform: `translate(0px, 0px)`,
  };
  this.config = {
    delay: 0,
    duration: 600,
    easing: `cubic-bezier(0.5, 0, 0, 1)`,
    once: false,
    slide: true,
    slideDistance: `25px`,
    throttleDelay: 0,
  };

  this.hideElements = function() {
    const elements = document.querySelectorAll<HTMLElement>(`.appear-on-scroll`);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      for (let j = 0; j < Object.keys(this.stylesBeforeShow).length; j++) {
        const key = Object.keys(this.stylesBeforeShow)[j];
        element.style[key] = this.stylesBeforeShow[key];
      }
      element.classList.remove(`appear-on-scroll--visible`);
    }
  };

  this.throttle = function(callback: () => void, limit: number) {
    let waiting = false;
    return function() {
      if (!waiting) {
        callback.apply(this);
        waiting = true;
        setTimeout(() => {
          waiting = false;
        }, limit);
      }
    };
  };

  this.isElementVisible = function(element: HTMLElement) {
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
      element.style.position === `fixed`
    );
  };

  this.onScroll = function() {
    const elements = document.querySelectorAll<HTMLElement>(`.appear-on-scroll`);
    const direction = this.prevPageY > window.pageYOffset ? `up` : `down`;
    const pageYDiff = Math.abs(this.prevPageY - window.pageYOffset);

    if (this.config.slide === true) {
      if (pageYDiff > 0) {
        this.stylesBeforeShow.transform =
          direction === `down` ? `translate(0px, ${this.config.slideDistance})` : `translate(0px, -${this.config.slideDistance})`;
      }
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (this.isElementVisible(element)) {
        for (let k = 0; k < Object.keys(this.stylesAfterShow).length; k++) {
          const key = Object.keys(this.stylesAfterShow)[k];
          element.style[key] = this.stylesAfterShow[key];
        }
        element.classList.add(`appear-on-scroll--visible`);
      } else if (this.config.once === false || !element.classList.contains(`appear-on-scroll--visible`)) {
        for (let j = 0; j < Object.keys(this.stylesBeforeShow).length; j++) {
          const key = Object.keys(this.stylesBeforeShow)[j];
          element.style[key] = this.stylesBeforeShow[key];
        }
        element.classList.remove(`appear-on-scroll--visible`);
      }
    }

    // store previous scroll position
    this.prevPageY = window.pageYOffset;
  };

  this.constructor = function() {
    // set transition parameters based on defaults
    this.stylesAfterShow.transitionDuration = `${this.config.duration}ms`;

    // override transition parameters based on options
    if (options) {
      if (options.delay) {
        const value = options.delay;
        if (typeof value === `number`) {
          this.stylesAfterShow.transitionDelay = `${value}ms`;
        } else if (typeof value === `string`) {
          this.stylesAfterShow.transitionDelay = value;
        }
      }
      if (options.duration) {
        const value = options.duration;
        if (typeof value === `number`) {
          this.stylesAfterShow.transitionDuration = `${value}ms`;
        } else if (typeof value === `string`) {
          this.stylesAfterShow.transitionDuration = value;
        }
      }
      if (options.easing) {
        this.config.easing = options.easing;
        this.stylesBeforeShow.transitionTimingFunction = this.config.easing;
        this.stylesAfterShow.transitionTimingFunction = this.config.easing;
      }
      if (options.once === true) {
        this.config.once = options.once;
      }
      if (options.slide === false) {
        this.config.slide = options.slide;
        delete this.stylesBeforeShow.transform;
        delete this.stylesAfterShow.transform;
      }
      if (options.slideDistance) {
        this.config.slideDistance = options.slideDistance;
      }
      if (options.throttleDelay) {
        this.config.throttleDelay = options.throttleDelay;
      }
    }

    const elements = document.querySelectorAll(selector);
    if (elements.length) {
      for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add(`appear-on-scroll`);
      }
    }
    this.hideElements();

    this.onScroll();
    window.addEventListener(`scroll`, this.throttle(this.onScroll.bind(this), this.config.throttleDelay));
  };

  this.constructor();
}
