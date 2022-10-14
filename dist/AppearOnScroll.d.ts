import { Config } from './types';
export declare class AppearOnScroll {
    prevScrollY: number;
    isPreviouslyScrollingDown: boolean;
    stylesBeforeShow: Partial<Pick<CSSStyleDeclaration, "transition" | "opacity" | "transform">>;
    stylesAfterShow: Partial<Pick<CSSStyleDeclaration, "transition" | "opacity" | "transform">>;
    config: Config;
    elements: NodeListOf<HTMLElement>;
    beforeStyleSheet: HTMLStyleElement;
    afterStyleSheet: HTMLStyleElement;
    showElement: (element: HTMLElement) => void;
    hideElement: (element: HTMLElement) => void;
    hideAllElements: () => void;
    isElementVisible: (element: HTMLElement) => boolean;
    handleScroll: () => void;
    constructor(selector: string, options?: Partial<Config>);
}
