# Flux

Flux is a lightweight, performant, and frame-rate independent smooth scrolling library written in TypeScript. It supports LERP-based scrolling, custom duration transitions, touch inertia, scroll locking, and a custom event emitter system.

## Features

- 🚀 **Performance Optimized**: Automatically starts/stops animation frames, consuming zero CPU/GPU overhead when idle.
- 📺 **Frame-Rate Independent**: Uses deltaTime normalization to ensure identical scrolling speed on 60Hz, 120Hz, or 240Hz screens.
- 📱 **Mobile Touch Inertia**: Handles touch events smoothly with built-in inertial momentum scrolling.
- 🛑 **Scroll Locking**: Toggle scrolling behavior globally using simple `.stop()` and `.start()` methods.
- 🎯 **Targeted Scrolling**: Scroll smoothly to specific coordinates, CSS selector strings, or `HTMLElement` references.
- 📈 **Custom Transitions**: Support custom durations and custom easing functions for programmatic scrolling.
- 🔗 **Event-driven**: Listen to scroll position changes and scroll progress updates (`0` to `1`).
- 🛠️ **SSR-Friendly**: Safe to import and instantiate within Next.js, Nuxt, or other SSR frameworks.

---

## Installation

Install using your preferred package manager:

```bash
# pnpm
pnpm add @knguyen1411b/flux

# npm
npm install @knguyen1411b/flux

# yarn
yarn add @knguyen1411b/flux
```

---

## Quick Start

Initialize Flux inside your client-side application:

```typescript
import { Flux } from "@knguyen1411b/flux";

const flux = new Flux({
    lerp: 0.1, // Smoothing factor (0 to 1). Default: 0.1
    wheelMultiplier: 1.0 // Scroll speed multiplier. Default: 1.0
});
```

### Listen to Scroll Events

Track the scroll position and progress (from `0` to `1`):

```typescript
flux.on("scroll", ({ scroll, progress }) => {
    console.log(`Current Scroll Position: ${scroll}px`);
    console.log(`Scroll Progress: ${Math.round(progress * 100)}%`);
});
```

### Programmatic Scrolling

Scroll to coordinates, selectors, or HTML elements:

```typescript
// Scroll to absolute Y position (500px)
flux.scrollTo(500);

// Scroll instantly (no animation)
flux.scrollTo(500, { immediate: true });

// Scroll to an element with custom duration (in seconds) and cubic easing
flux.scrollTo("#section-2", {
    duration: 1.2,
    easing: (t) => 1 - Math.pow(1 - t, 3) // Cubic ease-out
});

// Scroll to a direct element reference
const targetElement = document.querySelector(".box");
flux.scrollTo(targetElement);
```

### Scroll Locking

Disable and enable scrolling dynamically:

```typescript
// Stop/Freeze scrolling (wheel and touch events are locked)
flux.stop();

// Re-enable scrolling
flux.start();
```

### Cleanup

Unbind all event listeners and cancel active animation frames when destroying components:

```typescript
flux.destroy();
```

### Custom Scroll Containers

By default, Flux smooth scrolls the global window. If you want to enable smooth scrolling inside a specific scrollable element (like a nested `div`), pass `wrapper` and `content` references:

```html
<!-- Wrapper: the scrollable box with fixed height and overflow -->
<div class="my-wrapper" style="height: 400px; overflow-y: auto;">
    <!-- Content: the inner wrapper containing tall content -->
    <div class="my-content">
        <p>Lots of content...</p>
    </div>
</div>
```

```typescript
import { Flux } from "@knguyen1411b/flux";

const flux = new Flux({
    wrapper: document.querySelector(".my-wrapper"),
    content: document.querySelector(".my-content")
});
```

#### Declarative HTML Wrapper (`<flux-root>`)

For a purely declarative, HTML-only setup, you can wrap your scrollable content inside a custom `<flux-root>` Web Component. The first child element inside `<flux-root>` is automatically treated as the scrollable content:

```html
<!-- Set up custom scrolling declaratively with attributes -->
<flux-root lerp="0.08" wheel-multiplier="1.2" style="height: 400px;">
    <div>
        <p>Lots of content here...</p>
    </div>
</flux-root>
```

You can access the active JavaScript controller instance directly via the DOM element's `.flux` property:

```typescript
const fluxRoot = document.querySelector("flux-root");
// Access the underlaying Flux controller
fluxRoot.flux.scrollTo(200);
```

### React & Next.js (SSR) Integration

Flux provides a built-in React integration (`ReactFlux` component and `useFlux` hook). It is SSR-friendly and handles setup/cleanup automatically.

#### 1. Page-Level (Root) Scroll

To enable smooth scrolling across the entire page, wrap your root layout with `<ReactFlux root>` (default is `root = true`):

```tsx
"use client";

import { ReactFlux } from "@knguyen1411b/flux";

export default function Layout({ children }) {
    return (
        <ReactFlux root options={{ lerp: 0.1 }}>
            {children}
        </ReactFlux>
    );
}
```

#### 2. Custom Container Scroll

To make a specific container scrollable and smooth, set `root={false}`:

```tsx
"use client";

import { ReactFlux } from "@knguyen1411b/flux";

export default function ScrollableBox() {
    return (
        <ReactFlux
            root={false}
            options={{ lerp: 0.08 }}
            style={{ height: "400px" }}
        >
            <p>Lots of content inside here will scroll smoothly...</p>
        </ReactFlux>
    );
}
```

#### 3. Using the `useFlux` Hook

You can access the active `Flux` instance from any child component inside the `<ReactFlux>` provider to trigger actions like scrolling to sections:

```tsx
"use client";

import { useFlux } from "@knguyen1411b/flux";

export default function ScrollButton() {
    const flux = useFlux();

    return (
        <button onClick={() => flux?.scrollTo("#contact")}>
            Scroll to Contact
        </button>
    );
}
```

---

## API Reference

### `new Flux(options?: FluxOptions)`

#### `FluxOptions`

| Option            | Type                       | Default                    | Description                                                                |
| :---------------- | :------------------------- | :------------------------- | :------------------------------------------------------------------------- |
| `lerp`            | `number`                   | `0.1`                      | Damping factor for smoothing. Lower values mean smoother, slower movement. |
| `wheelMultiplier` | `number`                   | `1.0`                      | Multiplies the native wheel/touch scroll delta.                            |
| `wrapper`         | `HTMLElement\|Window`      | `window`                   | The scrollable element container.                                          |
| `content`         | `HTMLElement`              | `document.documentElement` | The content container inside the wrapper (which holds scrollable content). |
| `direction`       | `"vertical"\|"horizontal"` | `"vertical"`               | The direction of the smooth scrolling.                                     |

### Methods

#### `flux.scrollTo(target, options?)`

Scrolls the viewport to a target position.

- **`target`**: `number` | `string` | `HTMLElement`
- **`options`**:
    - `immediate` (`boolean`): If `true`, instantly moves to the position without animation.
    - `duration` (`number`): Fixed-duration of the animation in seconds.
    - `easing` (`(t: number) => number`): Custom easing function. Defaults to cubic ease-out.

#### `flux.stop()`

Blocks all scroll inputs (wheel and touch drag).

#### `flux.start()`

Unblocks scroll inputs.

#### `flux.on(event, callback)`

Listens to a library event.

- **`event`**: `"scroll"`
- **`callback`**: `(data: { scroll: number, progress: number }) => void`

#### `flux.off(event, callback)`

Removes an event listener.

#### `flux.destroy()`

Cleans up all DOM listeners and cancels animation loops.

### Getters and Setters

- **`flux.scroll`** (`number`, read-only): The current smooth scroll position.
- **`flux.progress`** (`number`, read-only): The current scroll progress percentage from `0` to `1`.
- **`flux.direction`** (`"vertical" | "horizontal"`, read-only): The scroll direction.
- **`flux.lerp`** (`number`): Getter and setter for the damping factor.
- **`flux.wheelMultiplier`** (`number`): Getter and setter for the wheel scroll multiplier.

---

## GSAP ScrollTrigger Integration

To integrate Flux with GSAP's `ScrollTrigger`, use a scroll proxy to sync the custom scroll positions:

```javascript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flux } from "@knguyen1411b/flux";

gsap.registerPlugin(ScrollTrigger);

const flux = new Flux({
    lerp: 0.1
});

// Update ScrollTrigger on scroll
flux.on("scroll", () => {
    ScrollTrigger.update();
});

// Tell ScrollTrigger to use Flux's scroll value
ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
        if (arguments.length) {
            flux.scrollTo(value, { immediate: true });
        }
        return flux.scroll;
    },
    getBoundingClientRect() {
        return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
    },
    pinType: document.body.style.transform ? "transform" : "fixed"
});

// Sync ScrollTrigger's default getter
ScrollTrigger.defaults({ scroller: document.body });
```

---

## Accessibility (prefers-reduced-motion)

Flux has native support for the `prefers-reduced-motion` media query. If a user has enabled reduced motion in their operating system, Flux will automatically fall back to instant scrolling (setting the `lerp` factor to `1.0`) to avoid causing motion sickness.

---

## Development

```bash
# Install dependencies
pnpm install

# Build ES/CJS bundles
pnpm build

# Run Lint checks
pnpm lint

# Format code
pnpm format:write

# Run Typecheck
pnpm typecheck
```

---

## License

ISC License.
