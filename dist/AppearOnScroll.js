"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppearOnScroll = void 0;
const utils_1 = require("./utils");
const constants_1 = require("./constants");
class AppearOnScroll {
    constructor(selector, options) {
        this.prevScrollY = window.scrollY;
        this.isPreviouslyScrollingDown = false;
        this.stylesBeforeShow = constants_1.DEFAULT_STYLES_BEFORE_SHOW;
        this.stylesAfterShow = constants_1.DEFAULT_STYLES_AFTER_SHOW;
        this.config = constants_1.DEFAULT_CONFIG;
        this.styleSheet = document.createElement('style');
        this.showElement = (element) => {
            element.classList.add('appear-on-scroll--visible');
        };
        this.hideElement = (element) => {
            element.classList.remove('appear-on-scroll--visible');
        };
        this.hideAllElements = () => {
            this.elements.forEach((element) => {
                element.classList.add('appear-on-scroll');
                this.hideElement(element);
            });
        };
        this.isElementVisible = (element) => {
            const windowBounds = {
                top: window.scrollY,
                bottom: window.scrollY + window.innerHeight,
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
            const isScrollingDown = this.prevScrollY < window.scrollY;
            const pageYDiff = Math.abs(this.prevScrollY - window.scrollY);
            if (this.config.slide === true && isScrollingDown !== this.isPreviouslyScrollingDown) {
                if (pageYDiff > 0) {
                    this.stylesBeforeShow.transform = isScrollingDown
                        ? `translate(0px, ${this.config.slideDistance})`
                        : `translate(0px, -${this.config.slideDistance})`;
                }
                else {
                    this.stylesBeforeShow.transform = constants_1.DEFAULT_STYLES_BEFORE_SHOW.transform;
                }
                (0, utils_1.removeStylesheet)(this.styleSheet);
                (0, utils_1.addStylesheet)(this.styleSheet, this.stylesBeforeShow, this.stylesAfterShow);
                this.isPreviouslyScrollingDown = isScrollingDown;
            }
            this.elements.forEach((element) => {
                if (this.isElementVisible(element)) {
                    this.showElement(element);
                }
                else if (this.config.once === false || !element.classList.contains('appear-on-scroll--visible')) {
                    this.hideElement(element);
                }
            });
            this.prevScrollY = window.scrollY;
        };
        this.config = Object.assign(Object.assign({}, constants_1.DEFAULT_CONFIG), options);
        this.stylesAfterShow.transition = (0, utils_1.createTransitionShorthand)(['opacity', 'transform'], this.config.duration, this.config.delay, this.config.easing);
        if (this.config.slide === false) {
            delete this.stylesBeforeShow.transform;
            delete this.stylesAfterShow.transform;
        }
        this.elements = document.querySelectorAll(selector);
        if (this.elements.length) {
            this.hideAllElements();
            (0, utils_1.addStylesheet)(this.styleSheet, this.stylesBeforeShow, this.stylesAfterShow);
            window.addEventListener('scroll', this.handleScroll);
            this.handleScroll();
        }
    }
}
exports.AppearOnScroll = AppearOnScroll;
