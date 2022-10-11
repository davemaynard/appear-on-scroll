"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppearOnScroll = void 0;
const constants_1 = require("./constants");
class AppearOnScroll {
    constructor(selector, options) {
        this.prevPageY = window.pageYOffset;
        this.stylesBeforeShow = constants_1.DEFAULT_STYLES_BEFORE_SHOW;
        this.stylesAfterShow = constants_1.DEFAULT_STYLES_AFTER_SHOW;
        this.config = constants_1.DEFAULT_CONFIG;
        this.hideElements = () => {
            const { elements, stylesBeforeShow } = this;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                for (let j = 0; j < Object.keys(stylesBeforeShow).length; j++) {
                    const key = Object.keys(stylesBeforeShow)[j];
                    element.style[key] = stylesBeforeShow[key];
                }
                element.classList.remove('appear-on-scroll--visible');
            }
        };
        this.throttle = (callback, limit) => {
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
        this.isElementVisible = (element) => {
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
            return ((elementBounds.top < windowBounds.bottom &&
                elementBounds.right > windowBounds.left &&
                elementBounds.bottom > windowBounds.top &&
                elementBounds.left < windowBounds.right) ||
                element.style.position === 'fixed');
        };
        this.onScroll = () => {
            const { elements, prevPageY, config, isElementVisible, stylesAfterShow, stylesBeforeShow } = this;
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
                }
                else if (config.once === false || !element.classList.contains('appear-on-scroll--visible')) {
                    for (let j = 0; j < Object.keys(stylesBeforeShow).length; j++) {
                        const key = Object.keys(stylesBeforeShow)[j];
                        element.style[key] = stylesBeforeShow[key];
                    }
                    element.classList.remove('appear-on-scroll--visible');
                }
            }
            this.prevPageY = window.pageYOffset;
        };
        this.config = Object.assign(Object.assign({}, constants_1.DEFAULT_CONFIG), options);
        const { stylesBeforeShow, config, stylesAfterShow, hideElements, onScroll, throttle } = this;
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
        const { elements } = this;
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
exports.AppearOnScroll = AppearOnScroll;
