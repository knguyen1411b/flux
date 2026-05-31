export interface FluxOptions {
    lerp?: number;
    wheelMultiplier?: number;
    wrapper?: HTMLElement | Window;
    content?: HTMLElement;
    direction?: "vertical" | "horizontal";
}

export type FluxEventMap = {
    scroll: { scroll: number; progress: number };
};

export type FluxEventCallback<K extends keyof FluxEventMap> = (
    data: FluxEventMap[K]
) => void;

export class Flux {
    private current = 0;
    private target = 0;
    private rafId = 0;
    private isAnimating = false;
    private isStopped = false;
    private lastTime = 0;

    private wrapper: HTMLElement | Window;
    private content: HTMLElement;
    private scrollDirection: "vertical" | "horizontal";

    // Animation configuration for duration-based vs lerp-based scrolling
    private animationType: "lerp" | "duration" = "lerp";
    private animStartCurrent = 0;
    private animTargetScroll = 0;
    private animStartTime = 0;
    private animDuration = 0; // in seconds
    private animEasing: (t: number) => number = (t) => t;

    // Touch event variables (generic axis tracking)
    private touchStartPos = 0;
    private touchLastPos = 0;
    private touchSpeed = 0;
    private touchLastTime = 0;

    private _lerp: number;
    private _wheelMultiplier: number;

    private events: { [K in keyof FluxEventMap]?: FluxEventCallback<K>[] } = {};

    constructor(options: FluxOptions = {}) {
        let userPrefersReducedMotion = false;
        if (typeof window !== "undefined" && window.matchMedia) {
            userPrefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
        }

        this._lerp = userPrefersReducedMotion ? 1.0 : (options.lerp ?? 0.1);
        this._wheelMultiplier = options.wheelMultiplier ?? 1;
        this.scrollDirection = options.direction ?? "vertical";

        if (typeof window === "undefined") {
            this.wrapper = {} as Window;
            this.content = {} as HTMLElement;
            return;
        }

        this.wrapper = options.wrapper ?? window;
        this.content = options.content ?? document.documentElement;

        // Force native scroll-behavior to 'auto' to prevent conflicts with JS scrolling animation
        const el =
            this.wrapper === window
                ? document.documentElement
                : (this.wrapper as HTMLElement);
        if (el && el.style) {
            el.style.scrollBehavior = "auto";
        }
        if (
            this.wrapper === window &&
            !document.getElementById("flux-style-override")
        ) {
            const style = document.createElement("style");
            style.id = "flux-style-override";
            style.textContent = `
                html, body {
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }

        this.current = this.getScroll();
        this.target = this.getScroll();

        this.wrapper.addEventListener("wheel", this.onWheel as EventListener, {
            passive: false
        });

        this.wrapper.addEventListener(
            "scroll",
            this.onScroll as EventListener,
            {
                passive: true
            }
        );

        window.addEventListener("resize", this.onResize, {
            passive: true
        });

        this.wrapper.addEventListener(
            "touchstart",
            this.onTouchStart as EventListener,
            {
                passive: true
            }
        );

        this.wrapper.addEventListener(
            "touchmove",
            this.onTouchMove as EventListener,
            {
                passive: false
            }
        );

        this.wrapper.addEventListener(
            "touchend",
            this.onTouchEnd as EventListener,
            {
                passive: true
            }
        );
    }

    // Public Getters & Setters
    public get scroll(): number {
        return this.current;
    }

    public get progress(): number {
        const max = this.getMaxScroll();
        return max > 0 ? this.current / max : 0;
    }

    public get direction(): "vertical" | "horizontal" {
        return this.scrollDirection;
    }

    public get lerp(): number {
        return this._lerp;
    }

    public set lerp(value: number) {
        this._lerp = value;
    }

    public get wheelMultiplier(): number {
        return this._wheelMultiplier;
    }

    public set wheelMultiplier(value: number) {
        this._wheelMultiplier = value;
    }

    // Event Emitter Methods
    public on<K extends keyof FluxEventMap>(
        event: K,
        callback: FluxEventCallback<K>
    ) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event]!.push(callback);
    }

    public off<K extends keyof FluxEventMap>(
        event: K,
        callback: FluxEventCallback<K>
    ) {
        const list = this.events[event];
        if (!list) return;
        const index = list.indexOf(callback);
        if (index !== -1) {
            list.splice(index, 1);
        }
    }

    private emit<K extends keyof FluxEventMap>(
        event: K,
        data: FluxEventMap[K]
    ) {
        const list = this.events[event];
        if (!list) return;
        const listeners = [...list];
        for (let i = 0; i < listeners.length; i++) {
            listeners[i](data);
        }
    }

    private emitScrollEvent() {
        const max = this.getMaxScroll();
        const progress = max > 0 ? this.current / max : 0;
        this.emit("scroll", { scroll: this.current, progress });
    }

    // Scrolling Limits and Clamping
    private clamp(value: number): number {
        return Math.max(0, Math.min(value, this.getMaxScroll()));
    }

    private getScroll(): number {
        if (typeof window === "undefined") return 0;
        if (this.scrollDirection === "horizontal") {
            if (this.wrapper === window) {
                return window.scrollX;
            } else {
                return (this.wrapper as HTMLElement).scrollLeft;
            }
        } else {
            if (this.wrapper === window) {
                return window.scrollY;
            } else {
                return (this.wrapper as HTMLElement).scrollTop;
            }
        }
    }

    private setScroll(value: number) {
        if (typeof window === "undefined") return;
        if (this.scrollDirection === "horizontal") {
            if (this.wrapper === window) {
                window.scrollTo(value, window.scrollY);
            } else {
                (this.wrapper as HTMLElement).scrollLeft = value;
            }
        } else {
            if (this.wrapper === window) {
                window.scrollTo(window.scrollX, value);
            } else {
                (this.wrapper as HTMLElement).scrollTop = value;
            }
        }
    }

    private getMaxScroll(): number {
        if (typeof window === "undefined") return 0;
        if (this.scrollDirection === "horizontal") {
            if (this.wrapper === window) {
                return Math.max(
                    0,
                    this.content.scrollWidth - window.innerWidth
                );
            } else {
                const wrapperEl = this.wrapper as HTMLElement;
                return Math.max(
                    0,
                    this.content.scrollWidth - wrapperEl.clientWidth
                );
            }
        } else {
            if (this.wrapper === window) {
                return Math.max(
                    0,
                    this.content.scrollHeight - window.innerHeight
                );
            } else {
                const wrapperEl = this.wrapper as HTMLElement;
                return Math.max(
                    0,
                    this.content.scrollHeight - wrapperEl.clientHeight
                );
            }
        }
    }

    // Start / Stop APIs
    public stop() {
        this.isStopped = true;
    }

    public start() {
        this.isStopped = false;
    }

    // Event Handlers
    private onWheel = (e: WheelEvent) => {
        if (this.isStopped) {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey) return;

        // For vertical scrolling, ignore horizontal-dominant wheel gestures
        if (
            this.scrollDirection === "vertical" &&
            Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ) {
            return;
        }

        e.preventDefault();

        let delta = e.deltaY;
        if (this.scrollDirection === "horizontal") {
            delta =
                Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        }

        // Normalize delta based on deltaMode (0: pixel, 1: line, 2: page)
        if (e.deltaMode === 1) {
            delta *= 16;
        } else if (e.deltaMode === 2) {
            delta *=
                this.wrapper === window
                    ? this.scrollDirection === "horizontal"
                        ? window.innerWidth
                        : window.innerHeight
                    : this.scrollDirection === "horizontal"
                      ? (this.wrapper as HTMLElement).clientWidth
                      : (this.wrapper as HTMLElement).clientHeight;
        }

        this.animationType = "lerp";
        this.target = this.clamp(this.target + delta * this._wheelMultiplier);

        this.startAnimation();
    };

    private onScroll = () => {
        // Sync position back if user scrolls externally (keyboard, scrollbar, anchors)
        if (!this.isAnimating) {
            const scroll = this.getScroll();
            this.current = scroll;
            this.target = scroll;
            this.emitScrollEvent();
        }
    };

    private onResize = () => {
        this.target = this.clamp(this.target);
        this.current = this.clamp(this.current);
        this.emitScrollEvent();
    };

    private onTouchStart = (e: TouchEvent) => {
        if (this.isStopped) return;
        const pos =
            this.scrollDirection === "horizontal"
                ? e.touches[0].clientX
                : e.touches[0].clientY;
        this.touchStartPos = pos;
        this.touchLastPos = pos;
        this.touchLastTime = performance.now();
        this.touchSpeed = 0;
    };

    private onTouchMove = (e: TouchEvent) => {
        if (this.isStopped) {
            e.preventDefault();
            return;
        }

        e.preventDefault(); // Prevent native mobile scrolling

        const pos =
            this.scrollDirection === "horizontal"
                ? e.touches[0].clientX
                : e.touches[0].clientY;
        const delta = this.touchLastPos - pos;
        const now = performance.now();
        const dt = now - this.touchLastTime;

        if (dt > 0) {
            this.touchSpeed = delta / dt;
        }

        this.touchLastPos = pos;
        this.touchLastTime = now;

        this.animationType = "lerp";
        this.target = this.clamp(this.target + delta);
        this.startAnimation();
    };

    private onTouchEnd = () => {
        if (this.isStopped) return;

        // Apply inertial momentum scroll
        const absSpeed = Math.abs(this.touchSpeed);
        if (absSpeed > 0.1) {
            const momentum = this.touchSpeed * 200;
            this.target = this.clamp(this.target + momentum);
            this.startAnimation();
        }
    };

    private startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.lastTime = performance.now();
            this.rafId = requestAnimationFrame(this.animate);
        }
    }

    private animate = (time: number) => {
        if (!this.isAnimating) return;

        // Ensure dt is never negative or zero due to discrepancies between performance.now() and RAF timestamps
        let dt = (time - this.lastTime) / 1000;
        if (dt <= 0 || isNaN(dt)) {
            dt = 1 / 60;
        }
        dt = Math.min(dt, 0.1);
        this.lastTime = time;

        if (this.animationType === "duration") {
            const elapsed = (time - this.animStartTime) / 1000;
            const t = Math.min(elapsed / this.animDuration, 1);
            const easedT = this.animEasing(t);

            this.current =
                this.animStartCurrent +
                (this.animTargetScroll - this.animStartCurrent) * easedT;

            this.setScroll(this.current);
            this.emitScrollEvent();

            if (t >= 1) {
                this.isAnimating = false;
                return;
            }
        } else {
            const diff = this.target - this.current;

            if (Math.abs(diff) < 0.1) {
                this.current = this.target;
                this.setScroll(this.current);
                this.emitScrollEvent();
                this.isAnimating = false;
                return;
            }

            const lerpCoeff = 1 - Math.pow(1 - this._lerp, dt * 60);
            this.current += diff * lerpCoeff;

            this.setScroll(this.current);
            this.emitScrollEvent();
        }

        this.rafId = requestAnimationFrame(this.animate);
    };

    public scrollTo(
        target: number | string | HTMLElement,
        options: {
            immediate?: boolean;
            duration?: number; // in seconds
            easing?: (t: number) => number;
        } = {}
    ) {
        if (typeof window === "undefined" || this.isStopped) return;

        let targetScroll: number;
        if (typeof target === "number") {
            targetScroll = target;
        } else {
            let element: HTMLElement | null = null;
            if (typeof target === "string") {
                element = document.querySelector(target) as HTMLElement;
            } else if (target instanceof HTMLElement) {
                element = target;
            }

            if (element instanceof HTMLElement) {
                if (this.wrapper === window) {
                    targetScroll =
                        this.scrollDirection === "horizontal"
                            ? window.scrollX +
                              element.getBoundingClientRect().left
                            : window.scrollY +
                              element.getBoundingClientRect().top;
                } else {
                    const wrapperEl = this.wrapper as HTMLElement;
                    targetScroll =
                        this.scrollDirection === "horizontal"
                            ? element.getBoundingClientRect().left -
                              wrapperEl.getBoundingClientRect().left +
                              wrapperEl.scrollLeft
                            : element.getBoundingClientRect().top -
                              wrapperEl.getBoundingClientRect().top +
                              wrapperEl.scrollTop;
                }
            } else {
                console.warn(`[Flux] Target element not found: ${target}`);
                return;
            }
        }

        const clampedScroll = this.clamp(targetScroll);

        if (options.immediate) {
            if (this.isAnimating) {
                cancelAnimationFrame(this.rafId);
                this.isAnimating = false;
            }
            this.target = clampedScroll;
            this.current = clampedScroll;
            this.setScroll(clampedScroll);
            this.emitScrollEvent();
        } else if (options.duration !== undefined) {
            this.animationType = "duration";
            this.animStartCurrent = this.current;
            this.animTargetScroll = clampedScroll;
            this.animStartTime = performance.now();
            this.animDuration = Math.max(0.001, options.duration);
            this.animEasing = options.easing ?? ((t) => 1 - Math.pow(1 - t, 3)); // cubic ease-out
            this.startAnimation();
        } else {
            this.animationType = "lerp";
            this.target = clampedScroll;
            this.startAnimation();
        }
    }

    public destroy() {
        if (typeof window === "undefined") return;

        cancelAnimationFrame(this.rafId);

        if (this.wrapper) {
            this.wrapper.removeEventListener(
                "wheel",
                this.onWheel as EventListener
            );
            this.wrapper.removeEventListener(
                "scroll",
                this.onScroll as EventListener
            );
            this.wrapper.removeEventListener(
                "touchstart",
                this.onTouchStart as EventListener
            );
            this.wrapper.removeEventListener(
                "touchmove",
                this.onTouchMove as EventListener
            );
            this.wrapper.removeEventListener(
                "touchend",
                this.onTouchEnd as EventListener
            );
        }
        window.removeEventListener("resize", this.onResize);

        this.events = {};
    }
}
