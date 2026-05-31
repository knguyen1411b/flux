export interface FluxOptions {
    lerp?: number;
    wheelMultiplier?: number;
    wrapper?: HTMLElement | Window;
    content?: HTMLElement;
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

    // Animation configuration for duration-based vs lerp-based scrolling
    private animationType: "lerp" | "duration" = "lerp";
    private animStartCurrent = 0;
    private animTargetY = 0;
    private animStartTime = 0;
    private animDuration = 0; // in seconds
    private animEasing: (t: number) => number = (t) => t;

    // Touch event variables
    private touchStartY = 0;
    private touchLastY = 0;
    private touchSpeedY = 0;
    private touchLastTime = 0;

    private lerp: number;
    private wheelMultiplier: number;

    private events: { [K in keyof FluxEventMap]?: FluxEventCallback<K>[] } = {};

    constructor(options: FluxOptions = {}) {
        this.lerp = options.lerp ?? 0.1;
        this.wheelMultiplier = options.wheelMultiplier ?? 1;

        if (typeof window === "undefined") {
            this.wrapper = {} as Window;
            this.content = {} as HTMLElement;
            return;
        }

        this.wrapper = options.wrapper ?? window;
        this.content = options.content ?? document.documentElement;

        this.current = this.getScrollY();
        this.target = this.getScrollY();

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
        // Slice copy to prevent errors if a callback changes the listeners array during iteration
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

    private getScrollY(): number {
        if (typeof window === "undefined") return 0;
        if (this.wrapper === window) {
            return window.scrollY;
        } else {
            return (this.wrapper as HTMLElement).scrollTop;
        }
    }

    private setScrollY(value: number) {
        if (typeof window === "undefined") return;
        if (this.wrapper === window) {
            window.scrollTo(window.scrollX, value);
        } else {
            (this.wrapper as HTMLElement).scrollTop = value;
        }
    }

    private getMaxScroll(): number {
        if (typeof window === "undefined") return 0;
        if (this.wrapper === window) {
            return Math.max(0, this.content.scrollHeight - window.innerHeight);
        } else {
            const wrapperEl = this.wrapper as HTMLElement;
            return Math.max(
                0,
                this.content.scrollHeight - wrapperEl.clientHeight
            );
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

        // Allow zoom and horizontal scroll gestures
        if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            return;
        }

        e.preventDefault();

        // Normalize delta based on deltaMode (0: pixel, 1: line, 2: page)
        let delta = e.deltaY;
        if (e.deltaMode === 1) {
            delta *= 16;
        } else if (e.deltaMode === 2) {
            delta *=
                this.wrapper === window
                    ? window.innerHeight
                    : (this.wrapper as HTMLElement).clientHeight;
        }

        this.animationType = "lerp";
        this.target = this.clamp(this.target + delta * this.wheelMultiplier);

        this.startAnimation();
    };

    private onScroll = () => {
        // Sync position back if user scrolls externally (keyboard, scrollbar, anchors)
        if (!this.isAnimating) {
            const scrollY = this.getScrollY();
            this.current = scrollY;
            this.target = scrollY;
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
        this.touchStartY = e.touches[0].clientY;
        this.touchLastY = e.touches[0].clientY;
        this.touchLastTime = performance.now();
        this.touchSpeedY = 0;
    };

    private onTouchMove = (e: TouchEvent) => {
        if (this.isStopped) {
            e.preventDefault();
            return;
        }

        e.preventDefault(); // Prevent native mobile scrolling

        const clientY = e.touches[0].clientY;
        const deltaY = this.touchLastY - clientY;
        const now = performance.now();
        const dt = now - this.touchLastTime;

        if (dt > 0) {
            this.touchSpeedY = deltaY / dt;
        }

        this.touchLastY = clientY;
        this.touchLastTime = now;

        this.animationType = "lerp";
        this.target = this.clamp(this.target + deltaY);
        this.startAnimation();
    };

    private onTouchEnd = () => {
        if (this.isStopped) return;

        // Apply inertial momentum scroll
        const absSpeed = Math.abs(this.touchSpeedY);
        if (absSpeed > 0.1) {
            const momentum = this.touchSpeedY * 200;
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

        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (this.animationType === "duration") {
            const elapsed = (time - this.animStartTime) / 1000;
            const t = Math.min(elapsed / this.animDuration, 1);
            const easedT = this.animEasing(t);

            this.current =
                this.animStartCurrent +
                (this.animTargetY - this.animStartCurrent) * easedT;

            this.setScrollY(this.current);
            this.emitScrollEvent();

            if (t >= 1) {
                this.isAnimating = false;
                return;
            }
        } else {
            const diff = this.target - this.current;

            if (Math.abs(diff) < 0.1) {
                this.current = this.target;
                this.setScrollY(this.current);
                this.emitScrollEvent();
                this.isAnimating = false;
                return;
            }

            const lerpCoeff = 1 - Math.pow(1 - this.lerp, dt * 60);
            this.current += diff * lerpCoeff;

            this.setScrollY(this.current);
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

        let targetY: number;
        if (typeof target === "number") {
            targetY = target;
        } else {
            let element: HTMLElement | null = null;
            if (typeof target === "string") {
                element = document.querySelector(target) as HTMLElement;
            } else if (target instanceof HTMLElement) {
                element = target;
            }

            if (element instanceof HTMLElement) {
                if (this.wrapper === window) {
                    targetY =
                        window.scrollY + element.getBoundingClientRect().top;
                } else {
                    const wrapperEl = this.wrapper as HTMLElement;
                    targetY =
                        element.getBoundingClientRect().top -
                        wrapperEl.getBoundingClientRect().top +
                        wrapperEl.scrollTop;
                }
            } else {
                console.warn(`[Flux] Target element not found: ${target}`);
                return;
            }
        }

        const clampedY = this.clamp(targetY);

        if (options.immediate) {
            if (this.isAnimating) {
                cancelAnimationFrame(this.rafId);
                this.isAnimating = false;
            }
            this.target = clampedY;
            this.current = clampedY;
            this.setScrollY(clampedY);
            this.emitScrollEvent();
        } else if (options.duration !== undefined) {
            this.animationType = "duration";
            this.animStartCurrent = this.current;
            this.animTargetY = clampedY;
            this.animStartTime = performance.now();
            this.animDuration = Math.max(0.001, options.duration);
            this.animEasing = options.easing ?? ((t) => 1 - Math.pow(1 - t, 3)); // cubic ease-out
            this.startAnimation();
        } else {
            this.animationType = "lerp";
            this.target = clampedY;
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
