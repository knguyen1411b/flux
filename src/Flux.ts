export interface FluxOptions {
    lerp?: number;
    wheelMultiplier?: number;
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

        if (typeof window === "undefined") return;

        this.current = window.scrollY;
        this.target = window.scrollY;

        window.addEventListener("wheel", this.onWheel, {
            passive: false
        });

        window.addEventListener("scroll", this.onScroll, {
            passive: true
        });

        window.addEventListener("resize", this.onResize, {
            passive: true
        });

        window.addEventListener("touchstart", this.onTouchStart, {
            passive: true
        });

        window.addEventListener("touchmove", this.onTouchMove, {
            passive: false
        });

        window.addEventListener("touchend", this.onTouchEnd, {
            passive: true
        });
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

    private getMaxScroll(): number {
        if (typeof window === "undefined") return 0;
        return Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight
        );
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
            delta *= window.innerHeight;
        }

        this.animationType = "lerp";
        this.target = this.clamp(this.target + delta * this.wheelMultiplier);

        this.startAnimation();
    };

    private onScroll = () => {
        // Sync position back if user scrolls externally (keyboard, scrollbar, anchors)
        if (!this.isAnimating) {
            this.current = window.scrollY;
            this.target = window.scrollY;
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

            window.scrollTo(window.scrollX, this.current);
            this.emitScrollEvent();

            if (t >= 1) {
                this.isAnimating = false;
                return;
            }
        } else {
            const diff = this.target - this.current;

            if (Math.abs(diff) < 0.1) {
                this.current = this.target;
                window.scrollTo(window.scrollX, this.current);
                this.emitScrollEvent();
                this.isAnimating = false;
                return;
            }

            const lerpCoeff = 1 - Math.pow(1 - this.lerp, dt * 60);
            this.current += diff * lerpCoeff;

            window.scrollTo(window.scrollX, this.current);
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

        let targetY = 0;
        if (typeof target === "number") {
            targetY = target;
        } else if (typeof target === "string") {
            const element = document.querySelector(target);
            if (element instanceof HTMLElement) {
                targetY = window.scrollY + element.getBoundingClientRect().top;
            } else {
                console.warn(`[Flux] Target element not found: ${target}`);
                return;
            }
        } else if (target instanceof HTMLElement) {
            targetY = window.scrollY + target.getBoundingClientRect().top;
        }

        const clampedY = this.clamp(targetY);

        if (options.immediate) {
            if (this.isAnimating) {
                cancelAnimationFrame(this.rafId);
                this.isAnimating = false;
            }
            this.target = clampedY;
            this.current = clampedY;
            window.scrollTo(window.scrollX, clampedY);
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

        window.removeEventListener("wheel", this.onWheel);
        window.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("touchstart", this.onTouchStart);
        window.removeEventListener("touchmove", this.onTouchMove);
        window.removeEventListener("touchend", this.onTouchEnd);

        this.events = {};
    }
}
