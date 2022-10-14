export type Styles = Partial<Pick<CSSStyleDeclaration, 'transition' | 'opacity' | 'transform'>>;

export type Config = {
  delay: number;
  duration: number;
  easing: string;
  once: boolean;
  slide: boolean;
  slideDistance: string;
};
