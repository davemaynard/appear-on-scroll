import { Styles } from './types';
export declare const removeStylesheet: (styleSheet: HTMLStyleElement) => void;
export declare const addStylesheet: (selector: string, styleSheet: HTMLStyleElement, styles: Styles) => void;
export declare const createTransitionShorthand: (properties: string[], duration: number, delay: number, easing: string) => string;
