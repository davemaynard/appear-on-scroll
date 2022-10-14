import {Styles} from './types';

const createCssText = (styles: Styles) => {
  const element = document.createElement('span');
  Object.keys(styles).forEach((key) => {
    element.style[key] = styles[key];
  });
  const {style} = element;
  return style.cssText;
};

export const removeStylesheet = (styleSheet: HTMLStyleElement) => {
  document.head.removeChild(styleSheet);
};

export const addStylesheet = (selector: string, styleSheet: HTMLStyleElement, styles: Styles) => {
  styleSheet.innerHTML = `
    ${selector} {
      ${createCssText(styles)}
    }
  `;

  document.head.appendChild(styleSheet);
};

export const createTransitionShorthand = (properties: string[], duration: number, delay: number, easing: string) => {
  return properties
    .map((property) => {
      return `${property} ${duration}ms ${easing} ${delay}ms`;
    })
    .join(', ');
};
