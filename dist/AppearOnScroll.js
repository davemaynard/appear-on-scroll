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
        this.showElement = (element) => {
            Object.keys(this.stylesAfterShow).forEach((key) => {
                element.style[key] = this.stylesAfterShow[key];
            });
            element.classList.add('appear-on-scroll--visible');
        };
        this.hideElement = (element) => {
            Object.keys(this.stylesBeforeShow).forEach((key) => {
                element.style[key] = this.stylesBeforeShow[key];
            });
            element.classList.remove('appear-on-scroll--visible');
        };
        this.hideAllElements = () => {
            this.elements.forEach((element) => {
                this.hideElement(element);
            });
        };
        this.isElementVisible = (element) => {
            const windowBounds = {
                top: window.pageYOffset,
                bottom: window.pageYOffset + window.innerHeight,
            };
            const elementRect = element.getBoundingClientRect();
            const elementBounds = {
                top: elementRect.top + windowBounds.top,
                bottom: elementRect.top + windowBounds.top + elementRect.height,
            };
            return ((elementBounds.top < windowBounds.bottom && elementBounds.bottom > windowBounds.top) ||
                element.style.position === 'fixed');
        };
        this.handleScroll = () => {
            const isScrollingDown = this.prevPageY < window.pageYOffset;
            const pageYDiff = Math.abs(this.prevPageY - window.pageYOffset);
            if (this.config.slide === true) {
                if (pageYDiff > 0) {
                    this.stylesBeforeShow.transform = isScrollingDown
                        ? `translate(0px, ${this.config.slideDistance})`
                        : `translate(0px, -${this.config.slideDistance})`;
                }
                else {
                    this.stylesBeforeShow.transform = constants_1.DEFAULT_STYLES_BEFORE_SHOW.transform;
                }
            }
            this.elements.forEach((element) => {
                if (this.isElementVisible(element)) {
                    this.showElement(element);
                }
                else if (this.config.once === false || !element.classList.contains('appear-on-scroll--visible')) {
                    this.hideElement(element);
                }
            });
            this.prevPageY = window.pageYOffset;
        };
        this.config = Object.assign(Object.assign({}, constants_1.DEFAULT_CONFIG), options);
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
            this.hideAllElements();
            window.addEventListener('scroll', this.handleScroll);
            this.handleScroll();
        }
    }
}
exports.AppearOnScroll = AppearOnScroll;
