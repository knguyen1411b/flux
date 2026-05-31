import { Flux } from "./Flux";

export class FluxRoot extends HTMLElement {
    private fluxInstance: Flux | null = null;

    connectedCallback() {
        if (typeof window === "undefined") return;

        const directionAttr = this.getAttribute("direction");
        const direction =
            directionAttr === "horizontal" ? "horizontal" : "vertical";

        // Apply styles to ensure the custom element behaves as a block scroll wrapper
        if (!this.style.display) this.style.display = "block";
        if (direction === "horizontal") {
            if (!this.style.overflowX) this.style.overflowX = "auto";
            if (!this.style.overflowY) this.style.overflowY = "hidden";
        } else {
            if (!this.style.overflowY) this.style.overflowY = "auto";
            if (!this.style.overflowX) this.style.overflowX = "hidden";
        }
        if (!this.style.position) this.style.position = "relative";

        const lerpAttr = this.getAttribute("lerp");
        const lerp = lerpAttr ? parseFloat(lerpAttr) : undefined;

        const multiplierAttr = this.getAttribute("wheel-multiplier");
        const wheelMultiplier = multiplierAttr
            ? parseFloat(multiplierAttr)
            : undefined;

        // The content element is the first child element of this component
        const content = this.firstElementChild as HTMLElement;

        if (!content) {
            console.warn(
                "[FluxRoot] No content element found inside <flux-root>."
            );
            return;
        }

        this.fluxInstance = new Flux({
            wrapper: this,
            content,
            lerp,
            wheelMultiplier,
            direction
        });
    }

    disconnectedCallback() {
        if (this.fluxInstance) {
            this.fluxInstance.destroy();
            this.fluxInstance = null;
        }
    }

    // Expose the flux instance to allow API control
    public get flux(): Flux | null {
        return this.fluxInstance;
    }
}

// Automatically register custom element if window is available
if (typeof window !== "undefined" && !customElements.get("flux-root")) {
    customElements.define("flux-root", FluxRoot);
}
