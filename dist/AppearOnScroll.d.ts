import { Config } from './types';
export declare class AppearOnScroll {
    prevPageY: number;
    stylesBeforeShow: Partial<CSSStyleDeclaration>;
    stylesAfterShow: Partial<CSSStyleDeclaration>;
    config: Config;
    elements: NodeListOf<HTMLElement>;
    hideElements: () => void;
    throttle: (callback: () => void, limit: number) => () => void;
    isElementVisible: (element: HTMLElement) => boolean;
    onScroll: () => void;
    constructor(selector: string, options: Partial<Config>);
}
