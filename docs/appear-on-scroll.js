// src/constants.ts
var BASE_CLASS = "appear-on-scroll";
var VISIBLE_CLASS = "appear-on-scroll--visible";
var MOTION_CLASS = "appear-on-scroll--motion";
var STYLE_ATTRIBUTE = "data-appear-on-scroll";
var BLUR_FROM = "blur(12px)";
var INLINE_PROPERTIES = [
  "--aos-duration",
  "--aos-delay",
  "--aos-easing",
  "--aos-transform-from",
  "--aos-filter-from"
];
var DEFAULTS = {
  delay: 0,
  duration: 600,
  easing: "cubic-bezier(0.5, 0, 0, 1)",
  once: false,
  animation: "slide",
  direction: "auto",
  distance: "25px",
  scale: 0.95,
  stagger: 0,
  threshold: 0,
  rootMargin: "0px",
  respectReducedMotion: true
};
var defined = (options) => {
  const out = {};
  for (const key of Object.keys(options)) {
    if (options[key] !== void 0) out[key] = options[key];
  }
  return out;
};
var resolveOptions = (options = {}) => {
  var _a, _b, _c;
  return {
    ...DEFAULTS,
    ...defined(options),
    // v1 compatibility: slide: false meant a pure fade, and slideDistance is now distance.
    animation: (_a = options.animation) != null ? _a : options.slide === false ? "fade" : DEFAULTS.animation,
    distance: (_c = (_b = options.distance) != null ? _b : options.slideDistance) != null ? _c : DEFAULTS.distance
  };
};

// src/styles.ts
var transition = ["opacity", "transform", "filter"].map(
  (property) => `${property} var(--aos-duration, ${DEFAULTS.duration}ms) var(--aos-easing, ${DEFAULTS.easing}) var(--aos-delay, 0ms)`
).join(",\n    ");
var STYLESHEET = `
.${BASE_CLASS} {
  opacity: 0;
  transform: var(--aos-transform-from, none);
  filter: var(--aos-filter-from, none);
  transition: none;
}

.${BASE_CLASS}.${VISIBLE_CLASS} {
  opacity: 1;
  transform: none;
  filter: none;
  transition:
    ${transition};
}

@media (prefers-reduced-motion: reduce) {
  .${BASE_CLASS}:not(.${MOTION_CLASS}) {
    opacity: 1;
    transform: none;
    filter: none;
    transition: none;
  }
}
`;
var styleElement = null;
var instanceCount = 0;
var acquireStylesheet = () => {
  instanceCount += 1;
  if (styleElement) return;
  styleElement = document.createElement("style");
  styleElement.setAttribute(STYLE_ATTRIBUTE, "");
  styleElement.textContent = STYLESHEET;
  document.head.appendChild(styleElement);
};
var releaseStylesheet = () => {
  instanceCount = Math.max(0, instanceCount - 1);
  if (instanceCount === 0 && styleElement) {
    styleElement.remove();
    styleElement = null;
  }
};

// src/AppearOnScroll.ts
var WAVE_IDLE_MS = 50;
var now_ = () => typeof performance === "undefined" ? Date.now() : performance.now();
var AppearOnScroll = class {
  constructor(selector, options) {
    this.elements = [];
    this.hasStylesheet = false;
    this.destroyed = false;
    /**
     * Where each hidden element last sat relative to the viewport. Recorded from
     * observer entries only — this is what makes direction-aware slides work
     * without a scroll listener.
     */
    this.lastSide = /* @__PURE__ */ new WeakMap();
    /**
     * Stagger position within the current arrival wave. The observer batches its
     * callbacks by scroll speed, not by what the eye sees as one group, so counting
     * within a callback made the cascade depend on how fast the user scrolled.
     * A wave instead ends after WAVE_IDLE_MS of no arrivals: elements that land
     * together cascade, and one arriving alone later starts again at zero delay.
     */
    this.waveIndex = 0;
    this.lastArrivalAt = -Infinity;
    /** Disconnect the observer, restore every element, and drop the injected styles. */
    this.destroy = () => {
      var _a;
      if (this.destroyed) return;
      this.destroyed = true;
      (_a = this.observer) == null ? void 0 : _a.disconnect();
      this.observer = void 0;
      for (const element of this.elements) {
        element.classList.remove(BASE_CLASS, VISIBLE_CLASS, MOTION_CLASS);
        for (const property of INLINE_PROPERTIES) {
          element.style.removeProperty(property);
        }
      }
      if (this.hasStylesheet) {
        this.hasStylesheet = false;
        releaseStylesheet();
      }
    };
    this.onIntersect = (entries) => {
      var _a;
      for (const entry of entries) {
        const element = entry.target;
        if (entry.isIntersecting) {
          this.reveal(element, entry, this.nextWavePosition());
          if (this.options.once) (_a = this.observer) == null ? void 0 : _a.unobserve(element);
        } else {
          this.lastSide.set(element, this.offscreenSide(entry));
          if (!this.options.once) element.classList.remove(VISIBLE_CLASS);
        }
      }
    };
    this.options = resolveOptions(options);
    if (typeof document === "undefined" || typeof IntersectionObserver === "undefined") return;
    this.elements = Array.from(document.querySelectorAll(selector));
    if (!this.elements.length) return;
    acquireStylesheet();
    this.hasStylesheet = true;
    this.observer = new IntersectionObserver(this.onIntersect, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    });
    for (const element of this.elements) {
      this.prepare(element);
      this.observer.observe(element);
    }
  }
  /** Hide the element and write its animation settings as inline custom properties. */
  prepare(element) {
    const { delay, duration, easing, animation, scale, respectReducedMotion } = this.options;
    element.classList.add(BASE_CLASS);
    if (!respectReducedMotion) element.classList.add(MOTION_CLASS);
    if (duration !== DEFAULTS.duration) element.style.setProperty("--aos-duration", `${duration}ms`);
    if (delay !== DEFAULTS.delay) element.style.setProperty("--aos-delay", `${delay}ms`);
    if (easing !== DEFAULTS.easing) element.style.setProperty("--aos-easing", easing);
    if (animation === "zoom") element.style.setProperty("--aos-transform-from", `scale(${scale})`);
    if (animation === "blur") element.style.setProperty("--aos-filter-from", BLUR_FROM);
    if (animation === "slide") this.setTransformFrom(element, this.slideFrom("below"));
  }
  /** Position in the current wave, restarting once arrivals have gone quiet. */
  nextWavePosition() {
    const now = now_();
    if (now - this.lastArrivalAt > WAVE_IDLE_MS) this.waveIndex = 0;
    this.lastArrivalAt = now;
    return this.waveIndex++;
  }
  reveal(element, entry, wavePosition) {
    const { animation, direction, delay, stagger } = this.options;
    if (animation === "slide" && direction === "auto") {
      this.setTransformFrom(element, this.slideFrom(this.entrySide(entry)));
    }
    if (stagger > 0) {
      element.style.setProperty("--aos-delay", `${delay + wavePosition * stagger}ms`);
    }
    element.classList.add(VISIBLE_CLASS);
  }
  /**
   * Which edge the element is entering through, straight from the observer
   * entry: an element straddling the viewport's top edge is arriving from
   * above (the user is scrolling up), one straddling the bottom edge is
   * arriving from below. An element already fully inside the viewport (a
   * jump scroll, or the initial load) falls back to the side it was last
   * seen beyond.
   */
  entrySide(entry) {
    var _a;
    const rect = entry.boundingClientRect;
    if (rect.top < this.rootTop(entry)) return "above";
    if (rect.bottom > this.rootBottom(entry)) return "below";
    return (_a = this.lastSide.get(entry.target)) != null ? _a : "below";
  }
  /** Which side a non-intersecting element sits on. */
  offscreenSide(entry) {
    return entry.boundingClientRect.bottom <= this.rootTop(entry) ? "above" : "below";
  }
  rootTop(entry) {
    var _a, _b;
    return (_b = (_a = entry.rootBounds) == null ? void 0 : _a.top) != null ? _b : 0;
  }
  rootBottom(entry) {
    var _a, _b;
    return (_b = (_a = entry.rootBounds) == null ? void 0 : _a.bottom) != null ? _b : window.innerHeight;
  }
  /** The hidden-state transform for a slide arriving from the given side. */
  slideFrom(side) {
    const { direction, distance } = this.options;
    const away = `calc(${distance} * -1)`;
    if (direction === "left") return `translate3d(${distance}, 0, 0)`;
    if (direction === "right") return `translate3d(${away}, 0, 0)`;
    if (direction === "up" || direction === "auto" && side === "below") return `translate3d(0, ${distance}, 0)`;
    return `translate3d(0, ${away}, 0)`;
  }
  /**
   * Update the hidden-state transform, forcing a style flush so the browser
   * commits the new starting point before the visible class lands — otherwise
   * the transition would begin from the previous edge.
   */
  setTransformFrom(element, value) {
    if (element.style.getPropertyValue("--aos-transform-from") === value) return;
    element.style.setProperty("--aos-transform-from", value);
    void element.offsetWidth;
  }
};
export {
  AppearOnScroll
};
