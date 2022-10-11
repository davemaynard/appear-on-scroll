"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STYLES_AFTER_SHOW = exports.DEFAULT_STYLES_BEFORE_SHOW = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    delay: 0,
    duration: 600,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    once: false,
    slide: true,
    slideDistance: '25px',
};
exports.DEFAULT_STYLES_BEFORE_SHOW = {
    transitionProperty: 'none',
    transitionDuration: '0ms',
    transitionDelay: '0ms',
    transitionTimingFunction: exports.DEFAULT_CONFIG.easing,
    opacity: '0',
    transform: 'translate(0px, 0px)',
};
exports.DEFAULT_STYLES_AFTER_SHOW = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${exports.DEFAULT_CONFIG.duration}ms`,
    transitionDelay: `${exports.DEFAULT_CONFIG.delay}ms`,
    transitionTimingFunction: exports.DEFAULT_CONFIG.easing,
    opacity: '1',
    transform: 'translate(0px, 0px)',
};
