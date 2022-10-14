export declare type Styles = Partial<Pick<CSSStyleDeclaration, 'transition' | 'opacity' | 'transform'>>;
export declare type Config = {
    delay: number;
    duration: number;
    easing: string;
    once: boolean;
    slide: boolean;
    slideDistance: string;
};
