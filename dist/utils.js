"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransitionShorthand = exports.addStylesheet = exports.removeStylesheet = void 0;
const createCssText = (styles) => {
    const element = document.createElement('span');
    Object.keys(styles).forEach((key) => {
        element.style[key] = styles[key];
    });
    const { style } = element;
    return style.cssText;
};
const removeStylesheet = (styleSheet) => {
    document.head.removeChild(styleSheet);
};
exports.removeStylesheet = removeStylesheet;
const addStylesheet = (styleSheet, stylesBeforeShow, stylesAfterShow) => {
    styleSheet.innerHTML = `
    .appear-on-scroll {
      ${createCssText(stylesBeforeShow)}
    }
    .appear-on-scroll--visible {
      ${createCssText(stylesAfterShow)}
    }
  `;
    document.head.appendChild(styleSheet);
};
exports.addStylesheet = addStylesheet;
const createTransitionShorthand = (properties, duration, delay, easing) => {
    return properties
        .map((property) => {
        return `${property} ${duration}ms ${easing} ${delay}ms`;
    })
        .join(', ');
};
exports.createTransitionShorthand = createTransitionShorthand;
