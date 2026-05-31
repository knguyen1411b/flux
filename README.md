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

---

## API Reference

### `new Flux(options?: FluxOptions)`

#### `FluxOptions`

| Option            | Type                  | Default                    | Description                                                                |
| :---------------- | :-------------------- | :------------------------- | :------------------------------------------------------------------------- |
| `lerp`            | `number`              | `0.1`                      | Damping factor for smoothing. Lower values mean smoother, slower movement. |
| `wheelMultiplier` | `number`              | `1.0`                      | Multiplies the native wheel/touch scroll delta.                            |
| `wrapper`         | `HTMLElement\|Window` | `window`                   | The scrollable element container.                                          |
| `content`         | `HTMLElement`         | `document.documentElement` | The content container inside the wrapper (which holds scrollable content). |

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
