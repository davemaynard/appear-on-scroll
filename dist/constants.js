"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STYLES_AFTER_SHOW = exports.DEFAULT_STYLES_BEFORE_SHOW = exports.DEFAULT_CONFIG = exports.MODIFIER_CLASS_NAME = exports.BASE_CLASS_NAME = void 0;
const utils_1 = require("./utils");
exports.BASE_CLASS_NAME = 'appear-on-scroll';
exports.MODIFIER_CLASS_NAME = 'appear-on-scroll--visible';
exports.DEFAULT_CONFIG = {
    delay: 0,
    duration: 600,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    once: false,
    slide: true,
    slideDistance: '25px',
};
exports.DEFAULT_STYLES_BEFORE_SHOW = {
    transition: 'none',
    opacity: '0',
    transform: 'translate(0px, 0px)',
};
exports.DEFAULT_STYLES_AFTER_SHOW = {
    transition: (0, utils_1.createTransitionShorthand)(['opacity', 'transform'], exports.DEFAULT_CONFIG.duration, exports.DEFAULT_CONFIG.delay, exports.DEFAULT_CONFIG.easing),
    opacity: '1',
    transform: 'translate(0px, 0px)',
};
