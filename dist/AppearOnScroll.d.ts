import { Config } from './types';
export declare class AppearOnScroll {
    prevPageY: number;
    stylesBeforeShow: Partial<CSSStyleDeclaration>;
    stylesAfterShow: Partial<CSSStyleDeclaration>;
    config: Config;
    elements: NodeListOf<HTMLElement>;
    showElement: (element: HTMLElement) => void;
    hideElement: (element: HTMLElement) => void;
    hideAllElements: () => void;
    isElementVisible: (element: HTMLElement) => boolean;
    handleScroll: () => void;
    constructor(selector: string, options?: Partial<Config>);
}
